"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { JsonValue, MessageAction, Room } from "trystero";
import type {
  ExamRoomParticipant,
  GroupExamLeaderboardEntry,
  GroupExamResult,
  GroupExamRoomState,
  GroupExamStart,
} from "@/lib/group-exam";

const ROOM_CONFIG = { appId: "on-tap-giao-ly-group-exam-v1" } as const;
const ROOM_REJOIN_DELAY_MS = 150;
let previousRoomLeave: Promise<void> = Promise.resolve();

type ConnectionStatus = "connecting" | "connected" | "disconnected";

type IdentityPayload = {
  role: "host" | "participant";
  userId: string;
  name: string;
};

function isIntentionalCloseError(error: unknown) {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return message.includes("Close called") || message.includes("room left");
}

type UseExamRoomConnectionOptions = {
  roomCode: string;
  role: IdentityPayload["role"];
  userId: string;
  name: string;
  onParticipant?: (participant: ExamRoomParticipant) => void;
  onParticipantLeave?: (peerId: string) => void;
  onHost?: (host: { userId: string; name: string; peerId: string }) => void;
  onStart?: (start: GroupExamStart) => void;
  activeStart?: GroupExamStart | null;
  activeRoomState?: GroupExamRoomState | null;
  onRoomState?: (state: GroupExamRoomState) => void;
  onResult?: (result: GroupExamResult, peerId: string) => void;
  onLeaderboard?: (leaderboard: GroupExamLeaderboardEntry[]) => void;
  onRoomClosed?: () => void;
};

function isIdentityPayload(value: unknown): value is IdentityPayload {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as Record<string, unknown>;
  return (
    (payload.role === "host" || payload.role === "participant") &&
    typeof payload.userId === "string" &&
    payload.userId.length > 0 &&
    typeof payload.name === "string" &&
    payload.name.length > 0
  );
}

function isGroupExamStart(value: unknown): value is GroupExamStart {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.roomCode === "string" &&
    typeof payload.questionSetHash === "string" &&
    typeof payload.startedAt === "string" &&
    typeof payload.expiresAt === "string" &&
    typeof payload.durationSeconds === "number" &&
    Number.isFinite(Date.parse(payload.startedAt)) &&
    Number.isFinite(Date.parse(payload.expiresAt))
  );
}

function isGroupExamRoomState(value: unknown): value is GroupExamRoomState {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as Record<string, unknown>;
  return (
    (payload.status === "lobby" ||
      payload.status === "started" ||
      payload.status === "completed") &&
    (payload.start === null || isGroupExamStart(payload.start))
  );
}

function isGroupExamResult(value: unknown): value is GroupExamResult {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.userId === "string" &&
    payload.userId.length > 0 &&
    Number.isInteger(payload.correctCount) &&
    (payload.correctCount as number) >= 0
  );
}

function isLeaderboard(value: unknown): value is GroupExamLeaderboardEntry[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => {
      if (typeof entry !== "object" || entry === null) return false;
      const item = entry as Record<string, unknown>;
      return (
        typeof item.userId === "string" &&
        typeof item.name === "string" &&
        typeof item.correctCount === "number" &&
        typeof item.rank === "number" &&
        typeof item.submitted === "boolean"
      );
    })
  );
}

export function useExamRoomConnection({
  roomCode,
  role,
  userId,
  name,
  onParticipant,
  onParticipantLeave,
  onHost,
  onStart,
  activeStart,
  activeRoomState,
  onRoomState,
  onResult,
  onLeaderboard,
  onRoomClosed,
}: UseExamRoomConnectionOptions) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const roomRef = useRef<Room | null>(null);
  const identityActionRef = useRef<MessageAction<JsonValue> | null>(null);
  const startActionRef = useRef<MessageAction<JsonValue> | null>(null);
  const resultActionRef = useRef<MessageAction<JsonValue> | null>(null);
  const leaderboardActionRef = useRef<MessageAction<JsonValue> | null>(null);
  const roomClosedActionRef = useRef<MessageAction<JsonValue> | null>(null);
  const hostPeerIdRef = useRef<string | null>(null);
  const pendingStartRef = useRef<{
    start: GroupExamStart;
    peerId: string;
  } | null>(null);
  const pendingRoomStateRef = useRef<{
    state: GroupExamRoomState;
    peerId: string;
  } | null>(null);
  const callbacksRef = useRef({
    onParticipant,
    onParticipantLeave,
    onHost,
    onStart,
    activeStart,
    activeRoomState,
    onRoomState,
    onResult,
    onLeaderboard,
    onRoomClosed,
  });

  callbacksRef.current = {
    onParticipant,
    onParticipantLeave,
    onHost,
    onStart,
    activeStart,
    activeRoomState,
    onRoomState,
    onResult,
    onLeaderboard,
    onRoomClosed,
  };

  useEffect(() => {
    let cancelled = false;
    let room: Room | null = null;

    async function connect() {
      if (!roomCode || !userId) return;

      try {
        await previousRoomLeave;
        if (cancelled) return;
        const { joinRoom } = await import("trystero");
        if (cancelled) return;

        room = joinRoom(ROOM_CONFIG, `exam-${roomCode}`);
        roomRef.current = room;
        const identityAction = room.makeAction<JsonValue>("identity");
        const startAction = room.makeAction<JsonValue>("exam-start");
        const resultAction = room.makeAction<JsonValue>("exam-result");
        const leaderboardAction = room.makeAction<JsonValue>("leaderboard");
        const roomClosedAction = room.makeAction<JsonValue>("room-closed");
        const roomStateAction = room.makeAction<JsonValue>("room-state");
        identityActionRef.current = identityAction;
        startActionRef.current = startAction;
        resultActionRef.current = resultAction;
        leaderboardActionRef.current = leaderboardAction;
        roomClosedActionRef.current = roomClosedAction;

        identityAction.onMessage = (data, { peerId }) => {
          if (!isIdentityPayload(data)) return;

          if (role === "host" && data.role === "participant") {
            const now = new Date().toISOString();
            callbacksRef.current.onParticipant?.({
              userId: data.userId,
              name: data.name,
              peerId,
              connected: true,
              joinedAt: now,
              lastSeenAt: now,
            });
          } else if (role === "participant" && data.role === "host") {
            hostPeerIdRef.current = peerId;
            setStatus("connected");
            callbacksRef.current.onHost?.({
              userId: data.userId,
              name: data.name,
              peerId,
            });
            if (pendingStartRef.current?.peerId === peerId) {
              callbacksRef.current.onStart?.(pendingStartRef.current.start);
              pendingStartRef.current = null;
            }
            if (pendingRoomStateRef.current?.peerId === peerId) {
              callbacksRef.current.onRoomState?.(
                pendingRoomStateRef.current.state,
              );
              pendingRoomStateRef.current = null;
            }
          }
        };

        startAction.onMessage = (data, { peerId }) => {
          if (role !== "participant" || !isGroupExamStart(data)) return;
          if (peerId === hostPeerIdRef.current) {
            callbacksRef.current.onStart?.(data);
          } else if (!hostPeerIdRef.current) {
            pendingStartRef.current = { start: data, peerId };
          }
        };

        resultAction.onMessage = (data, { peerId }) => {
          if (role === "host" && isGroupExamResult(data)) {
            callbacksRef.current.onResult?.(data, peerId);
          }
        };

        leaderboardAction.onMessage = (data, { peerId }) => {
          if (
            role === "participant" &&
            peerId === hostPeerIdRef.current &&
            isLeaderboard(data)
          ) {
            callbacksRef.current.onLeaderboard?.(data);
          }
        };

        roomClosedAction.onMessage = (_, { peerId }) => {
          if (
            role === "participant" &&
            peerId === hostPeerIdRef.current
          ) {
            callbacksRef.current.onRoomClosed?.();
          }
        };

        roomStateAction.onMessage = (data, { peerId }) => {
          if (role !== "participant" || !isGroupExamRoomState(data)) return;
          if (peerId === hostPeerIdRef.current) {
            callbacksRef.current.onRoomState?.(data);
          } else if (!hostPeerIdRef.current) {
            pendingRoomStateRef.current = { state: data, peerId };
          }
        };

        room.onPeerJoin = (peerId) => {
          void identityAction
            .send({ role, userId, name }, { target: peerId })
            .catch((error) => {
              if (!isIntentionalCloseError(error)) {
                console.error("Không thể gửi danh tính vào phòng:", error);
              }
            });
          if (role === "host" && callbacksRef.current.activeStart) {
            void startAction
              .send(callbacksRef.current.activeStart as unknown as JsonValue, {
                target: peerId,
              })
              .catch((error) => {
                if (!isIntentionalCloseError(error)) {
                  console.error("Không thể đồng bộ phiên thi:", error);
                }
              });
          }
          if (role === "host" && callbacksRef.current.activeRoomState) {
            void roomStateAction
              .send(
                callbacksRef.current.activeRoomState as unknown as JsonValue,
                { target: peerId },
              )
              .catch((error) => {
                if (!isIntentionalCloseError(error)) {
                  console.error("Không thể đồng bộ trạng thái phòng:", error);
                }
              });
          }
        };

        room.onPeerLeave = (peerId) => {
          if (role === "host") {
            callbacksRef.current.onParticipantLeave?.(peerId);
          } else if (peerId === hostPeerIdRef.current) {
            hostPeerIdRef.current = null;
            setStatus("connecting");
          }
        };

        if (role === "host") setStatus("connected");
      } catch {
        if (!cancelled) setStatus("disconnected");
      }
    }

    // Trystero hoàn tất leave sau khoảng 99 ms. Chờ thêm một nhịp trước khi
    // join lại để không nhận nhầm instance phòng đang đóng.
    const connectTimer = window.setTimeout(() => {
      void connect();
    }, ROOM_REJOIN_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(connectTimer);
      identityActionRef.current = null;
      startActionRef.current = null;
      resultActionRef.current = null;
      leaderboardActionRef.current = null;
      roomClosedActionRef.current = null;
      hostPeerIdRef.current = null;
      pendingStartRef.current = null;
      pendingRoomStateRef.current = null;
      roomRef.current = null;
      if (room) {
        previousRoomLeave = room.leave().catch(() => {
          // Trystero/Nostr rejects with "Close called" when this tab
          // intentionally leaves during navigation or React cleanup.
        });
      }
    };
  }, [name, role, roomCode, userId]);

  const sendStart = useCallback(async (start: GroupExamStart) => {
    try {
      await startActionRef.current?.send(start as unknown as JsonValue);
    } catch (error) {
      if (!isIntentionalCloseError(error)) throw error;
    }
  }, []);

  const sendResult = useCallback(async (result: GroupExamResult) => {
    try {
      await resultActionRef.current?.send(result as unknown as JsonValue);
    } catch (error) {
      if (!isIntentionalCloseError(error)) throw error;
    }
  }, []);

  const sendLeaderboard = useCallback(
    async (leaderboard: GroupExamLeaderboardEntry[]) => {
      try {
        await leaderboardActionRef.current?.send(
          leaderboard as unknown as JsonValue,
        );
      } catch (error) {
        if (!isIntentionalCloseError(error)) throw error;
      }
    },
    [],
  );

  const sendRoomClosed = useCallback(async () => {
    try {
      await roomClosedActionRef.current?.send(true);
    } catch (error) {
      if (!isIntentionalCloseError(error)) throw error;
    }
  }, []);

  return {
    status,
    sendStart,
    sendResult,
    sendLeaderboard,
    sendRoomClosed,
  };
}
