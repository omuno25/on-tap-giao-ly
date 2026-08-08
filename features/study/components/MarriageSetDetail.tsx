"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Church,
  ClipboardCheck,
  Layers3,
  MessageCircleQuestion,
  RotateCcw,
} from "lucide-react";
import { MARRIAGE_QUESTION_SET } from "@/lib/question-bank";
import { clearStudyCardIndex, readStudyPosition } from "@/lib/study-progress";

export default function MarriageSetDetail() {
  const questions = MARRIAGE_QUESTION_SET.questions;
  const total = questions.length;
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setPosition(readStudyPosition(total));
    });
    return () => cancelAnimationFrame(frameId);
  }, [total]);

  const progress = total > 0 ? Math.round((position / total) * 100) : 0;

  const reset = () => {
    if (!window.confirm("Bạn có muốn học lại bộ Hôn nhân từ đầu không?")) {
      return;
    }
    clearStudyCardIndex();
    setPosition(0);
  };

  return (
    <main className="min-h-screen bg-surface px-4 pb-28 pt-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-primary"
      >
        <ArrowLeft className="size-[var(--icon-sm)]" /> Trang học tập
      </Link>

      <section className="mt-7 overflow-hidden rounded-feature bg-hero p-6 text-on-hero shadow-soft">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-on-hero/15">
          <Church className="size-[var(--icon-lg)]" />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-on-hero-muted">
          Giáo lý Hôn nhân
        </p>
        <h1 className="mt-2 font-headline text-2xl font-bold leading-tight">
          Bộ câu hỏi Hôn nhân Công giáo
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-on-hero-muted">
          Ôn tập kiến thức Hôn nhân và Gia đình Công giáo bằng câu hỏi–đáp án.
        </p>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-card bg-surface-container-low p-4">
          <Layers3 className="size-[var(--icon-md)] text-primary" />
          <p className="mt-3 font-headline text-xl font-bold">{total}</p>
          <p className="text-xs text-on-surface-variant">Flashcard</p>
        </div>
        <div className="rounded-card bg-surface-container-low p-4">
          <MessageCircleQuestion className="size-[var(--icon-md)] text-tertiary" />
          <p className="mt-3 font-headline text-xl font-bold">Hỏi + đáp</p>
          <p className="text-xs text-on-surface-variant">Dạng nội dung</p>
        </div>
      </section>

      <section className="mt-5 rounded-card border border-surface-container bg-surface-container-lowest p-5">
        <div className="flex items-center justify-between text-sm font-bold">
          <span>Tiến độ của bạn</span>
          <span className="text-primary">
            {position}/{total} · {progress}%
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Link
          href="/hoc"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-bold text-on-primary transition active:scale-[0.98]"
        >
          {position > 0 ? "Tiếp tục học" : "Bắt đầu học"}
          <ChevronRight className="size-[var(--icon-sm)]" />
        </Link>
        <Link
          href="/thi-thu"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-primary px-6 py-3.5 font-bold text-primary transition-colors hover:bg-primary/5 active:scale-[0.98]"
        >
          <ClipboardCheck className="size-[var(--icon-sm)]" /> Kiểm tra 20 câu
        </Link>
        {position > 0 && (
          <button
            type="button"
            onClick={reset}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-on-surface-variant hover:text-primary"
          >
            <RotateCcw className="size-[var(--icon-sm)]" /> Học lại từ đầu
          </button>
        )}
      </section>

      <section className="mt-7">
        <h2 className="font-headline text-lg font-bold">
          Câu hỏi + câu trả lời
        </h2>
        <div className="mt-3 grid gap-3">
          {questions.map((question, index) => (
            <article
              key={question.id}
              className="overflow-hidden rounded-card border border-surface-container bg-surface-container-lowest"
            >
              <div className="flex items-start gap-3 p-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <h3 className="min-w-0 flex-1 text-sm font-bold leading-relaxed">
                  {question.question}
                </h3>
              </div>
              <div className="border-t border-surface-container bg-surface-container-low p-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Trả lời
                </p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
                  {formatAnswer(question.answer)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function formatAnswer(answer: string | string[]) {
  return Array.isArray(answer)
    ? answer.map((item) => `• ${item}`).join("\n")
    : answer;
}
