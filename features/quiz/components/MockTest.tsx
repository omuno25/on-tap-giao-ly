"use client";

import { AlertTriangle, X, Timer, Flag, UserRound } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ProgressBar from "@/components/ui/ProgressBar";
import { STORAGE_KEYS } from "@/lib/app-storage";
import {
  clearActiveExamSession,
  createExamExpiration,
  createExamSessionId,
  getRemainingExamSeconds,
  readActiveExamSession,
  saveActiveExamSession,
  saveExamResult,
  type ActiveExamSession,
} from "@/lib/learning-storage";
import { MARRIAGE_QUESTION_SET } from "@/lib/question-bank";
import { AppRoute } from "@/lib/routes";
import {
  buildExamQuestions,
  calculateScore,
  formatExamTime,
  type ExamQuestion,
  type MockTestSourceQuestion,
} from "@/lib/exam";

export type { MockTestSourceQuestion } from "@/lib/exam";

const OBJECTIVE_COUNT = 15;
const ESSAY_COUNT = 4;
const TRUE_FALSE_COUNT = 1;
const EXAM_DURATION_SECONDS = 25 * 60;

type MockTestProps = {
  sourceQuestions?: MockTestSourceQuestion[];
  objectiveCount?: number;
  essayCount?: number;
  trueFalseCount?: number;
  durationSeconds?: number;
  eyebrow?: string;
  title?: string;
  exitHref?: string;
  saveResult?: boolean;
};

export default function MockTest({
  sourceQuestions = MARRIAGE_QUESTION_SET.questions,
  objectiveCount = OBJECTIVE_COUNT,
  essayCount = ESSAY_COUNT,
  trueFalseCount = TRUE_FALSE_COUNT,
  durationSeconds = EXAM_DURATION_SECONDS,
  eyebrow = "Giáo Xứ Đức Mẹ Hằng Cứu Giúp",
  title = "Thi Thử Giáo Lý Hôn Nhân",
  exitHref = AppRoute.Home,
  saveResult = true,
}: MockTestProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [questions, setQuestions] = useState<ExamQuestion[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [expiresAt, setExpiresAt] = useState(() =>
    createExamExpiration(durationSeconds),
  );
  const [manuallySubmitted, setManuallySubmitted] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionInvalidated, setSessionInvalidated] = useState(false);
  const [conflictingSession, setConflictingSession] =
    useState<ActiveExamSession | null>(null);
  const resultSaved = useRef(false);
  const conflictDialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const savedSession = readActiveExamSession();

      if (savedSession?.pathname === pathname) {
        setSessionId(savedSession.sessionId);
        setQuestions(savedSession.questions);
        setCurrentIndex(savedSession.currentIndex);
        setAnswers(savedSession.answers);
        setExpiresAt(savedSession.expiresAt);
        setSecondsLeft(getRemainingExamSeconds(savedSession.expiresAt));
        setSessionReady(true);
      } else if (savedSession) {
        setConflictingSession(savedSession);
      } else {
        const newExpiresAt = createExamExpiration(durationSeconds);
        setSessionId(createExamSessionId());
        setExpiresAt(newExpiresAt);
        setSecondsLeft(getRemainingExamSeconds(newExpiresAt));
        setQuestions(
          buildExamQuestions(
            sourceQuestions,
            objectiveCount,
            essayCount,
            trueFalseCount,
          ),
        );
        setSessionReady(true);
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [
    durationSeconds,
    essayCount,
    objectiveCount,
    pathname,
    sourceQuestions,
    trueFalseCount,
  ]);

  const submitted = manuallySubmitted || secondsLeft === 0;

  const startNewExam = () => {
    const newExpiresAt = createExamExpiration(durationSeconds);
    clearActiveExamSession(conflictingSession?.sessionId);
    setSessionId(createExamSessionId());
    setQuestions(
      buildExamQuestions(
        sourceQuestions,
        objectiveCount,
        essayCount,
        trueFalseCount,
      ),
    );
    setCurrentIndex(0);
    setAnswers({});
    setExpiresAt(newExpiresAt);
    setSecondsLeft(getRemainingExamSeconds(newExpiresAt));
    setManuallySubmitted(false);
    setConflictingSession(null);
    setSessionReady(true);
  };

  useEffect(() => {
    if (!sessionId) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === STORAGE_KEYS.invalidatedExamSession &&
        event.newValue === sessionId
      ) {
        setSessionInvalidated(true);
        setSessionReady(false);
        return;
      }

      if (event.key === STORAGE_KEYS.activeExamSession && event.newValue) {
        const activeSession = readActiveExamSession();
        if (activeSession && activeSession.sessionId !== sessionId) {
          setSessionInvalidated(true);
          setSessionReady(false);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [sessionId]);

  useEffect(() => {
    if (!conflictingSession) return;
    const dialog = conflictDialogRef.current;
    const firstControl = dialog?.querySelector<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    firstControl?.focus();
  }, [conflictingSession]);

  useEffect(() => {
    if (!sessionReady || !sessionId || !questions || sessionInvalidated) return;

    if (submitted) {
      clearActiveExamSession(sessionId);
      return;
    }

    saveActiveExamSession({
      version: 3,
      sessionId,
      pathname,
      title,
      eyebrow,
      exitHref,
      questions,
      currentIndex,
      answers,
      secondsLeft,
      durationSeconds,
      expiresAt,
      updatedAt: new Date().toISOString(),
    });
  }, [
    answers,
    currentIndex,
    durationSeconds,
    eyebrow,
    expiresAt,
    exitHref,
    pathname,
    questions,
    secondsLeft,
    sessionId,
    sessionInvalidated,
    sessionReady,
    submitted,
    title,
  ]);

  useEffect(() => {
    if (
      !saveResult ||
      !submitted ||
      !questions ||
      sessionInvalidated ||
      resultSaved.current
    ) {
      return;
    }
    const score = calculateScore(questions, answers);
    saveExamResult({
      correct: score.correct,
      total: score.total,
      objectiveCorrect: score.objective.correct,
      objectiveTotal: score.objective.total,
      essayCorrect: score.essay.correct,
      essayTotal: score.essay.total,
      completedAt: new Date().toISOString(),
    });
    resultSaved.current = true;
  }, [answers, questions, saveResult, sessionInvalidated, submitted]);

  useEffect(() => {
    if (
      !sessionReady ||
      conflictingSession ||
      sessionInvalidated ||
      submitted ||
      secondsLeft <= 0
    ) {
      return;
    }

    const timerId = setInterval(() => {
      setSecondsLeft(getRemainingExamSeconds(expiresAt));
    }, 1000);

    return () => clearInterval(timerId);
  }, [
    conflictingSession,
    expiresAt,
    secondsLeft,
    sessionInvalidated,
    sessionReady,
    submitted,
  ]);

  const currentQuestion = questions?.[currentIndex];
  const totalQuestions = questions?.length ?? 0;
  const progress =
    totalQuestions > 0
      ? Math.round(((currentIndex + 1) / totalQuestions) * 100)
      : 0;

  const handleConflictDialogKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      router.push(AppRoute.ExamRoom);
      return;
    }

    if (event.key !== "Tab") return;
    const controls = Array.from(
      conflictDialogRef.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      ) ?? [],
    );
    if (controls.length === 0) return;

    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (sessionInvalidated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-4 pb-28">
        <section className="w-full max-w-md rounded-2xl border border-surface-container bg-surface-container-lowest p-6 text-center shadow-lg">
          <h1 className="font-headline text-xl font-bold">
            Phiên này đã kết thúc
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Phiên đã được hoàn thành hoặc thay thế trong một tab khác.
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

  if (conflictingSession) {
    return (
      <main className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/45 px-4 backdrop-blur-sm">
        <section
          ref={conflictDialogRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="exam-conflict-title"
          aria-describedby="exam-conflict-description"
          onKeyDown={handleConflictDialogKeyDown}
          className="w-full max-w-md rounded-2xl border border-error/20 bg-surface-container-lowest p-6 text-center shadow-lg"
        >
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-error/10 text-error">
            <AlertTriangle className="size-[var(--icon-md)]" />
          </span>
          <h1
            id="exam-conflict-title"
            className="mt-4 font-headline text-xl font-bold"
          >
            Bạn đang có một phiên chưa hoàn thành
          </h1>
          <p
            id="exam-conflict-description"
            className="mt-2 text-sm leading-relaxed text-on-surface-variant"
          >
            Phiên “{conflictingSession.title}” vẫn đang được lưu. Bắt đầu bài
            mới sẽ xóa tiến độ và các câu trả lời của phiên này.
          </p>
          <div className="mt-6 grid gap-3">
            <Link
              href={conflictingSession.pathname}
              className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-95"
            >
              Tiếp tục phiên cũ
            </Link>
            <button
              type="button"
              onClick={startNewExam}
              className="rounded-full border border-error/30 px-5 py-3 text-sm font-bold text-error transition-colors hover:bg-error/10 active:scale-95"
            >
              Xóa phiên cũ và bắt đầu bài mới
            </button>
            <Link
              href={AppRoute.ExamRoom}
              className="px-5 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface"
            >
              Hủy
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!questions || !currentQuestion) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <p className="text-on-surface-variant text-sm">
          Đang tạo đề thi thử ngẫu nhiên...
        </p>
      </div>
    );
  }

  const currentAnswer = answers[currentQuestion.id] ?? "";
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isTimeUp = secondsLeft === 0;

  const setAnswer = (value: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const goNext = () => {
    if (isLastQuestion) {
      setManuallySubmitted(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const goPrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const submitNow = () => {
    setManuallySubmitted(true);
  };

  const answeredCount = Object.values(answers).filter(
    (value) => value.trim().length > 0,
  ).length;
  const score = calculateScore(questions, answers);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="fixed inset-x-0 top-0 z-50 mx-auto flex w-full max-w-[var(--app-max-width)] items-center justify-between gap-2 border-b border-surface-container bg-surface/80 px-3 py-3 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href={exitHref}
            className="hover:bg-surface-container-low p-1.5 rounded-full transition-colors active:scale-95"
          >
            <X className="size-[var(--icon-md)] text-on-surface" />
          </Link>
          <div className="flex min-w-0 flex-col">
            <span className="text-[10px] font-bold text-primary tracking-widest font-headline uppercase">
              {eyebrow}
            </span>
            <span className="truncate font-headline text-sm font-semibold leading-tight text-on-surface sm:text-base">
              {title}
            </span>
          </div>
        </div>
        <span
          aria-label="Người dùng"
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-surface bg-surface-container-high min-[360px]:flex"
        >
          <UserRound className="size-4 text-on-surface-variant" />
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 pb-28 pt-20 sm:px-6">
        <section className="grid grid-cols-1 gap-4">
          <div className="bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between gap-3">
            <div className="flex justify-between items-center">
              <span className="font-headline font-bold text-on-surface text-sm">
                Câu hỏi {currentIndex + 1}
                <span className="text-outline font-normal">
                  {" "}
                  / {totalQuestions}
                </span>
              </span>
              <span className="text-secondary font-bold text-[11px] bg-secondary-container px-2.5 py-0.5 rounded-full">
                Tiến độ: {progress}%
              </span>
            </div>
            <ProgressBar progress={progress} />
          </div>
          <div className="bg-surface-container-low p-5 rounded-2xl flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <Timer className="size-[var(--icon-md)] fill-current text-error" />
              <span className="font-headline font-black text-on-surface tabular-nums text-lg">
                {formatExamTime(secondsLeft)}
              </span>
            </div>
            <span className="text-[9px] font-bold text-outline tracking-wider uppercase">
              Thời gian còn lại
            </span>
          </div>
        </section>

        <article className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-primary-container rounded-b-full z-10" />
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-6 p-6 md:p-7 border border-surface-container">
            <div className="flex flex-col gap-3">
              <span className="inline-block self-start px-3 bg-primary/5 text-primary text-[10px] font-bold tracking-widest rounded-full uppercase py-0.5">
                {currentQuestion.examMode === "essay"
                  ? "Tự luận"
                  : currentQuestion.examMode === "true-false"
                    ? "Đúng hay Sai"
                    : "Câu hỏi thường"}
              </span>
              <h2 className="font-headline font-bold text-on-surface leading-snug text-xl">
                {currentQuestion.title}
              </h2>
            </div>
            {currentQuestion.image && (
              <div className="w-full aspect-video md:aspect-[24/9] rounded-xl overflow-hidden bg-surface-container-low relative">
                <Image
                  src={currentQuestion.image}
                  alt="Question Image"
                  fill
                  className="object-cover mix-blend-multiply opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        </article>

        {currentQuestion.examMode === "objective" ||
        currentQuestion.examMode === "true-false" ? (
          <section className="grid grid-cols-1 gap-3.5">
            {currentQuestion.options?.map((option) => {
              const isSelected = currentAnswer === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setAnswer(option.id)}
                  disabled={submitted}
                  className={`group relative flex items-center gap-4 transition-all duration-300 rounded-xl text-left active:scale-95 overflow-hidden p-3.5 border ${
                    isSelected
                      ? "bg-primary-container/40  border-primary/60 ring-primary/45 ring-offset-2 ring-offset-surface"
                      : "bg-surface-container-high border-transparent hover:bg-primary-container/40"
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-headline font-bold text-xs transition-colors ${
                      isSelected
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-lowest text-on-surface group-hover:bg-primary group-hover:text-on-primary"
                    }`}
                  >
                    {option.id}
                  </span>
                  <span
                    className={`font-medium leading-relaxed text-sm ${isSelected ? "text-on-surface" : ""}`}
                  >
                    {option.text}
                  </span>
                </button>
              );
            })}
          </section>
        ) : (
          <section className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
            <textarea
              value={currentAnswer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={submitted}
              placeholder={
                currentQuestion.examMode === "essay"
                  ? "Nhập câu trả lời tự luận..."
                  : "Nhập câu trả lời ngắn..."
              }
              className="w-full min-h-[180px] p-4 bg-surface-container-high focus:bg-surface-container-lowest border-none rounded-lg text-base text-on-surface placeholder-on-surface-variant/40 focus:ring-1 focus:ring-primary/20 transition-all outline-none resize-y"
            />
          </section>
        )}

        <section className="mt-2 flex flex-col items-center justify-between gap-6">
          <button className="order-2 flex items-center gap-1.5 text-on-surface/60 hover:text-on-surface font-bold text-[11px] uppercase tracking-widest transition-colors active:scale-95">
            <Flag className="size-[var(--icon-sm)]" />
            Báo lỗi câu hỏi
          </button>
          <div className="order-1 flex w-full gap-3">
            <button
              onClick={goPrevious}
              disabled={submitted || currentIndex === 0}
              className="flex-1 px-4 py-3 bg-surface-container-highest text-on-surface font-bold rounded-full hover:bg-surface-dim transition-all active:scale-95 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Quay lại
            </button>
            <button
              onClick={isTimeUp ? submitNow : goNext}
              disabled={submitted}
              className="flex-[2] px-4 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-full shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 text-sm"
            >
              {isTimeUp
                ? "Nộp bài"
                : isLastQuestion
                  ? "Hoàn tất"
                  : "Xác nhận trả lời"}
            </button>
          </div>
        </section>

        {(submitted || isTimeUp) && (
          <section className="bg-secondary-container/20 border border-secondary-container rounded-xl p-4 text-sm text-on-surface">
            <p className="font-bold">
              Kết quả: {score.correct}/{score.total} điểm
            </p>
            <p className="mt-1">
              Trắc nghiệm: {score.objective.correct}/{score.objective.total}
            </p>
            {score.essay.total > 0 && (
              <p>
                Tự luận (so khớp tuyệt đối): {score.essay.correct}/
                {score.essay.total}
              </p>
            )}
            <p className="mt-1 text-on-surface-variant">
              Bạn đã trả lời {answeredCount}/{totalQuestions} câu.
            </p>
            <div className="mt-3">
              <Link
                href={exitHref}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-primary text-on-primary font-headline font-bold text-sm hover:opacity-90 transition-all active:scale-95"
              >
                Trở về
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
