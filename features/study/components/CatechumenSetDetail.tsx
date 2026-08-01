"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, ChevronRight, Layers3, RotateCcw } from "lucide-react";
import type { CatechumenSet } from "@/lib/catechumen";
import {
  clearCatechumenProgress,
  readCatechumenPosition,
} from "@/lib/catechumen-progress";

export default function CatechumenSetDetail({ set }: { set: CatechumenSet }) {
  const [position, setPosition] = useState(0);
  const total = set.cards.length;

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setPosition(readCatechumenPosition(set.slug, total));
    });
    return () => cancelAnimationFrame(frameId);
  }, [set.slug, total]);

  const lessonCounts = useMemo(() => {
    const counts = new Map<number, number>();
    set.cards.forEach((card) => {
      counts.set(card.lesson, (counts.get(card.lesson) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort(([a], [b]) => a - b);
  }, [set.cards]);

  const progress = total > 0 ? Math.round((position / total) * 100) : 0;
  const firstLesson = lessonCounts[0]?.[0];
  const lastLesson = lessonCounts.at(-1)?.[0];

  const reset = () => {
    if (!window.confirm("Bạn có muốn học lại bộ này từ đầu không?")) return;
    clearCatechumenProgress(set.slug);
    setPosition(0);
  };

  return (
    <main className="min-h-screen bg-surface px-4 pb-28 pt-6">
      <Link href="/catechumen" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
        <ArrowLeft className="size-[var(--icon-sm)]" />
        Các bộ thẻ
      </Link>

      <section className="mt-7 overflow-hidden rounded-feature bg-hero p-6 text-on-hero shadow-soft">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-on-hero/15">
          <BookOpen className="size-[var(--icon-lg)]" />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-on-hero-muted">
          Giáo lý Dự tòng
        </p>
        <h1 className="mt-2 font-headline text-2xl font-bold leading-tight">{set.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-on-hero-muted">{set.description}</p>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-card bg-surface-container-low p-4">
          <Layers3 className="size-[var(--icon-md)] text-primary" />
          <p className="mt-3 font-headline text-xl font-bold">{total}</p>
          <p className="text-xs text-on-surface-variant">Flashcard</p>
        </div>
        <div className="rounded-card bg-surface-container-low p-4">
          <BookOpen className="size-[var(--icon-md)] text-tertiary" />
          <p className="mt-3 font-headline text-xl font-bold">{firstLesson}–{lastLesson}</p>
          <p className="text-xs text-on-surface-variant">Phạm vi bài</p>
        </div>
      </section>

      <section className="mt-5 rounded-card border border-surface-container bg-surface-container-lowest p-5">
        <div className="flex items-center justify-between text-sm font-bold">
          <span>Tiến độ của bạn</span>
          <span className="text-primary">{position}/{total} · {progress}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
        </div>
        <Link href={`/catechumen/${set.slug}/study`} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-bold text-on-primary transition active:scale-[0.98]">
          {position > 0 ? "Tiếp tục học" : "Bắt đầu học"}
          <ChevronRight className="size-[var(--icon-sm)]" />
        </Link>
        {position > 0 && (
          <button type="button" onClick={reset} className="mt-2 flex w-full items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-on-surface-variant hover:text-primary">
            <RotateCcw className="size-[var(--icon-sm)]" />
            Học lại từ đầu
          </button>
        )}
      </section>

      <section className="mt-7">
        <h2 className="font-headline text-lg font-bold">Nội dung trong bộ</h2>
        <div className="mt-3 divide-y divide-surface-container overflow-hidden rounded-card border border-surface-container bg-surface-container-lowest">
          {lessonCounts.map(([lesson, count]) => (
            <div key={lesson} className="flex items-center justify-between px-4 py-3.5">
              <span className="font-bold">Bài {lesson}</span>
              <span className="text-sm text-on-surface-variant">{count} câu</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
