import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { BLOG_META, getBlogPosts } from "@/lib/blog";

export const metadata = {
  title: "Góc học tập | FlashCard",
  description: BLOG_META.description,
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <main className="min-h-screen bg-surface px-4 pb-28 pt-6 sm:px-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
        <ArrowLeft className="size-[var(--icon-sm)]" /> Về trang học tập
      </Link>

      <header className="mt-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{BLOG_META.eyebrow}</p>
        <h1 className="mt-2 font-headline text-3xl font-bold leading-tight">{BLOG_META.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{BLOG_META.description}</p>
      </header>

      <section className="mt-7 grid gap-4" aria-label="Danh sách bài viết">
        {posts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className={`group block cursor-pointer rounded-3xl border p-5 transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${index === 0 ? "border-on-surface bg-on-surface text-surface shadow-editorial" : "border-surface-container bg-surface-container-lowest"}`}
          >
            <span className={`flex items-center gap-2 text-xs font-bold ${index === 0 ? "text-surface/70" : "text-on-surface-variant"}`}>
              <span className={`rounded-full px-3 py-1.5 ${index === 0 ? "bg-surface/10 text-surface" : "bg-primary/10 text-primary"}`}>{post.category}</span>
              <Clock3 className="ml-1 size-[var(--icon-sm)]" /> {post.readingTime}
            </span>
            <h2 className="mt-5 font-headline text-xl font-bold leading-snug">{post.title}</h2>
            <p className={`mt-2 text-sm leading-relaxed ${index === 0 ? "text-surface/70" : "text-on-surface-variant"}`}>{post.excerpt}</p>
            <span className={`mt-5 inline-flex items-center gap-2 text-sm font-bold ${index === 0 ? "text-surface" : "text-primary"}`}>
              Đọc bài viết <ArrowRight className="size-[var(--icon-sm)] transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
