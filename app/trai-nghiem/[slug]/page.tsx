import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppRoute } from "@/lib/routes";
import { ArrowLeft, Clock3 } from "lucide-react";
import MarkdownContent from "@/components/content/MarkdownContent";
import { getBlogPost, getBlogPosts } from "@/shared/server/blog";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = getBlogPost((await params).slug);
  return post
    ? { title: `${post.title} | Ôn tập Giáo lý`, description: post.excerpt }
    : {};
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPost((await params).slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-surface px-4 pb-28 pt-6 sm:px-6">
      <Link
        href={AppRoute.Home}
        className="inline-flex items-center gap-2 text-sm font-bold text-primary"
      >
        <ArrowLeft className="size-[var(--icon-sm)]" /> Về trang học tập
      </Link>

      <article className="mt-7">
        <header className="border-b border-surface-container pb-7">
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-primary">
              {post.category}
            </span>
            <Clock3 className="ml-1 size-[var(--icon-sm)]" /> {post.readingTime}
          </div>
          <h1 className="mt-5 font-headline text-3xl font-bold leading-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-on-surface-variant">
            {post.excerpt}
          </p>
        </header>

        <div className="py-7 text-[15px] leading-7 text-on-surface">
          <MarkdownContent>{post.content}</MarkdownContent>
        </div>
      </article>

      <Link
        href={AppRoute.Home}
        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-on-primary"
      >
        Về trang học tập
      </Link>
    </main>
  );
}
