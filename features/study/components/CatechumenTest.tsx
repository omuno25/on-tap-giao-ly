"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check, RefreshCw, X } from "lucide-react";
import type { CatechumenCard, CatechumenSet } from "@/lib/catechumen";
import FlipCard from "@/features/study/components/FlipCard";

const TEST_SIZE = 10;

export default function CatechumenTest({ set }: { set: CatechumenSet }) {
  const [questions, setQuestions] = useState<CatechumenCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [remembered, setRemembered] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setQuestions(createQuestionSet(set.cards));
    });
    return () => cancelAnimationFrame(frameId);
  }, [set.cards]);

  const restart = () => {
    setQuestions(createQuestionSet(set.cards));
    setIndex(0);
    setFlipped(false);
    setRemembered(0);
    setFinished(false);
  };

  const answer = (didRemember: boolean) => {
    const nextRemembered = remembered + (didRemember ? 1 : 0);
    setRemembered(nextRemembered);

    if (index === questions.length - 1) {
      setFinished(true);
      return;
    }

    setIndex((current) => current + 1);
    setFlipped(false);
  };

  if (questions.length === 0) {
    return (
      <main className="grid min-h-screen place-items-center bg-surface px-5 pb-28">
        <p className="text-sm text-on-surface-variant">Đang chuẩn bị câu hỏi...</p>
      </main>
    );
  }

  if (finished) {
    const score = Math.round((remembered / questions.length) * 100);
    return (
      <main className="min-h-screen bg-surface px-5 pb-28 pt-6">
        <Link href={`/catechumen/${set.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary">
          <ArrowLeft className="size-[var(--icon-sm)]" /> Chi tiết bộ thẻ
        </Link>
        <section className="mt-10 rounded-feature bg-hero p-6 text-center text-on-hero shadow-soft">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-on-hero/15">
            <Check className="size-[var(--icon-lg)]" />
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-on-hero-muted">Hoàn thành kiểm tra</p>
          <h1 className="mt-2 font-headline text-4xl font-bold">{score}%</h1>
          <p className="mt-3 text-sm text-on-hero-muted">Bạn đã nhớ {remembered}/{questions.length} câu trong lượt này.</p>
        </section>
        <button type="button" onClick={restart} className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-bold text-on-primary">
          <RefreshCw className="size-[var(--icon-sm)]" /> Làm lượt mới
        </button>
      </main>
    );
  }

  const card = questions[index];
  const progress = Math.round(((index + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-surface px-5 pb-28 pt-6">
      <header className="mx-auto flex w-full max-w-xl items-center justify-between gap-3">
        <Link href={`/catechumen/${set.slug}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-container-low" aria-label="Quay lại chi tiết bộ thẻ">
          <ArrowLeft className="size-[var(--icon-md)]" />
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate font-headline text-sm font-bold text-primary">Kiểm tra · {set.title.replace("Giáo lý Dự tòng · ", "")}</p>
          <p className="text-xs text-on-surface-variant">Câu {index + 1}/{questions.length} · Bài {card.lesson}</p>
        </div>
        <span className="w-10" />
      </header>

      <div className="mx-auto mt-4 h-1.5 w-full max-w-xl overflow-hidden rounded-full bg-surface-container-high">
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
      </div>

      <main className="mx-auto mt-7 w-full max-w-2xl">
        <FlipCard
          question={card.question}
          answer={card.answer}
          flipped={flipped}
          onFlip={() => setFlipped((value) => !value)}
          icon={BookOpen}
        />

        <div className="mx-auto mt-8 flex min-h-14 w-full max-w-xl justify-center gap-3">
          {!flipped ? (
            <button type="button" onClick={() => setFlipped(true)} className="flex cursor-pointer items-center gap-2 rounded-full bg-primary px-8 py-3 font-bold text-on-primary">
              <RefreshCw className="size-[var(--icon-sm)]" /> Xem đáp án
            </button>
          ) : (
            <>
              <button type="button" onClick={() => answer(false)} className="flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-error/10 px-4 py-3 text-sm font-bold text-error">
                <X className="size-[var(--icon-sm)]" /> Chưa nhớ
              </button>
              <button type="button" onClick={() => answer(true)} className="flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-secondary px-4 py-3 text-sm font-bold text-on-secondary">
                <Check className="size-[var(--icon-sm)]" /> Đã nhớ
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function createQuestionSet(cards: CatechumenCard[]) {
  const shuffled = [...cards];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }
  return shuffled.slice(0, Math.min(TEST_SIZE, shuffled.length));
}
