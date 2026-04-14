"use client";

import { X, Timer, Flag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import marriageQuestionSetJson from "@/data/marriage-question-set.json";
import ProgressBar from "@/components/ui/ProgressBar";

const OBJECTIVE_COUNT = 10;
const ESSAY_COUNT = 3;
const EXAM_DURATION_SECONDS = 25 * 60;

type ExamMode = "objective" | "essay";
type RawQuestion = {
  id: number;
  type: "short" | "essay";
  question: string;
  answer: string | string[];
};

type ExamOption = { id: string; text: string };
type ExamQuestion = {
  id: string;
  title: string;
  standardAnswer: string;
  examMode: ExamMode;
  options?: ExamOption[];
  correctOptionId?: string;
  image?: string;
};

type ScoreSummary = {
  objective: { total: number; correct: number };
  essay: { total: number; correct: number };
  total: number;
  correct: number;
};

function shuffle<T>(items: T[]) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function pickQuestions<T>(pool: T[], count: number) {
  if (pool.length === 0 || count <= 0) return [];
  if (pool.length >= count) return shuffle(pool).slice(0, count);

  const picked = [...shuffle(pool)];
  while (picked.length < count) {
    picked.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  return picked;
}

function normalizeAnswer(answer: string | string[]) {
  if (Array.isArray(answer)) {
    return answer.join("; ");
  }

  return answer;
}

function buildObjectiveOptions(source: RawQuestion, pool: RawQuestion[]) {
  const correctText = normalizeAnswer(source.answer);
  const distractorPool = pool
    .map((item) => normalizeAnswer(item.answer))
    .filter((value): value is string =>
      Boolean(value && value.trim().length > 0 && value !== correctText),
    );

  const distractors = shuffle(Array.from(new Set(distractorPool))).slice(0, 3);
  while (distractors.length < 3) {
    distractors.push("Không có đáp án phù hợp");
  }

  const optionTexts = shuffle([correctText, ...distractors]);
  const optionIds = ["A", "B", "C", "D"];
  const options = optionTexts.map((text, index) => ({
    id: optionIds[index],
    text,
  }));
  const correctOption = options.find((option) => option.text === correctText);

  return {
    options,
    correctOptionId: correctOption?.id ?? "A",
  };
}

function buildExamQuestions() {
  const source = marriageQuestionSetJson as { questions: RawQuestion[] };
  const objectivePool = source.questions.filter((q) => q.type === "short");
  const essayPool = source.questions.filter((q) => q.type === "essay");

  const objectiveQuestions: ExamQuestion[] = pickQuestions(
    objectivePool,
    OBJECTIVE_COUNT,
  ).map((q) => {
    const normalized = buildObjectiveOptions(q, objectivePool);

    return {
      id: String(q.id),
      title: q.question,
      standardAnswer: normalizeAnswer(q.answer),
      ...normalized,
      examMode: "objective" as const,
    };
  });

  const essayQuestions: ExamQuestion[] = pickQuestions(
    essayPool,
    ESSAY_COUNT,
  ).map((q) => ({
    id: String(q.id),
    title: q.question,
    standardAnswer: normalizeAnswer(q.answer),
    examMode: "essay" as const,
  }));

  return shuffle<ExamQuestion>([...objectiveQuestions, ...essayQuestions]);
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function calculateScore(
  questions: ExamQuestion[],
  answers: Record<string, string>,
): ScoreSummary {
  const objectiveQuestions = questions.filter(
    (q) => q.examMode === "objective",
  );
  const essayQuestions = questions.filter((q) => q.examMode === "essay");

  const objectiveCorrect = objectiveQuestions.reduce((count, q) => {
    const picked = answers[q.id];
    if (!picked) return count;
    return picked === q.correctOptionId ? count + 1 : count;
  }, 0);

  const essayCorrect = essayQuestions.reduce((count, q) => {
    const input = (answers[q.id] ?? "").trim();
    const expected = (q.standardAnswer ?? "").trim();
    // Essay scoring is strict exact match, including punctuation and accents.
    return input === expected ? count + 1 : count;
  }, 0);

  const total = questions.length;
  const correct = objectiveCorrect + essayCorrect;

  return {
    objective: { total: objectiveQuestions.length, correct: objectiveCorrect },
    essay: { total: essayQuestions.length, correct: essayCorrect },
    total,
    correct,
  };
}

export default function MockTest() {
  const [questions, setQuestions] = useState<ExamQuestion[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(EXAM_DURATION_SECONDS);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setQuestions(buildExamQuestions());
  }, []);

  useEffect(() => {
    if (submitted || secondsLeft <= 0) return;

    const timerId = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [secondsLeft, submitted]);

  useEffect(() => {
    if (secondsLeft === 0 && !submitted) {
      setSubmitted(true);
    }
  }, [secondsLeft, submitted]);

  const currentQuestion = questions?.[currentIndex];
  const totalQuestions = questions?.length ?? 0;
  const progress =
    totalQuestions > 0
      ? Math.round(((currentIndex + 1) / totalQuestions) * 100)
      : 0;

  const essayCountInExam = useMemo(
    () =>
      questions ? questions.filter((q) => q.examMode === "essay").length : 0,
    [questions],
  );

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
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const goNext = () => {
    if (isLastQuestion) {
      setSubmitted(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const goPrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const submitNow = () => {
    setSubmitted(true);
  };

  const answeredCount = Object.values(answers).filter(
    (value) => value.trim().length > 0,
  ).length;
  const score = calculateScore(questions, answers);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 py-3 border-b border-surface-container">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hover:bg-surface-container-low p-1.5 rounded-full transition-colors active:scale-95"
          >
            <X className="w-5 h-5 text-on-surface" />
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-primary tracking-widest font-headline uppercase">
              Giáo Xứ Đức Mẹ Hằng Cứu Giúp
            </span>
            <span className="text-base font-semibold font-headline text-on-surface leading-tight">
              Thi Thử Giáo Lý Hôn Nhân
            </span>
          </div>
        </div>
        <Image
          src="https://picsum.photos/seed/user/100/100"
          alt="User Avatar"
          width={32}
          height={32}
          className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface"
          referrerPolicy="no-referrer"
        />
      </header>

      <main className="flex-1 pt-20 pb-28 px-6 max-w-4xl mx-auto flex flex-col gap-6 w-full">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between gap-3">
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
              <Timer className="w-5 h-5 text-error fill-current" />
              <span className="font-headline font-black text-on-surface tabular-nums text-lg">
                {formatTime(secondsLeft)}
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

        {currentQuestion.examMode === "objective" ? (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {currentQuestion.options?.map((option) => {
              const isSelected = currentAnswer === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setAnswer(option.id)}
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
              placeholder={
                currentQuestion.examMode === "essay"
                  ? "Nhập câu trả lời tự luận..."
                  : "Nhập câu trả lời ngắn..."
              }
              className="w-full min-h-[180px] p-4 bg-surface-container-high focus:bg-surface-container-lowest border-none rounded-lg text-base text-on-surface placeholder-on-surface-variant/40 focus:ring-1 focus:ring-primary/20 transition-all outline-none resize-y"
            />
          </section>
        )}

        <section className="flex flex-col md:flex-row items-center justify-between gap-6 mt-2">
          <button className="order-2 md:order-1 flex items-center gap-1.5 text-on-surface/60 hover:text-on-surface font-bold text-[11px] uppercase tracking-widest transition-colors active:scale-95">
            <Flag className="w-4 h-4" />
            Báo lỗi câu hỏi
          </button>
          <div className="order-1 md:order-2 flex gap-3 w-full md:w-auto">
            <button
              onClick={goPrevious}
              disabled={currentIndex === 0}
              className="flex-1 md:flex-none px-8 py-3 bg-surface-container-highest text-on-surface font-bold rounded-full hover:bg-surface-dim transition-all active:scale-95 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Quay lại
            </button>
            <button
              onClick={isTimeUp ? submitNow : goNext}
              className="flex-[2] md:flex-none px-10 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-full shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 text-sm"
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
            <p>
              Tự luận (so khớp tuyệt đối): {score.essay.correct}/
              {score.essay.total}
            </p>
            <p className="mt-1 text-on-surface-variant">
              Bạn đã trả lời {answeredCount}/{totalQuestions} câu.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
