"use client";

import { ArrowLeft, Crown, Medal, Trophy, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useExamRoomConnection } from "@/features/group-exam/useExamRoomConnection";
import {
  buildGroupExamLeaderboard,
  normalizeExamRoomCode,
  readGroupExamHistoryEntry,
  readHostedExamRoom,
  readJoinedExamRoom,
  removeJoinedExamRoom,
  saveHostedExamRoom,
  saveGroupExamHistoryEntry,
  saveJoinedExamRoom,
  type GroupExamLeaderboardEntry,
  type GroupExamHistoryEntry,
  type HostedExamRoom,
  type JoinedExamRoom,
} from "@/lib/group-exam";
import { AppRoute } from "@/lib/routes";
import { getOrCreateUserId } from "@/lib/learning-storage";

type ResultRoom =
  | { role: "host"; room: HostedExamRoom }
  | { role: "participant"; room: JoinedExamRoom };

function completeRoomWhenAllSubmitted(room: HostedExamRoom) {
  const expectedUserIds = new Set([
    room.hostUserId,
    ...room.participants.map((participant) => participant.userId),
  ]);
  const submittedUserIds = new Set(room.results.map((result) => result.userId));
  return expectedUserIds.size > 0 &&
    [...expectedUserIds].every((userId) => submittedUserIds.has(userId))
    ? { ...room, status: "completed" as const }
    : room;
}

type LoadedResults =
  | ResultRoom
  | {
      role: "stored";
      roomRole: "host" | "participant";
      history: GroupExamHistoryEntry;
    };

function StoredResultsBoard({ history }: { history: GroupExamHistoryEntry }) {
  const currentUser = history.leaderboard.find(
    (entry) => entry.userId === history.userId,
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl bg-surface px-4 pb-28 pt-8 sm:px-5">
      <Link
        href={AppRoute.Statistics}
        className="inline-flex items-center gap-2 text-sm font-bold text-primary"
      >
        <ArrowLeft className="size-[var(--icon-sm)]" />
        Thống kê
      </Link>
      <header className="mt-7 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-on-primary">
          <Trophy className="size-[var(--icon-lg)]" />
        </span>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Phòng {history.roomCode}
        </p>
        <h1 className="mt-2 font-headline text-3xl font-bold">
          Kết quả đã lưu
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Bản xếp hạng được lưu trên thiết bị này
        </p>
      </header>

      {history.result && (
        <section className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-primary px-5 py-4 text-on-primary">
          <div>
            <p className="text-xs text-on-primary/75">Kết quả của bạn</p>
            <p className="mt-1 font-headline text-xl font-bold">
              {currentUser?.rank ? `Hạng ${currentUser.rank}` : "Đã hoàn thành"}
            </p>
          </div>
          <p className="font-headline text-2xl font-bold">
            {history.result.correctCount}/20
          </p>
        </section>
      )}

      <section className="mt-6 overflow-hidden rounded-2xl border border-surface-container bg-surface-container-lowest">
        {history.leaderboard.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-on-surface-variant">
            Chưa có snapshot bảng xếp hạng trên thiết bị này.
          </p>
        ) : (
          history.leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className="flex items-center gap-3 border-b border-surface-container p-4 last:border-b-0"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-container-low text-on-surface-variant">
                {entry.rank === 1 ? (
                  <Crown className="size-[var(--icon-sm)]" />
                ) : (
                  <Medal className="size-[var(--icon-sm)]" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">
                  {entry.name}
                  {entry.userId === history.userId ? " (Bạn)" : ""}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {entry.submitted ? `Hạng ${entry.rank}` : "Chưa nộp bài"}
                </p>
              </div>
              <p className="font-headline font-bold">
                {entry.submitted ? `${entry.correctCount}/20` : "—"}
              </p>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

function ResultsBoard({ initial }: { initial: ResultRoom }) {
  const router = useRouter();
  const { role } = initial;
  const roomCode = initial.room.roomCode;
  const userId =
    role === "host" ? initial.room.hostUserId : initial.room.participantUserId;
  const name =
    role === "host" ? initial.room.hostName : initial.room.participantName;
  const [hostedRoom, setHostedRoom] = useState<HostedExamRoom | null>(
    role === "host"
      ? completeRoomWhenAllSubmitted({
          ...initial.room,
          results: initial.room.results ?? [],
        })
      : null,
  );
  const [participantRoom, setParticipantRoom] = useState<JoinedExamRoom | null>(
    role === "participant" ? initial.room : null,
  );

  const leaderboard = useMemo(
    () =>
      hostedRoom
        ? buildGroupExamLeaderboard(
            { userId: hostedRoom.hostUserId, name: hostedRoom.hostName },
            hostedRoom.participants,
            hostedRoom.results,
          )
        : (participantRoom?.leaderboard ?? []),
    [hostedRoom, participantRoom?.leaderboard],
  );

  const updateHostedRoom = useCallback(
    (update: (current: HostedExamRoom) => HostedExamRoom) => {
      setHostedRoom((current) => {
        if (!current) return current;
        const next = completeRoomWhenAllSubmitted(update(current));
        saveHostedExamRoom(next);
        return next;
      });
    },
    [],
  );

  const { status, sendResult, sendLeaderboard } = useExamRoomConnection({
    roomCode,
    role,
    userId,
    name,
    activeStart:
      hostedRoom?.status === "started" ? (hostedRoom.start ?? null) : null,
    activeRoomState: hostedRoom
      ? { status: hostedRoom.status, start: hostedRoom.start }
      : null,
    onParticipant:
      role === "host"
        ? (participant) =>
            updateHostedRoom((current) => ({
              ...current,
              participants: current.participants.some(
                (item) => item.userId === participant.userId,
              )
                ? current.participants.map((item) =>
                    item.userId === participant.userId
                      ? { ...item, ...participant, joinedAt: item.joinedAt }
                      : item,
                  )
                : current.status === "lobby"
                  ? [...current.participants, participant]
                  : current.participants,
            }))
        : undefined,
    onResult:
      role === "host"
        ? (result, peerId) =>
            updateHostedRoom((current) => {
              const participant = current.participants.find(
                (item) => item.peerId === peerId,
              );
              if (!participant || participant.userId !== result.userId) {
                return current;
              }
              return {
                ...current,
                results: [
                  ...current.results.filter(
                    (item) => item.userId !== result.userId,
                  ),
                  result,
                ],
              };
            })
        : undefined,
    onLeaderboard: (nextLeaderboard) => {
      if (role !== "participant" || !participantRoom) return;
      const next = { ...participantRoom, leaderboard: nextLeaderboard };
      setParticipantRoom(next);
      saveJoinedExamRoom(next);
    },
    onRoomState: (roomState) => {
      if (role !== "participant" || !participantRoom) return;
      const next = { ...participantRoom, status: roomState.status };
      setParticipantRoom(next);
      saveJoinedExamRoom(next);
    },
    onRoomClosed: () => {
      if (role !== "participant") return;
      removeJoinedExamRoom(roomCode);
      router.replace(AppRoute.ExamRoom);
    },
    onKicked: () => {
      if (role !== "participant") return;
      removeJoinedExamRoom(roomCode);
      router.replace(
        `${AppRoute.JoinExamRoom}?code=${roomCode}&resume=1&kicked=1`,
      );
    },
  });

  useEffect(() => {
    if (role === "host" && leaderboard.length > 0) {
      void sendLeaderboard(leaderboard);
    }
  }, [leaderboard, role, sendLeaderboard]);

  const allResultsSubmitted =
    leaderboard.length > 0 && leaderboard.every((entry) => entry.submitted);

  useEffect(() => {
    if (
      role === "participant" &&
      status === "connected" &&
      participantRoom?.result
    ) {
      void sendResult(participantRoom.result);
    }
  }, [participantRoom?.result, role, sendResult, status]);

  const currentUser = leaderboard.find((entry) => entry.userId === userId);
  const submittedCount = leaderboard.filter((entry) => entry.submitted).length;

  useEffect(() => {
    const start = initial.room.start;
    if (!start) return;
    const result =
      role === "host"
        ? (hostedRoom?.results.find((item) => item.userId === userId) ?? null)
        : (participantRoom?.result ?? null);
    const previous = readGroupExamHistoryEntry(roomCode, role, userId);
    saveGroupExamHistoryEntry({
      version: 1,
      roomCode,
      role,
      userId,
      name,
      hostName: role === "host" ? name : initial.room.hostName,
      status:
        role === "host"
          ? (hostedRoom?.status ?? "completed")
          : (participantRoom?.status ?? "completed"),
      questionSetHash: start.questionSetHash,
      startedAt: start.startedAt,
      expiresAt: start.expiresAt,
      submittedAt:
        result && !previous?.submittedAt
          ? new Date().toISOString()
          : (previous?.submittedAt ?? null),
      result,
      leaderboard,
      updatedAt: new Date().toISOString(),
    });
  }, [
    hostedRoom?.results,
    hostedRoom?.status,
    initial.room,
    leaderboard,
    name,
    participantRoom?.result,
    participantRoom?.status,
    role,
    roomCode,
    userId,
  ]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl bg-surface px-4 pb-28 pt-8 sm:px-5">
      <Link
        href={AppRoute.ExamRoom}
        className="inline-flex items-center gap-2 text-sm font-bold text-primary"
      >
        <ArrowLeft className="size-[var(--icon-sm)]" />
        Phòng thi
      </Link>

      <header className="mt-7 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-on-primary">
          <Trophy className="size-[var(--icon-lg)]" />
        </span>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Phòng {roomCode}
        </p>
        <h1 className="mt-2 font-headline text-3xl font-bold">Bảng xếp hạng</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          {allResultsSubmitted
            ? "Phòng đã hoàn tất · Đã nhận đủ kết quả"
            : `Đã nhận ${submittedCount}/${leaderboard.length} kết quả`}
        </p>
      </header>

      {currentUser?.submitted && (
        <section className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-primary px-5 py-4 text-on-primary">
          <div>
            <p className="text-xs text-on-primary/75">Kết quả của bạn</p>
            <p className="mt-1 font-headline text-xl font-bold">
              Hạng {currentUser.rank}
            </p>
          </div>
          <p className="font-headline text-2xl font-bold">
            {currentUser.correctCount}/20
          </p>
        </section>
      )}

      <section className="mt-6 overflow-hidden rounded-2xl border border-surface-container bg-surface-container-lowest">
        {leaderboard.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-on-surface-variant">
            Đang chờ bảng xếp hạng từ chủ phòng…
          </p>
        ) : (
          leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className="flex items-center gap-3 border-b border-surface-container p-4 last:border-b-0"
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-full font-bold ${
                  entry.rank === 1
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-low text-on-surface-variant"
                }`}
              >
                {entry.submitted ? (
                  entry.rank === 1 ? (
                    <Crown className="size-[var(--icon-sm)]" />
                  ) : entry.rank <= 3 ? (
                    <Medal className="size-[var(--icon-sm)]" />
                  ) : (
                    entry.rank
                  )
                ) : (
                  <UserRound className="size-[var(--icon-sm)]" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">
                  {entry.name}
                  {entry.userId === userId ? " (Bạn)" : ""}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {entry.submitted ? `Hạng ${entry.rank}` : "Đang làm bài"}
                </p>
              </div>
              <p className="font-headline font-bold">
                {entry.submitted ? `${entry.correctCount}/20` : "—"}
              </p>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const roomCode = normalizeExamRoomCode(searchParams.get("room") ?? "");
  const role = searchParams.get("role");
  const [initial, setInitial] = useState<LoadedResults | null | undefined>();

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      if (role === "host") {
        const room = readHostedExamRoom(roomCode);
        const history = readGroupExamHistoryEntry(
          roomCode,
          role,
          getOrCreateUserId(),
        );
        setInitial(
          room
            ? { role, room }
            : history
              ? { role: "stored", roomRole: role, history }
              : null,
        );
      } else if (role === "participant") {
        const room = readJoinedExamRoom(roomCode);
        const history = readGroupExamHistoryEntry(
          roomCode,
          role,
          getOrCreateUserId(),
        );
        setInitial(
          room
            ? { role, room }
            : history
              ? { role: "stored", roomRole: role, history }
              : null,
        );
      } else {
        setInitial(null);
      }
    });
    return () => cancelAnimationFrame(frameId);
  }, [role, roomCode]);

  if (initial === undefined) return null;
  if (!initial) {
    return (
      <main className="grid min-h-screen place-items-center bg-surface px-4">
        <Link href={AppRoute.ExamRoom} className="font-bold text-primary">
          Không tìm thấy phòng · Quay lại
        </Link>
      </main>
    );
  }

  return initial.role === "stored" ? (
    <StoredResultsBoard history={initial.history} />
  ) : (
    <ResultsBoard initial={initial} />
  );
}

export default function GroupExamResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsContent />
    </Suspense>
  );
}
