import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { readContentTextFile } from "@/lib/utils/server";

const BLOG_DIRECTORY = path.join(process.cwd(), "content", "blog");

export const BLOG_META = {
  eyebrow: "Góc học tập",
  title: "Đọc thêm để học nhẹ hơn",
  description:
    "Những gợi ý ngắn giúp bạn duy trì thói quen và ghi nhớ tốt hơn.",
};

export type BlogPostSummary = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readingTime: string;
  featured: boolean;
  order: number;
};

export type BlogPost = BlogPostSummary & {
  content: string;
};

export function getBlogPosts(): BlogPostSummary[] {
  return fs
    .readdirSync(BLOG_DIRECTORY)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => readBlogPost(fileName))
    .map(({ content: _content, ...post }) => post)
    .sort((a, b) => a.order - b.order);
}

export function getBlogPost(slug: string): BlogPost | undefined {
  const fileName = `${slug}.md`;
  const filePath = path.join(BLOG_DIRECTORY, fileName);
  return fs.existsSync(filePath) ? readBlogPost(fileName) : undefined;
}

function readBlogPost(fileName: string): BlogPost {
  const slug = fileName.replace(/\.md$/, "");
  const source = readContentTextFile("blog", fileName);
  const { data, content } = matter(source);
  const requiredFields = [
    "title",
    "category",
    "excerpt",
    "readingTime",
  ] as const;

  for (const field of requiredFields) {
    if (typeof data[field] !== "string" || !data[field].trim()) {
      throw new Error(`Bài blog "${fileName}" thiếu frontmatter "${field}".`);
    }
  }

  return {
    slug,
    title: data.title,
    category: data.category,
    excerpt: data.excerpt,
    readingTime: data.readingTime,
    featured: data.featured === true,
    order:
      typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
    content,
  };
}
