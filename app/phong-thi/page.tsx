"use client";

import {
  ArrowRight,
  Clock3,
  Crown,
  DoorOpen,
  Play,
  Plus,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProgressBar from "@/components/ui/ProgressBar";
import {
  EXAM_ROOM_CODE_LENGTH,
  normalizeExamRoomCode,
  readActiveJoinedExamRoom,
  readActiveGroupExamRoom,
  readActiveHostedExamRoom,
  type HostedExamRoom,
  type JoinedExamRoom,
} from "@/lib/group-exam";
import {
  getRemainingExamSeconds,
  readActiveExamSession,
  type ActiveExamSession,
} from "@/lib/learning-storage";
import { formatExamTime } from "@/lib/exam";
import { AppRoute } from "@/lib/routes";

export default function ExamRoomPage() {
  const router = useRouter();
  const [session, setSession] = useState<ActiveExamSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [hostedRoom, setHostedRoom] = useState<HostedExamRoom | null>(null);
  const [hostedRoomExamActive, setHostedRoomExamActive] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState<JoinedExamRoom | null>(null);
  const [roomAction, setRoomAction] = useState<"create" | "join">("create");
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setSession(readActiveExamSession());
      const activeGroupRoom = readActiveGroupExamRoom();
      const activeHostedRoom = readActiveHostedExamRoom();
      const resolvedHostedRoom =
        activeHostedRoom?.status === "completed" ? null : activeHostedRoom;
      setHostedRoom(resolvedHostedRoom);
      setHostedRoomExamActive(
        Boolean(
          resolvedHostedRoom?.start &&
            Date.parse(resolvedHostedRoom.start.expiresAt) > Date.now(),
        ),
      );
      const activeJoinedRoom = readActiveJoinedExamRoom();
      const resolvedJoinedRoom =
        activeJoinedRoom?.status === "completed" ? null : activeJoinedRoom;
      setJoinedRoom(resolvedJoinedRoom);
      setRoomAction(
        activeGroupRoom?.role === "participant" && resolvedJoinedRoom
          ? "join"
          : "create",
      );
      setLoaded(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const sessionExpiresAt = session?.expiresAt;

  useEffect(() => {
    if (!sessionExpiresAt) return;

    const timerId = window.setInterval(() => {
      setSession((currentSession) =>
        currentSession
          ? {
              ...currentSession,
              secondsLeft: getRemainingExamSeconds(
                currentSession.expiresAt,
              ),
            }
          : null,
      );
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [sessionExpiresAt]);

  const progress = session
    ? Math.round(((session.currentIndex + 1) / session.questions.length) * 100)
    : 0;
  const answeredCount = session
    ? Object.values(session.answers).filter((answer) => answer.trim()).length
    : 0;
  const hostedRoomTarget = hostedRoom
    ? hostedRoom.status === "completed"
      ? `${AppRoute.GroupExamResults}?room=${hostedRoom.roomCode}&role=host`
      : hostedRoom.results?.some(
        (result) => result.userId === hostedRoom.hostUserId,
      )
      ? `${AppRoute.GroupExamResults}?room=${hostedRoom.roomCode}&role=host`
      : hostedRoom.status === "started" && hostedRoom.start
      ? `${
          hostedRoomExamActive
            ? AppRoute.GroupExam
            : AppRoute.GroupExamResults
        }?room=${hostedRoom.roomCode}&role=host`
      : AppRoute.CreateExamRoom
    : AppRoute.CreateExamRoom;
  const joinedRoomTarget = joinedRoom
    ? joinedRoom.status === "completed" || joinedRoom.result
      ? `${AppRoute.GroupExamResults}?room=${joinedRoom.roomCode}&role=participant`
      : `${AppRoute.JoinExamRoom}?code=${joinedRoom.roomCode}&resume=1`
    : AppRoute.JoinExamRoom;
  const hostedRoomCompleted = Boolean(
    hostedRoom &&
      (hostedRoom.status === "completed" ||
        hostedRoom.results?.some(
          (result) => result.userId === hostedRoom.hostUserId,
        )),
  );
  const joinedRoomCompleted = Boolean(
    joinedRoom &&
      (joinedRoom.status === "completed" || joinedRoom.result),
  );
  const isGroupSession = session?.pathname === AppRoute.GroupExam;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl bg-surface px-4 pb-28 pt-8 sm:px-5 sm:pt-10">
      <h1 className="font-headline text-3xl font-bold">Phòng thi</h1>
      <p className="mt-2 max-w-xl text-on-surface-variant">
        Tự luyện tập hoặc mở một phòng để thi cùng bạn bè.
      </p>

      {loaded && !session && (
        <section className="mt-8 rounded-2xl border border-surface-container bg-surface-container-low p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <UserRound className="size-[var(--icon-md)]" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                Tự luyện tập
              </p>
              <h2 className="mt-1 font-headline text-base font-bold">
                Luyện tập theo tốc độ của bạn
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Tiến độ được tự động lưu để tiếp tục sau.
              </p>
            </div>
          </div>
          <Link
            href={AppRoute.MockTest}
            className="mt-4 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-primary px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/5 active:scale-95 sm:mt-0 sm:w-auto"
          >
            <Play className="size-[var(--icon-sm)] fill-current" />
            Tự luyện tập
          </Link>
        </section>
      )}

      {session && (
        <section className="mt-8" aria-labelledby="active-session-title">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                Đang diễn ra
              </p>
              <h2
                id="active-session-title"
                className="mt-1 font-headline text-xl font-bold"
              >
                Phiên hiện tại
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              <UserRound className="size-3.5" />
              {isGroupSession ? "Thi nhóm" : "Cá nhân"}
            </span>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-surface-container-lowest p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate font-headline text-lg font-bold">
                  {session.title}
                </h3>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Tiến độ được lưu trên thiết bị này
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-secondary-container px-2.5 py-1 text-xs font-bold text-secondary">
                {progress}%
              </span>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex justify-between gap-4 text-xs text-on-surface-variant">
                <span>
                  Câu {session.currentIndex + 1}/{session.questions.length}
                </span>
                <span>Đã trả lời {answeredCount} câu</span>
              </div>
              <ProgressBar progress={progress} />
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-surface-container-low p-3">
              <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Clock3 className="size-[var(--icon-sm)] text-error" />
                Còn {formatExamTime(session.secondsLeft)}
              </span>
              <Link
                href={session.pathname}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-95"
              >
                <Play className="size-4 fill-current" />
                Tiếp tục
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="mt-8" aria-labelledby="group-exam-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="group-exam-title"
              className="font-headline text-xl font-bold"
            >
              Thi cùng bạn bè
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Một người tạo phòng, những người còn lại tham gia bằng mã.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
            <UsersRound className="size-3.5" />
            Thi nhóm
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-surface-container bg-surface-container-lowest shadow-sm">
          <div className="grid grid-cols-2 bg-surface-container-low p-1.5">
            <button
              type="button"
              aria-pressed={roomAction === "create"}
              onClick={() => {
                setRoomAction("create");
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                roomAction === "create"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant"
              }`}
            >
              <Crown className="size-[var(--icon-sm)]" />
              Tạo phòng
            </button>
            <button
              type="button"
              aria-pressed={roomAction === "join"}
              onClick={() => {
                setRoomAction("join");
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                roomAction === "join"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant"
              }`}
            >
              <DoorOpen className="size-[var(--icon-sm)]" />
              Nhập mã
            </button>
          </div>

          <div className="p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
            {roomAction === "create" ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Crown className="size-[var(--icon-md)]" />
                  </span>
                  <div>
                    <h3 className="font-headline text-base font-bold">
                      Bạn sẽ làm chủ phòng
                    </h3>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Chọn đề và mời bạn bè sau khi tạo.
                    </p>
                  </div>
                </div>
                <Link
                  href={hostedRoomTarget}
                  className="mt-4 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-transform active:scale-95 sm:mt-0 sm:w-auto"
                >
                  <Plus className="size-[var(--icon-sm)]" />
                  {hostedRoom ? "Tiếp tục phòng" : "Tạo phòng mới"}
                </Link>
              </>
            ) : (
              <>
                <div>
                  <h3 className="font-headline text-base font-bold">
                    Mã phòng của bạn
                  </h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Nhập mã 6 ký tự do chủ phòng chia sẻ.
                  </p>
                </div>
                <div className="mt-4 flex gap-2 sm:mt-0 sm:w-[21rem]">
                  <label htmlFor="room-code" className="sr-only">
                    Mã phòng
                  </label>
                  <input
                    id="room-code"
                    value={roomCode}
                    onChange={(event) => {
                      setRoomCode(
                        event.nativeEvent instanceof InputEvent &&
                          event.nativeEvent.isComposing
                          ? event.currentTarget.value
                          : normalizeExamRoomCode(event.currentTarget.value),
                      );
                    }}
                    onCompositionEnd={(event) => {
                      setRoomCode(
                        normalizeExamRoomCode(event.currentTarget.value),
                      );
                    }}
                    maxLength={EXAM_ROOM_CODE_LENGTH}
                    inputMode="text"
                    autoComplete="off"
                    placeholder="ABC123"
                    className="min-w-0 flex-1 rounded-full border border-outline-variant/50 bg-surface-container-low px-4 py-2.5 text-center font-headline text-sm font-bold uppercase tracking-[0.15em] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    aria-label="Tham gia phòng"
                    disabled={roomCode.length !== EXAM_ROOM_CODE_LENGTH}
                    onClick={() =>
                      router.push(`${AppRoute.JoinExamRoom}?code=${roomCode}`)
                    }
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-on-primary transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowRight className="size-[var(--icon-sm)]" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </section>

      {hostedRoom && (
        <Link
          href={hostedRoomTarget}
          className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              Phòng của bạn
            </p>
            <p className="mt-1 truncate font-headline font-bold">
              {hostedRoom.roomCode}
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              {hostedRoom.results?.some(
                (result) => result.userId === hostedRoom.hostUserId,
              )
                ? "Bạn đã nộp bài · Xem bảng xếp hạng"
                : hostedRoom.status === "completed"
                ? "Phòng đã hoàn tất · Xem bảng xếp hạng"
                : hostedRoom.status === "lobby"
                ? "Phòng đang chờ người tham gia"
                : hostedRoomExamActive
                  ? "Bài thi đang diễn ra"
                  : "Xem bảng xếp hạng"}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-primary">
            {hostedRoomCompleted ? "Xem kết quả" : "Tiếp tục"}
            <ArrowRight className="size-[var(--icon-sm)]" />
          </span>
        </Link>
      )}

      {joinedRoom && (
        <Link
          href={joinedRoomTarget}
          className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-surface-container bg-surface-container-lowest p-4 shadow-sm transition-colors hover:bg-surface-container-low"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              Phòng đang tham gia
            </p>
            <p className="mt-1 truncate font-headline font-bold">
              {joinedRoom.roomCode}
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              {joinedRoom.result
                ? "Bạn đã nộp bài · Xem bảng xếp hạng"
                : joinedRoom.start
                ? "Tiếp tục bài thi"
                : `Chủ phòng: ${joinedRoom.hostName}`}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-primary">
            {joinedRoomCompleted ? "Xem kết quả" : "Tiếp tục"}
            <ArrowRight className="size-[var(--icon-sm)]" />
          </span>
        </Link>
      )}
    </main>
  );
}
