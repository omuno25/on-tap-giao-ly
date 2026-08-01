import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { CATECHUMEN_SETS } from "@/lib/catechumen";

export default function CatechumenPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl bg-surface px-4 pb-28 pt-8 sm:px-5 sm:pt-10">
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-tertiary">Bài 29–40</span>
      <h1 className="mt-3 font-headline text-3xl font-bold">Giáo lý Dự tòng</h1>
      <p className="mt-2 text-on-surface-variant">Một set gồm 39 câu hỏi–đáp án từ Bài 29 đến Bài 40.</p>
      <section className="mt-8 grid gap-4">
        {CATECHUMEN_SETS.map((set) => (
          <article key={set.slug} className="bg-surface-container-lowest border border-surface-container rounded-2xl p-5 flex flex-col">
            <BookOpen className="size-[var(--icon-lg)] text-primary" />
            <h2 className="font-headline font-bold text-lg mt-4">{set.title}</h2>
            <p className="text-sm text-on-surface-variant mt-2 flex-1">{set.description}</p>
            <p className="text-xs font-bold text-primary mt-5">{set.cards.length} thẻ</p>
            <Link href={`/catechumen/${set.slug}`} className="mt-4 rounded-full bg-primary text-on-primary px-5 py-3 font-bold text-sm flex items-center justify-center gap-2">Bắt đầu học <ArrowRight className="size-[var(--icon-sm)]" /></Link>
          </article>
        ))}
      </section>
    </main>
  );
}
