"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useExamRoomConnection } from "@/features/group-exam/useExamRoomConnection";
import MockTest from "@/features/quiz/components/MockTest";
import {
  buildGroupExamLeaderboard,
  GROUP_EXAM_ESSAY_COUNT,
  GROUP_EXAM_OBJECTIVE_COUNT,
  GROUP_EXAM_TRUE_FALSE_COUNT,
  normalizeExamRoomCode,
  readHostedExamRoom,
  readJoinedExamRoom,
  saveHostedExamRoom,
  saveJoinedExamRoom,
  type HostedExamRoom,
  type JoinedExamRoom,
  type GroupExamLeaderboardEntry,
  type GroupExamResult,
} from "@/lib/group-exam";
import { AppRoute } from "@/lib/routes";

type LoadedRoom =
  | { role: "host"; room: HostedExamRoom }
  | { role: "participant"; room: JoinedExamRoom };

function GroupExamRunner({ loaded }: { loaded: LoadedRoom }) {
  const { role, room } = loaded;
  const start = room.start!;
  const userId =
    role === "host" ? room.hostUserId : room.participantUserId;
  const name = role === "host" ? room.hostName : room.participantName;
  const [hostedRoom, setHostedRoom] = useState<HostedExamRoom | null>(
    role === "host" ? { ...room, results: room.results ?? [] } : null,
  );

  const updateHostedRoom = useCallback(
    (update: (current: HostedExamRoom) => HostedExamRoom) => {
      setHostedRoom((current) => {
        if (!current) return current;
        const next = update(current);
        saveHostedExamRoom(next);
        return next;
      });
    },
    [],
  );

  const leaderboard = useMemo(
    () =>
      hostedRoom
        ? buildGroupExamLeaderboard(
            { userId: hostedRoom.hostUserId, name: hostedRoom.hostName },
            hostedRoom.participants,
            hostedRoom.results,
          )
        : [],
    [hostedRoom],
  );

  const handleLeaderboard = (next: GroupExamLeaderboardEntry[]) => {
    if (role !== "participant") return;
    const current = readJoinedExamRoom(room.roomCode);
    if (!current) return;
    saveJoinedExamRoom({ ...current, leaderboard: next });
  };

  const { sendResult, sendLeaderboard } = useExamRoomConnection({
    roomCode: room.roomCode,
    role,
    userId,
    name,
    activeStart: start,
    activeRoomState:
      role === "host"
        ? { status: hostedRoom?.status ?? "started", start }
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
    onLeaderboard: handleLeaderboard,
  });

  useEffect(() => {
    if (role !== "host" || leaderboard.length === 0) return;
    void sendLeaderboard(leaderboard);
  }, [leaderboard, role, sendLeaderboard]);

  const handleSubmitted = useCallback(
    (score: { correct: number }) => {
      const result: GroupExamResult = {
        userId,
        correctCount: score.correct,
      };

      if (role === "host") {
        updateHostedRoom((current) => ({
          ...current,
          results: [
            ...current.results.filter((item) => item.userId !== userId),
            result,
          ],
        }));
      } else {
        const current = readJoinedExamRoom(room.roomCode);
        if (current) saveJoinedExamRoom({ ...current, result });
        void sendResult(result);
      }
    },
    [role, room.roomCode, sendResult, updateHostedRoom, userId],
  );

  return (
    <MockTest
      objectiveCount={GROUP_EXAM_OBJECTIVE_COUNT}
      essayCount={GROUP_EXAM_ESSAY_COUNT}
      trueFalseCount={GROUP_EXAM_TRUE_FALSE_COUNT}
      durationSeconds={start.durationSeconds}
      questionSetHash={start.questionSetHash}
      initialExpiresAt={start.expiresAt}
      eyebrow={`Phòng ${room.roomCode}`}
      title="Thi nhóm Giáo lý Hôn nhân"
      exitHref={AppRoute.ExamRoom}
      resultHref={`${AppRoute.GroupExamResults}?room=${room.roomCode}&role=${role}`}
      onSubmitted={handleSubmitted}
      saveResult={false}
    />
  );
}

function GroupExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = normalizeExamRoomCode(searchParams.get("room") ?? "");
  const role = searchParams.get("role");
  const [loaded, setLoaded] = useState<LoadedRoom | null | undefined>(
    undefined,
  );

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      if (role === "host") {
        const room = readHostedExamRoom(roomCode);
        if (
          room?.results?.some((result) => result.userId === room.hostUserId)
        ) {
          router.replace(
            `${AppRoute.GroupExamResults}?room=${roomCode}&role=host`,
          );
          return;
        }
        setLoaded(room?.start ? { role, room } : null);
      } else if (role === "participant") {
        const room = readJoinedExamRoom(roomCode);
        if (room?.result) {
          router.replace(
            `${AppRoute.GroupExamResults}?room=${roomCode}&role=participant`,
          );
          return;
        }
        setLoaded(room?.start ? { role, room } : null);
      } else {
        setLoaded(null);
      }
    });
    return () => cancelAnimationFrame(frameId);
  }, [role, roomCode, router]);

  if (loaded === undefined) {
    return (
      <main className="grid min-h-screen place-items-center bg-surface px-4">
        <p className="text-sm text-on-surface-variant">Đang tải bộ đề…</p>
      </main>
    );
  }

  if (!loaded || loaded.room.start?.roomCode !== roomCode) {
    return (
      <main className="grid min-h-screen place-items-center bg-surface px-4">
        <section className="w-full max-w-md rounded-2xl border border-error/20 bg-surface-container-lowest p-6 text-center shadow-sm">
          <AlertTriangle className="mx-auto size-[var(--icon-lg)] text-error" />
          <h1 className="mt-4 font-headline text-xl font-bold">
            Không tìm thấy phiên thi
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Hãy quay lại phòng và chờ chủ phòng bắt đầu lại.
          </p>
          <Link
            href={AppRoute.ExamRoom}
            className="mt-5 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary"
          >
            Về Phòng thi
          </Link>
        </section>
      </main>
    );
  }

  return <GroupExamRunner loaded={loaded} />;
}

export default function GroupExamPage() {
  return (
    <Suspense fallback={null}>
      <GroupExamContent />
    </Suspense>
  );
}
