"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import type { CatechumenSet } from "@/lib/catechumen";
import { getCatechumenProgressKey } from "@/lib/catechumen-progress";

export default function CatechumenStudy({ set }: { set: CatechumenSet }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const storageKey = getCatechumenProgressKey(set.slug);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const saved = Number(localStorage.getItem(storageKey));
      if (Number.isInteger(saved) && saved >= 0) setIndex(Math.min(saved, set.cards.length - 1));
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, [set.cards.length, storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(storageKey, String(index));
  }, [hydrated, index, storageKey]);

  const card = set.cards[index];
  const next = () => { setFlipped(false); setIndex((current) => (current + 1) % set.cards.length); };

  return (
    <div className="min-h-screen bg-surface px-5 pt-6 pb-28">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between gap-2 sm:gap-4">
        <Link href={`/catechumen/${set.slug}`} className="p-2 rounded-full bg-surface-container-low" aria-label="Quay lại chi tiết bộ thẻ"><ArrowLeft className="size-[var(--icon-md)]" /></Link>
        <div className="min-w-0 text-center"><p className="truncate font-headline text-sm font-bold text-primary sm:text-base">{set.title}</p><p className="text-xs text-on-surface-variant">Bài {card.lesson} · Thẻ {index + 1}/{set.cards.length}</p></div>
        <span className="w-9" />
      </header>
      <main className="mx-auto mt-8 w-full max-w-2xl sm:mt-10">
        <button onClick={() => setFlipped((value) => !value)} className="block h-[var(--study-card-mobile-height)] w-full text-left sm:h-auto sm:aspect-[4/3]" aria-label="Lật thẻ">
          <motion.div className="w-full h-full relative" style={{ transformStyle: "preserve-3d" }} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.4 }}>
            <section className="absolute inset-0 flex items-center justify-center overflow-y-auto rounded-3xl border border-surface-container bg-surface-container-lowest p-6 text-center shadow-lg sm:p-8" style={{ backfaceVisibility: "hidden" }}><h1 className="font-headline text-2xl font-bold md:text-3xl">{card.question}</h1></section>
            <section className="absolute inset-0 flex items-center justify-center overflow-y-auto rounded-3xl border border-primary/20 bg-primary-container/20 p-6 text-center shadow-lg sm:p-8" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}><p className="text-base font-medium leading-relaxed sm:text-lg md:text-xl">{card.answer}</p></section>
          </motion.div>
        </button>
        <div className="mt-8 flex justify-center">
          {!flipped ? <button onClick={() => setFlipped(true)} className="rounded-full bg-primary text-on-primary px-8 py-3 font-bold flex items-center gap-2"><RefreshCw className="size-[var(--icon-sm)]" />Lật thẻ</button> : <button onClick={next} className="rounded-full bg-primary text-on-primary px-8 py-3 font-bold">Thẻ tiếp theo</button>}
        </div>
      </main>
    </div>
  );
}
