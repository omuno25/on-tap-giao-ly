"use client";

import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  DoorOpen,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useExamRoomConnection } from "@/features/group-exam/useExamRoomConnection";
import {
  EXAM_ROOM_CODE_LENGTH,
  normalizeExamRoomCode,
  readJoinedExamRoom,
  removeJoinedExamRoom,
  saveJoinedExamRoom,
  type GroupExamStart,
} from "@/lib/group-exam";
import {
  getOrCreateUserId,
  readLearnerProfile,
} from "@/lib/learning-storage";
import { AppRoute } from "@/lib/routes";

type Identity = { userId: string; name: string };
type HostIdentity = Identity & { peerId: string };

function ConnectedRoom({ roomCode, user }: { roomCode: string; user: Identity }) {
  const router = useRouter();
  const [host, setHost] = useState<HostIdentity | null>(null);
  const hostRef = useRef<HostIdentity | null>(null);

  const handleHost = (nextHost: HostIdentity) => {
    hostRef.current = nextHost;
    setHost(nextHost);
  };

  const handleStart = (start: GroupExamStart) => {
    const currentHost = hostRef.current;
    if (!currentHost) return;
    saveJoinedExamRoom({
      version: 1,
      roomCode,
      hostUserId: currentHost.userId,
      hostName: currentHost.name,
      participantUserId: user.userId,
      participantName: user.name,
      result: null,
      leaderboard: [],
      start,
    });
    router.replace(`${AppRoute.GroupExam}?room=${roomCode}&role=participant`);
  };

  const { status } = useExamRoomConnection({
    roomCode,
    role: "participant",
    userId: user.userId,
    name: user.name,
    onHost: handleHost,
    onStart: handleStart,
    onRoomState: (roomState) => {
      if (roomState.status === "started" && roomState.start) {
        handleStart(roomState.start);
      } else if (roomState.status === "completed") {
        router.replace(
          `${AppRoute.GroupExamResults}?room=${roomCode}&role=participant`,
        );
      }
    },
    onRoomClosed: () => {
      removeJoinedExamRoom(roomCode);
      router.replace(AppRoute.ExamRoom);
    },
  });

  useEffect(() => {
    if (!host) return;
    const currentRoom = readJoinedExamRoom(roomCode);
    saveJoinedExamRoom({
      version: 1,
      roomCode,
      hostUserId: host.userId,
      hostName: host.name,
      participantUserId: user.userId,
      participantName: user.name,
      result: currentRoom?.result ?? null,
      leaderboard: currentRoom?.leaderboard ?? [],
      start: currentRoom?.start ?? null,
    });
  }, [host, roomCode, user.name, user.userId]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl bg-surface px-4 pb-28 pt-8 sm:px-5">
      <Link
        href={AppRoute.ExamRoom}
        className="inline-flex items-center gap-2 text-sm font-bold text-primary"
      >
        <ArrowLeft className="size-[var(--icon-sm)]" />
        Rời phòng
      </Link>

      <section className="mt-8 rounded-2xl border border-surface-container bg-surface-container-lowest p-6 text-center shadow-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
          {host ? (
            <ShieldCheck className="size-[var(--icon-lg)]" />
          ) : (
            <DoorOpen className="size-[var(--icon-lg)]" />
          )}
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Phòng {roomCode}
        </p>
        <h1 className="mt-2 font-headline text-2xl font-bold">
          {host ? "Đã vào phòng" : "Đang tìm chủ phòng…"}
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          {host
            ? `Chủ phòng: ${host.name}`
            : "Giữ trang này mở trong khi kết nối."}
        </p>

        <div className="mt-6 flex items-center gap-3 rounded-xl bg-surface-container-low p-4 text-left">
          <span className="grid size-10 place-items-center rounded-full bg-primary text-on-primary">
            <UserRound className="size-[var(--icon-sm)]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{user.name}</p>
            <p className="text-xs text-on-surface-variant">Bạn</p>
          </div>
          <span
            className={`size-2.5 rounded-full ${
              status === "connected" ? "bg-primary" : "animate-pulse bg-outline"
            }`}
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-on-surface-variant">
          <Clock3 className="size-[var(--icon-sm)]" />
          {host ? "Đang chờ chủ phòng bắt đầu" : "Đang kết nối P2P"}
        </div>
      </section>
    </main>
  );
}

function JoinExamRoomContent() {
  const searchParams = useSearchParams();
  const initialCode = normalizeExamRoomCode(searchParams.get("code") ?? "");
  const [roomCode, setRoomCode] = useState(initialCode);
  const [activeRoomCode, setActiveRoomCode] = useState(
    searchParams.get("resume") === "1" ? initialCode : "",
  );
  const [user, setUser] = useState<Identity | null>(null);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setUser({
        userId: getOrCreateUserId(),
        name: readLearnerProfile().name,
      });
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  if (activeRoomCode && user) {
    return <ConnectedRoom roomCode={activeRoomCode} user={user} />;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl bg-surface px-4 pb-28 pt-8 sm:px-5">
      <Link
        href={AppRoute.ExamRoom}
        className="inline-flex items-center gap-2 text-sm font-bold text-primary"
      >
        <ArrowLeft className="size-[var(--icon-sm)]" />
        Phòng thi
      </Link>

      <section className="mt-8 rounded-2xl border border-surface-container bg-surface-container-lowest p-6 shadow-sm">
        <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <DoorOpen className="size-[var(--icon-md)]" />
        </span>
        <h1 className="mt-5 font-headline text-2xl font-bold">
          Tham gia phòng thi
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Nhập mã 6 ký tự được chủ phòng chia sẻ.
        </p>

        <label htmlFor="join-room-code" className="mt-6 block text-sm font-bold">
          Mã phòng
        </label>
        <input
          id="join-room-code"
          value={roomCode}
          onChange={(event) =>
            setRoomCode(normalizeExamRoomCode(event.target.value))
          }
          maxLength={EXAM_ROOM_CODE_LENGTH}
          autoComplete="off"
          autoFocus
          placeholder="ABC123"
          className="mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3 text-center font-headline text-lg font-bold uppercase tracking-[0.2em] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          disabled={roomCode.length !== EXAM_ROOM_CODE_LENGTH || !user}
          onClick={() => setActiveRoomCode(roomCode)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-on-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Vào phòng
          <ArrowRight className="size-[var(--icon-sm)]" />
        </button>
      </section>
    </main>
  );
}

export default function JoinExamRoomPage() {
  return (
    <Suspense fallback={null}>
      <JoinExamRoomContent />
    </Suspense>
  );
}
