import fs from "node:fs";
import path from "node:path";
import Markdown from "react-markdown";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";

export default function ReleasesPage() {
  const content = fs.readFileSync(
    path.join(process.cwd(), "content", "release-notes.md"),
    "utf8",
  );

  return (
    <main className="min-h-screen bg-surface px-4 pb-28 pt-6">
      <SettingsPageHeader
        title="Phiên bản"
        description="Các thay đổi và cải thiện qua từng lần phát hành."
      />
      <article className="mt-7 rounded-card border border-surface-container bg-surface-container-lowest p-5">
        <Markdown
          components={{
            h1: ({ children }) => (
              <h2 className="font-headline text-2xl font-bold">{children}</h2>
            ),
            h2: ({ children }) => (
              <h3 className="mb-3 mt-7 font-headline text-base font-bold text-primary">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="my-3 text-sm leading-7 text-on-surface-variant">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="my-3 list-disc space-y-2 pl-5 text-sm leading-6 text-on-surface-variant marker:text-primary">
                {children}
              </ul>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-on-surface">{children}</strong>
            ),
            hr: () => <hr className="my-7 border-surface-container" />,
          }}
        >
          {content}
        </Markdown>
      </article>
    </main>
  );
}
