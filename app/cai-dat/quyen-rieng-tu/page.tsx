import Markdown from "react-markdown";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import { readContentTextFile } from "@/lib/utils/server";

export default function PrivacyPage() {
  const content = readContentTextFile("privacy-policy.md");

  return (
    <main className="min-h-screen bg-surface px-4 pb-28 pt-6">
      <SettingsPageHeader title="Chính sách quyền riêng tư" />
      <article className="mt-7 rounded-card border border-surface-container bg-surface-container-lowest p-5">
        <Markdown
          components={{
            p: ({ children }) => (
              <p className="text-sm leading-7 text-on-surface-variant">
                {children}
              </p>
            ),
          }}
        >
          {content}
        </Markdown>
      </article>
    </main>
  );
}
