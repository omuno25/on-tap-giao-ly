import Link from "next/link";
import { ArrowRight, BookMarked, Headphones, Lightbulb } from "lucide-react";
import type { BlogPostSummary } from "@/lib/blog";

type BlogSectionProps = {
  posts: BlogPostSummary[];
};

const categoryIcons = {
  "Mẹo học": Lightbulb,
  "Thói quen": BookMarked,
  Audio: Headphones,
};

export default function BlogSection({ posts }: BlogSectionProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="learning-blog-title">
      <h2 id="learning-blog-title" className="font-headline text-2xl font-bold">Bài viết</h2>

      <div className="mt-5 grid gap-3">
        {posts.map((post) => {
          const Icon = categoryIcons[post.category as keyof typeof categoryIcons] ?? BookMarked;
          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-surface-container bg-surface-container-lowest p-4 transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-[var(--icon-md)]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  {post.category}<span aria-hidden="true">·</span>{post.readingTime}
                </span>
                <span className="mt-1 line-clamp-2 block font-headline text-sm font-bold leading-snug">{post.title}</span>
              </span>
              <ArrowRight className="size-[var(--icon-sm)] shrink-0 text-primary transition-transform group-hover:translate-x-1" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
