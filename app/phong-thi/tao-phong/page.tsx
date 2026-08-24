"use client";

import {
  ArrowLeft,
  Check,
  Clock3,
  Copy,
  Crown,
  LogOut,
  Play,
  UserRound,
  UserMinus,
  UserPlus,
  UserX,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useExamRoomConnection } from "@/features/group-exam/useExamRoomConnection";
import { createQuestionSetHash } from "@/lib/exam";
import {
  createExamRoomCode,
  GROUP_EXAM_DURATION_SECONDS,
  readActiveHostedExamRoom,
  readHostedExamRoom,
  removeHostedExamRoom,
  saveHostedExamRoom,
  type ExamRoomParticipant,
  type HostedExamRoom,
} from "@/lib/group-exam";
import { getOrCreateUserId, readLearnerProfile } from "@/lib/learning-storage";
import { AppRoute } from "@/lib/routes";

type HostIdentity = { userId: string; name: string };
type RoomToast = { type: "joined" | "left"; name: string };

export default function CreateExamRoomPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [host, setHost] = useState<HostIdentity | null>(null);
  const [participants, setParticipants] = useState<ExamRoomParticipant[]>([]);
  const participantsRef = useRef<ExamRoomParticipant[]>([]);
  const kickedUserIdsRef = useRef<string[]>([]);
  const [roomToast, setRoomToast] = useState<RoomToast | null>(null);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [kickingUserId, setKickingUserId] = useState<string | null>(null);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const nextHost = {
        userId: getOrCreateUserId(),
        name: readLearnerProfile().name,
      };
      const activeRoom = readActiveHostedExamRoom();
      if (
        activeRoom?.hostUserId === nextHost.userId &&
        activeRoom.status === "completed"
      ) {
        removeHostedExamRoom(activeRoom.roomCode);
      }
      if (
        activeRoom?.hostUserId === nextHost.userId &&
        activeRoom.status === "started" &&
        activeRoom.start
      ) {
        const target =
          activeRoom.results?.some(
            (result) => result.userId === activeRoom.hostUserId,
          ) || Date.parse(activeRoom.start.expiresAt) <= Date.now()
            ? AppRoute.GroupExamResults
            : AppRoute.GroupExam;
        router.replace(`${target}?room=${activeRoom.roomCode}&role=host`);
        return;
      }

      if (
        activeRoom?.hostUserId === nextHost.userId &&
        activeRoom.status === "lobby"
      ) {
        const resumedRoom = {
          ...activeRoom,
          hostName: nextHost.name,
          participants: [],
        };
        setHost(nextHost);
        setRoomCode(activeRoom.roomCode);
        participantsRef.current = [];
        kickedUserIdsRef.current = activeRoom.kickedUserIds;
        saveHostedExamRoom(resumedRoom);
        return;
      }

      const nextRoomCode = createExamRoomCode();
      setHost(nextHost);
      setRoomCode(nextRoomCode);
      kickedUserIdsRef.current = [];
      saveHostedExamRoom({
        version: 1,
        roomCode: nextRoomCode,
        hostUserId: nextHost.userId,
        hostName: nextHost.name,
        createdAt: new Date().toISOString(),
        status: "lobby",
        participants: [],
        kickedUserIds: [],
        results: [],
        start: null,
      });
    });
    return () => cancelAnimationFrame(frameId);
  }, [router]);

  useEffect(() => {
    if (!roomToast) return;
    const timeoutId = window.setTimeout(() => setRoomToast(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [roomToast]);

  const persistRoom = (nextParticipants: ExamRoomParticipant[]) => {
    if (!host) return;
    const currentRoom = readHostedExamRoom(roomCode);
    // Khi phát lệnh bắt đầu, người tham gia rời trang chờ để sang trang thi.
    // Không để sự kiện peer-leave đó ghi đè start vừa lưu bằng dữ liệu lobby.
    if (currentRoom && currentRoom.status !== "lobby") return;
    const room: HostedExamRoom = {
      version: 1,
      roomCode,
      hostUserId: host.userId,
      hostName: host.name,
      createdAt: new Date().toISOString(),
      status: "lobby",
      participants: nextParticipants,
      kickedUserIds: kickedUserIdsRef.current,
      results: [],
      start: null,
    };
    saveHostedExamRoom(room);
  };

  const handleParticipant = (participant: ExamRoomParticipant) => {
    const wasKicked = kickedUserIdsRef.current.includes(participant.userId);
    if (wasKicked && !participant.rejoinRequested) {
      void sendKick(participant.peerId).catch((error) => {
        console.error("Không thể chặn người đã bị mời khỏi phòng:", error);
      });
      return;
    }
    if (wasKicked) {
      kickedUserIdsRef.current = kickedUserIdsRef.current.filter(
        (userId) => userId !== participant.userId,
      );
    }

    const current = participantsRef.current;
    const existing = current.find((item) => item.userId === participant.userId);
    const next = existing
      ? current.map((item) =>
          item.userId === participant.userId
            ? {
                ...item,
                ...participant,
                joinedAt: item.joinedAt,
                connected: true,
              }
            : item,
        )
      : [...current, participant];
    participantsRef.current = next;
    setParticipants(next);
    persistRoom(next);
    if (!existing) setRoomToast({ type: "joined", name: participant.name });
  };

  const handleParticipantLeave = (peerId: string) => {
    const currentRoom = readHostedExamRoom(roomCode);
    if (currentRoom?.status !== "lobby") return;
    const current = participantsRef.current;
    const leavingParticipant = current.find(
      (participant) => participant.peerId === peerId,
    );
    if (!leavingParticipant) return;

    const next = current.filter((participant) => participant.peerId !== peerId);
    participantsRef.current = next;
    setParticipants(next);
    persistRoom(next);
    setRoomToast({ type: "left", name: leavingParticipant.name });
  };

  const { status, sendStart, sendRoomClosed, sendKick } = useExamRoomConnection(
    {
      roomCode,
      role: "host",
      userId: host?.userId ?? "",
      name: host?.name ?? "Chủ phòng",
      activeRoomState: { status: "lobby", start: null },
      onParticipant: handleParticipant,
      onParticipantLeave: handleParticipantLeave,
    },
  );

  const connectedParticipants = useMemo(
    () => participants.filter((participant) => participant.connected),
    [participants],
  );

  const kickParticipant = async (participant: ExamRoomParticipant) => {
    const confirmed = window.confirm(`Mời ${participant.name} ra khỏi phòng?`);
    if (!confirmed) return;

    setKickingUserId(participant.userId);
    if (!kickedUserIdsRef.current.includes(participant.userId)) {
      kickedUserIdsRef.current = [
        ...kickedUserIdsRef.current,
        participant.userId,
      ];
      persistRoom(participantsRef.current);
    }
    try {
      await sendKick(participant.peerId);
      handleParticipantLeave(participant.peerId);
    } catch (error) {
      console.error("Không thể mời người tham gia ra khỏi phòng:", error);
    } finally {
      setKickingUserId(null);
    }
  };

  const copyInvite = async () => {
    const inviteUrl = `${window.location.origin}${AppRoute.JoinExamRoom}?code=${roomCode}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCodeCopied(true);
    window.setTimeout(() => setCodeCopied(false), 1800);
  };

  const startExam = async () => {
    if (!host || connectedParticipants.length === 0 || isStarting) return;
    setIsStarting(true);
    const startedAt = new Date();
    const start = {
      roomCode,
      questionSetHash: createQuestionSetHash(),
      startedAt: startedAt.toISOString(),
      expiresAt: new Date(
        startedAt.getTime() + GROUP_EXAM_DURATION_SECONDS * 1000,
      ).toISOString(),
      durationSeconds: GROUP_EXAM_DURATION_SECONDS,
    };

    saveHostedExamRoom({
      version: 1,
      roomCode,
      hostUserId: host.userId,
      hostName: host.name,
      createdAt: new Date().toISOString(),
      status: "started",
      participants,
      kickedUserIds: kickedUserIdsRef.current,
      results: [],
      start,
    });
    // Không chờ Promise gửi P2P: người tham gia đổi từ lobby sang trang thi có
    // thể làm transport cũ chậm đóng và giữ host ở lại phòng chờ. Trang thi
    // của host sẽ tiếp tục phát activeStart cho peer reconnect.
    void sendStart(start).catch((error) => {
      console.error("Không thể phát lệnh bắt đầu phòng thi:", error);
    });
    router.push(`${AppRoute.GroupExam}?room=${roomCode}&role=host`);
  };

  const closeRoom = async () => {
    if (isClosing) return;
    const confirmed = window.confirm(
      "Đóng phòng thi này? Người tham gia sẽ bị rời phòng và không thể vào lại bằng mã cũ.",
    );
    if (!confirmed) return;

    setIsClosing(true);
    try {
      await sendRoomClosed();
    } finally {
      removeHostedExamRoom(roomCode);
      router.replace(AppRoute.ExamRoom);
    }
  };

  if (!host || !roomCode) {
    return (
      <main className="grid min-h-screen place-items-center bg-surface px-4">
        <p className="text-sm text-on-surface-variant">Đang tạo phòng…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl bg-surface px-4 pb-28 pt-8 sm:px-5">
      <Link
        href={AppRoute.ExamRoom}
        className="inline-flex items-center gap-2 text-sm font-bold text-primary"
      >
        <ArrowLeft className="size-[var(--icon-sm)]" />
        Phòng thi
      </Link>

      <section className="mt-6 rounded-2xl bg-primary p-5 text-on-primary sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-on-primary/70">
              Mã phòng
            </p>
            <div className="mt-2 flex items-center gap-2">
              <h1 className="font-headline text-3xl font-bold tracking-[0.18em] sm:text-4xl">
                {roomCode}
              </h1>
              <button
                type="button"
                onClick={copyRoomCode}
                aria-label={
                  codeCopied ? "Đã sao chép mã phòng" : "Sao chép mã phòng"
                }
                title={codeCopied ? "Đã sao chép" : "Sao chép mã phòng"}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-on-primary/15 text-on-primary transition-colors hover:bg-on-primary/25 active:scale-95"
              >
                {codeCopied ? (
                  <Check className="size-[var(--icon-sm)]" />
                ) : (
                  <Copy className="size-[var(--icon-sm)]" />
                )}
              </button>
            </div>
          </div>
          <span className="grid size-12 place-items-center rounded-full bg-on-primary/15">
            <Crown className="size-[var(--icon-md)]" />
          </span>
        </div>
        <button
          type="button"
          onClick={copyInvite}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-on-primary px-4 py-2.5 text-sm font-bold text-primary"
        >
          {copied ? (
            <Check className="size-[var(--icon-sm)]" />
          ) : (
            <Copy className="size-[var(--icon-sm)]" />
          )}
          {copied ? "Đã sao chép" : "Sao chép link mời"}
        </button>
      </section>

      <section className="mt-4 rounded-2xl border border-surface-container bg-surface-container-lowest p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
          Thông tin bài thi
        </p>
        <div className="mt-3 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Clock3 className="size-[var(--icon-sm)]" />
          </span>
          <div>
            <p className="font-headline font-bold">20 câu · 25 phút</p>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              Mọi người nhận cùng một bộ đề
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6" aria-labelledby="participants-title">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2
              id="participants-title"
              className="font-headline text-xl font-bold"
            >
              Người tham gia
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {connectedParticipants.length} người đang kết nối
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
              status === "disconnected"
                ? "bg-error/10 text-error"
                : "bg-primary/10 text-primary"
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                status === "connected"
                  ? "bg-primary"
                  : status === "connecting"
                    ? "animate-pulse bg-outline"
                    : "bg-error"
              }`}
            />
            {status === "connected"
              ? "Phòng đang mở"
              : status === "connecting"
                ? "Đang kết nối lại…"
                : "Mất kết nối"}
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-surface-container bg-surface-container-lowest">
          <div className="flex items-center gap-3 border-b border-surface-container p-4">
            <span className="grid size-10 place-items-center rounded-full bg-primary text-on-primary">
              <UserRound className="size-[var(--icon-sm)]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{host.name}</p>
              <p className="text-xs text-on-surface-variant">Chủ phòng</p>
            </div>
            <Crown className="size-[var(--icon-sm)] text-primary" />
          </div>

          {participants.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <UsersRound className="mx-auto size-[var(--icon-lg)] text-outline" />
              <p className="mt-3 text-sm text-on-surface-variant">
                Chia sẻ mã phòng để mời bạn bè.
              </p>
            </div>
          ) : (
            participants.map((participant) => (
              <div
                key={participant.userId}
                className="flex items-center gap-3 border-b border-surface-container p-4 last:border-b-0"
              >
                <span className="grid size-10 place-items-center rounded-full bg-surface-container-low text-on-surface-variant">
                  <UserRound className="size-[var(--icon-sm)]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{participant.name}</p>
                  <p className="text-xs text-on-surface-variant">Đã sẵn sàng</p>
                </div>
                <button
                  type="button"
                  disabled={kickingUserId === participant.userId}
                  onClick={() => void kickParticipant(participant)}
                  aria-label={`Mời ${participant.name} ra khỏi phòng`}
                  title="Mời ra khỏi phòng"
                  className="grid size-9 shrink-0 place-items-center rounded-full text-error transition-colors hover:bg-error/10 disabled:opacity-40"
                >
                  <UserX className="size-[var(--icon-sm)]" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <button
        type="button"
        disabled={connectedParticipants.length === 0 || isStarting}
        onClick={startExam}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 font-bold text-on-primary shadow-sm active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Play className="size-[var(--icon-sm)] fill-current" />
        {isStarting ? "Đang bắt đầu…" : "Bắt đầu thi"}
      </button>

      <button
        type="button"
        disabled={isClosing || isStarting}
        onClick={closeRoom}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-error transition-colors hover:bg-error/10 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <LogOut className="size-[var(--icon-sm)]" />
        {isClosing ? "Đang đóng phòng…" : "Đóng và rời phòng"}
      </button>

      {roomToast && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto flex w-full max-w-[var(--app-max-width)] justify-end px-3"
          role="status"
          aria-live="polite"
        >
          <div className="flex max-w-[min(15rem,calc(100vw-1.5rem))] items-center gap-2 rounded-lg border border-surface-container bg-surface-container-lowest px-3 py-2 shadow-md">
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full ${
                roomToast.type === "joined"
                  ? "bg-primary/10 text-primary"
                  : "bg-surface-container-low text-on-surface-variant"
              }`}
            >
              {roomToast.type === "joined" ? (
                <UserPlus className="size-4" />
              ) : (
                <UserMinus className="size-4" />
              )}
            </span>
            <p className="min-w-0 text-xs leading-snug text-on-surface">
              <span className="break-words font-bold">{roomToast.name}</span>{" "}
              {roomToast.type === "joined"
                ? "đã tham gia phòng"
                : "đã rời phòng"}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
