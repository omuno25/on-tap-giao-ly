"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, RefreshCw } from "lucide-react";
import type { CatechumenSet } from "@/lib/catechumen";
import {
  readCatechumenCardIndex,
  saveCatechumenCardIndex,
} from "@/lib/catechumen-progress";
import FlipCard from "@/features/study/components/FlipCard";

export default function CatechumenStudy({ set }: { set: CatechumenSet }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setIndex(readCatechumenCardIndex(set.slug, set.cards.length));
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, [set.cards.length, set.slug]);

  useEffect(() => {
    if (!hydrated) return;
    saveCatechumenCardIndex(set.slug, index);
  }, [hydrated, index, set.slug]);

  const card = set.cards[index];
  const next = () => { setFlipped(false); setIndex((current) => (current + 1) % set.cards.length); };

  return (
    <div className="min-h-screen bg-surface px-5 pt-6 pb-28">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between gap-2 sm:gap-4">
        <Link href={`/giao-ly-du-tong/${set.slug}`} className="p-2 rounded-full bg-surface-container-low" aria-label="Quay lại chi tiết bộ thẻ"><ArrowLeft className="size-[var(--icon-md)]" /></Link>
        <div className="min-w-0 text-center"><p className="truncate font-headline text-sm font-bold text-primary sm:text-base">{set.title}</p><p className="text-xs text-on-surface-variant">Bài {card.lesson} · Thẻ {index + 1}/{set.cards.length}</p></div>
        <span className="w-9" />
      </header>
      <main className="mx-auto mt-8 w-full max-w-2xl sm:mt-10">
        <FlipCard
          question={card.question}
          answer={card.answer}
          flipped={flipped}
          onFlip={() => setFlipped((value) => !value)}
          icon={BookOpen}
        />
        <div className="mt-8 flex justify-center">
          {!flipped ? <button onClick={() => setFlipped(true)} className="rounded-full bg-primary text-on-primary px-8 py-3 font-bold flex items-center gap-2"><RefreshCw className="size-[var(--icon-sm)]" />Lật thẻ</button> : <button onClick={next} className="rounded-full bg-primary text-on-primary px-8 py-3 font-bold">Thẻ tiếp theo</button>}
        </div>
      </main>
    </div>
  );
}
