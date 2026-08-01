import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3 } from "lucide-react";
import Markdown from "react-markdown";
import { getBlogPost, getBlogPosts } from "@/lib/blog";

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
    ? { title: `${post.title} | FlashCard`, description: post.excerpt }
    : {};
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPost((await params).slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-surface px-4 pb-28 pt-6 sm:px-6">
      <Link
        href="/"
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
          <Markdown
            components={{
              h2: ({ children }) => (
                <h2 className="mb-3 mt-8 font-headline text-xl font-bold first:mt-0">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mb-2 mt-7 font-headline text-lg font-bold">
                  {children}
                </h3>
              ),
              p: ({ children }) => <p className="my-5">{children}</p>,
              ul: ({ children }) => (
                <ul className="my-5 list-disc space-y-2 pl-5 marker:text-primary">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="my-5 list-decimal space-y-2 pl-5 marker:font-bold marker:text-primary">
                  {children}
                </ol>
              ),
              blockquote: ({ children }) => (
                <blockquote className="my-6 rounded-r-2xl border-l-4 border-primary bg-primary/5 px-4 py-1 text-on-surface-variant">
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-primary">{children}</strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="font-bold text-primary underline underline-offset-4"
                >
                  {children}
                </a>
              ),
            }}
          >
            {post.content}
          </Markdown>
        </div>
      </article>

      <Link
        href="/"
        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-on-primary"
      >
        Về trang học tập
      </Link>
    </main>
  );
}
