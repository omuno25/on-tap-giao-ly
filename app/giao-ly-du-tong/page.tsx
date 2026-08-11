import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { CATECHUMEN_META, CATECHUMEN_SETS } from "@/lib/catechumen";

export default function CatechumenPage() {
  const totalCards = CATECHUMEN_SETS.reduce(
    (total, set) => total + set.cards.length,
    0,
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl bg-surface px-4 pb-28 pt-8 sm:px-5 sm:pt-10">
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-tertiary">
        Bài 1–40
      </span>
      <h1 className="mt-3 font-headline text-3xl font-bold">
        {CATECHUMEN_META.title}
      </h1>
      <p className="mt-2 text-on-surface-variant">
        {CATECHUMEN_SETS.length} bộ gồm {totalCards} câu hỏi–đáp án từ Bài 1
        đến Bài 40.
      </p>
      <section className="mt-8 grid gap-4">
        {CATECHUMEN_SETS.map((set) => (
          <Link
            key={set.slug}
            href={`/giao-ly-du-tong/${set.slug}`}
            className="flex cursor-pointer flex-col rounded-2xl border border-surface-container bg-surface-container-lowest p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <BookOpen className="size-[var(--icon-lg)] text-primary" />
            <h2 className="font-headline font-bold text-lg mt-4">
              {set.title}
            </h2>
            <p className="text-sm text-on-surface-variant mt-2 flex-1">
              {set.description}
            </p>
            <p className="text-xs font-bold text-primary mt-5">
              {set.cards.length} thẻ
            </p>
            <span className="mt-4 flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary">
              Xem chi tiết <ArrowRight className="size-[var(--icon-sm)]" />
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
