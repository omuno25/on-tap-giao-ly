import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPostSummary } from "@/lib/blog";
import { appRoute } from "@/lib/routes";

type BlogSectionProps = {
  posts: BlogPostSummary[];
};

export default function BlogSection({ posts }: BlogSectionProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="learning-blog-title">
      <h2 id="learning-blog-title" className="font-headline text-2xl font-bold">
        Trải nghiệm
      </h2>

      <div className="mt-5 grid gap-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={appRoute.experience(post.slug)}
            className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-surface-container bg-surface-container-lowest p-4 transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 block font-headline text-sm font-bold leading-snug">
                {post.title}
              </span>
              <span className="mt-1.5 block text-xs text-on-surface-variant">
                {post.readingTime}
              </span>
            </span>
            <ArrowRight className="size-[var(--icon-sm)] shrink-0 text-primary transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </section>
  );
}
