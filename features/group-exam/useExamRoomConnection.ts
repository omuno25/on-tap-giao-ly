"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
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
const ROOM_JOIN_ERROR_RETRY_DELAY_MS = 2_000;
const ROOM_HANDSHAKE_TIMEOUT_MS = 20_000;
const ROOM_HEARTBEAT_INTERVAL_MS = 15_000;
const ROOM_HEARTBEAT_TIMEOUT_MS = 5_000;
const ROOM_HEARTBEAT_FAILURE_LIMIT = 2;
let previousRoomLeave: Promise<void> = Promise.resolve();
let closeErrorFilterUsers = 0;
let restoreCloseErrorFilterTimer: number | null = null;
let originalConsoleError: typeof console.error | null = null;

type ConnectionStatus = "connecting" | "connected" | "disconnected";

type TurnServerConfig = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

type IdentityPayload = {
  role: "host" | "participant";
  userId: string;
  name: string;
  rejoinRequested?: boolean;
};

function subscribeToOnlineStatus(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getServerOnlineSnapshot() {
  return true;
}

function isIntentionalCloseError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  return message.includes("Close called") || message.includes("room left");
}

async function fetchTurnConfig(): Promise<TurnServerConfig[]> {
  const response = await fetch("/api/turn-credentials", {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Không thể lấy TURN credential");

  const payload = (await response.json()) as {
    turnConfig?: TurnServerConfig[];
  };
  if (!Array.isArray(payload.turnConfig)) {
    throw new Error("Cấu hình TURN không hợp lệ");
  }
  return payload.turnConfig;
}

async function pingWithTimeout(room: Room, peerId: string) {
  let timeoutId: number | undefined;
  try {
    await Promise.race([
      room.ping(peerId),
      new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(new Error("Heartbeat timeout"));
        }, ROOM_HEARTBEAT_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }
}

function installIntentionalCloseErrorFilter() {
  closeErrorFilterUsers += 1;
  if (restoreCloseErrorFilterTimer !== null) {
    window.clearTimeout(restoreCloseErrorFilterTimer);
    restoreCloseErrorFilterTimer = null;
  }
  if (originalConsoleError) return;

  originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const isTrysteroPeerError = args.some(
      (arg) => typeof arg === "string" && arg.includes("Trystero peer error"),
    );
    if (isTrysteroPeerError && args.some(isIntentionalCloseError)) return;
    originalConsoleError?.(...args);
  };
}

function scheduleIntentionalCloseErrorFilterRemoval() {
  closeErrorFilterUsers = Math.max(0, closeErrorFilterUsers - 1);
  if (closeErrorFilterUsers > 0 || restoreCloseErrorFilterTimer !== null)
    return;

  // Peer WebRTC có thể báo abort sau khi room.leave() đã resolve.
  restoreCloseErrorFilterTimer = window.setTimeout(() => {
    if (closeErrorFilterUsers === 0 && originalConsoleError) {
      console.error = originalConsoleError;
      originalConsoleError = null;
    }
    restoreCloseErrorFilterTimer = null;
  }, 2_000);
}

type UseExamRoomConnectionOptions = {
  enabled?: boolean;
  roomCode: string;
  role: IdentityPayload["role"];
  userId: string;
  name: string;
  reconnectToken?: number;
  rejoinRequested?: boolean;
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
  onKicked?: () => void;
};

function isIdentityPayload(value: unknown): value is IdentityPayload {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as Record<string, unknown>;
  return (
    (payload.role === "host" || payload.role === "participant") &&
    typeof payload.userId === "string" &&
    payload.userId.length > 0 &&
    typeof payload.name === "string" &&
    payload.name.length > 0 &&
    (payload.rejoinRequested === undefined ||
      typeof payload.rejoinRequested === "boolean")
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
  enabled = true,
  roomCode,
  role,
  userId,
  name,
  reconnectToken,
  rejoinRequested = false,
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
  onKicked,
}: UseExamRoomConnectionOptions) {
  const isOnline = useSyncExternalStore(
    subscribeToOnlineStatus,
    getOnlineSnapshot,
    getServerOnlineSnapshot,
  );
  const [transportStatus, setTransportStatus] =
    useState<Exclude<ConnectionStatus, "disconnected">>("connecting");
  const [automaticReconnectToken, setAutomaticReconnectToken] = useState(0);
  const roomRef = useRef<Room | null>(null);
  const rejoinRequestedRef = useRef(rejoinRequested);
  const identityActionRef = useRef<MessageAction<JsonValue> | null>(null);
  const startActionRef = useRef<MessageAction<JsonValue> | null>(null);
  const resultActionRef = useRef<MessageAction<JsonValue> | null>(null);
  const leaderboardActionRef = useRef<MessageAction<JsonValue> | null>(null);
  const roomClosedActionRef = useRef<MessageAction<JsonValue> | null>(null);
  const roomStateActionRef = useRef<MessageAction<JsonValue> | null>(null);
  const kickActionRef = useRef<MessageAction<JsonValue> | null>(null);
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
    onKicked,
  });

  useEffect(() => {
    rejoinRequestedRef.current = rejoinRequested;
  }, [rejoinRequested]);

  useEffect(() => {
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
      onKicked,
    };
  }, [
    activeRoomState,
    activeStart,
    onHost,
    onKicked,
    onLeaderboard,
    onParticipant,
    onParticipantLeave,
    onResult,
    onRoomClosed,
    onRoomState,
    onStart,
  ]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let running = false;
    let consecutiveFailures = 0;

    const heartbeat = async () => {
      if (cancelled || running || document.hidden || !isOnline) {
        return;
      }

      const room = roomRef.current;
      if (!room) return;

      const peerIds =
        role === "participant"
          ? hostPeerIdRef.current
            ? [hostPeerIdRef.current]
            : []
          : Object.keys(room.getPeers());
      if (peerIds.length === 0) return;

      running = true;
      try {
        await Promise.all(
          peerIds.map((peerId) => pingWithTimeout(room, peerId)),
        );
        consecutiveFailures = 0;
      } catch (error) {
        if (roomRef.current !== room) return;
        // Heartbeat chạy âm thầm. Host không reconnect cả phòng chỉ vì một
        // participant lỗi; participant chỉ reconnect sau nhiều lần mất host.
        if (role === "participant") {
          consecutiveFailures += 1;
          if (consecutiveFailures >= ROOM_HEARTBEAT_FAILURE_LIMIT) {
            consecutiveFailures = 0;
            console.warn(
              "Heartbeat tới chủ phòng thất bại, đang kết nối lại:",
              error,
            );
            if (!cancelled) {
              setTransportStatus("connecting");
              setAutomaticReconnectToken((current) => current + 1);
            }
          }
        }
      } finally {
        running = false;
      }
    };

    const intervalId = window.setInterval(
      () => void heartbeat(),
      ROOM_HEARTBEAT_INTERVAL_MS,
    );
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [enabled, isOnline, role]);

  useEffect(() => {
    if (!enabled) return;
    installIntentionalCloseErrorFilter();
    let cancelled = false;
    let room: Room | null = null;
    let identityRetryIntervalId: number | null = null;
    let joinErrorRetryTimeoutId: number | null = null;

    async function connect() {
      if (!roomCode || !userId) return;
      if (!isOnline) return;
      setTransportStatus("connecting");

      try {
        await previousRoomLeave;
        if (cancelled) return;
        // Trystero cần thêm một nhịp sau khi leave() resolve để dọn room/peer
        // cũ trước khi join lại đúng room ID.
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, ROOM_REJOIN_DELAY_MS);
        });
        if (cancelled) return;
        const [{ joinRoom }, turnConfig] = await Promise.all([
          import("trystero"),
          fetchTurnConfig().catch((error) => {
            // Giữ STUN mặc định để local/dev vẫn có thể kết nối trực tiếp.
            console.warn("TURN không khả dụng, đang dùng STUN:", error);
            return [];
          }),
        ]);
        if (cancelled) return;

        room = joinRoom({ ...ROOM_CONFIG, turnConfig }, `exam-${roomCode}`, {
          handshakeTimeoutMs: ROOM_HANDSHAKE_TIMEOUT_MS,
          onJoinError(details) {
            console.warn("Không thể kết nối một peer P2P:", details);
            // Room của host vẫn mở nếu chỉ một peer kết nối thất bại. Với
            // participant chưa nhận diện được host thì peer lỗi cũng có thể
            // chính là host. Retry sau một nhịp; nếu host khác đã kết nối
            // thành công trong lúc chờ thì không khởi tạo lại cả room.
            if (cancelled || role !== "participant") return;
            const knownHostPeerId = hostPeerIdRef.current;
            if (knownHostPeerId && details.peerId !== knownHostPeerId) return;

            setTransportStatus("connecting");
            if (joinErrorRetryTimeoutId !== null) return;
            joinErrorRetryTimeoutId = window.setTimeout(() => {
              joinErrorRetryTimeoutId = null;
              if (cancelled || hostPeerIdRef.current) return;
              setAutomaticReconnectToken((current) => current + 1);
            }, ROOM_JOIN_ERROR_RETRY_DELAY_MS);
          },
        });
        roomRef.current = room;
        const identityAction = room.makeAction<JsonValue>("identity");
        const startAction = room.makeAction<JsonValue>("exam-start");
        const resultAction = room.makeAction<JsonValue>("exam-result");
        const leaderboardAction = room.makeAction<JsonValue>("leaderboard");
        const roomClosedAction = room.makeAction<JsonValue>("room-closed");
        const roomStateAction = room.makeAction<JsonValue>("room-state");
        const kickAction = room.makeAction<JsonValue>("room-kick");
        identityActionRef.current = identityAction;
        startActionRef.current = startAction;
        resultActionRef.current = resultAction;
        leaderboardActionRef.current = leaderboardAction;
        roomClosedActionRef.current = roomClosedAction;
        roomStateActionRef.current = roomStateAction;
        kickActionRef.current = kickAction;

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
              rejoinRequested: data.rejoinRequested === true,
            });
            // Phản hồi trực tiếp để participant vẫn nhận diện được host nếu
            // identity gửi trong onPeerJoin bị signaling làm trễ hoặc thất lạc.
            void identityAction
              .send({ role, userId, name }, { target: peerId })
              .catch((error) => {
                if (!isIntentionalCloseError(error)) {
                  console.error(
                    "Không thể phản hồi danh tính chủ phòng:",
                    error,
                  );
                }
              });
          } else if (role === "participant" && data.role === "host") {
            hostPeerIdRef.current = peerId;
            setTransportStatus("connected");
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
          if (role === "participant" && peerId === hostPeerIdRef.current) {
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

        kickAction.onMessage = (_, { peerId }) => {
          if (role === "participant" && peerId === hostPeerIdRef.current) {
            callbacksRef.current.onKicked?.();
          }
        };

        room.onPeerJoin = (peerId) => {
          void identityAction
            .send(
              {
                role,
                userId,
                name,
                ...(role === "participant" && rejoinRequestedRef.current
                  ? { rejoinRequested: true }
                  : {}),
              },
              { target: peerId },
            )
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
            setTransportStatus("connecting");
            setAutomaticReconnectToken((current) => current + 1);
          }
        };

        if (role === "participant") {
          // Sau khi bị kick, room cũ đóng rồi được tạo lại khá nhanh. Gửi lại
          // yêu cầu nhận diện tới khi host xác nhận thay vì phụ thuộc hoàn toàn
          // vào một lần onPeerJoin.
          identityRetryIntervalId = window.setInterval(() => {
            if (cancelled || hostPeerIdRef.current) return;
            void identityAction
              .send({
                role,
                userId,
                name,
                ...(rejoinRequestedRef.current
                  ? { rejoinRequested: true }
                  : {}),
              })
              .catch((error) => {
                if (!isIntentionalCloseError(error)) {
                  console.error("Không thể gửi lại yêu cầu vào phòng:", error);
                }
              });
          }, 2_000);
        }

        if (role === "host") setTransportStatus("connected");
      } catch {
        if (!cancelled) {
          setTransportStatus("connecting");
        }
      }
    }

    // Trì hoãn việc khởi tạo; connect() còn đợi leave hoàn tất và chờ thêm
    // một nhịp trước khi join lại để không nhận instance phòng đang đóng.
    const connectTimer = window.setTimeout(() => {
      void connect();
    }, ROOM_REJOIN_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(connectTimer);
      if (identityRetryIntervalId !== null) {
        window.clearInterval(identityRetryIntervalId);
      }
      if (joinErrorRetryTimeoutId !== null) {
        window.clearTimeout(joinErrorRetryTimeoutId);
      }
      identityActionRef.current = null;
      startActionRef.current = null;
      resultActionRef.current = null;
      leaderboardActionRef.current = null;
      roomClosedActionRef.current = null;
      roomStateActionRef.current = null;
      kickActionRef.current = null;
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
      scheduleIntentionalCloseErrorFilterRemoval();
    };
  }, [
    enabled,
    isOnline,
    name,
    reconnectToken,
    role,
    roomCode,
    userId,
    automaticReconnectToken,
  ]);

  useEffect(() => {
    if (role !== "host" || !activeRoomState) return;
    void roomStateActionRef.current
      ?.send(activeRoomState as unknown as JsonValue)
      .catch((error) => {
        if (!isIntentionalCloseError(error)) {
          console.error("Không thể phát trạng thái phòng:", error);
        }
      });
  }, [activeRoomState, role]);

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

  const sendKick = useCallback(async (peerId: string) => {
    try {
      await kickActionRef.current?.send(true, { target: peerId });
    } catch (error) {
      if (!isIntentionalCloseError(error)) throw error;
    }
  }, []);

  const status: ConnectionStatus =
    enabled && isOnline ? transportStatus : "disconnected";

  return {
    status,
    sendStart,
    sendResult,
    sendLeaderboard,
    sendRoomClosed,
    sendKick,
  };
}
