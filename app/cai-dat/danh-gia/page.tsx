import { Flame, Info, Medal, Trophy } from "lucide-react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import { LEADERBOARD, LEADERBOARD_META } from "@/lib/leaderboard";

const rankTone = [
  "bg-tertiary-container/35 text-tertiary",
  "bg-surface-container-high text-on-surface-variant",
  "bg-primary-container/20 text-primary",
];

export default function RatingPage() {
  return (
    <main className="min-h-screen bg-surface px-4 pb-28 pt-6">
      <SettingsPageHeader
        title="Xếp hạng"
        description={LEADERBOARD_META.description}
      />

      <section className="mt-7 overflow-hidden rounded-feature bg-hero p-5 text-on-hero">
        <Trophy className="size-[var(--icon-xl)] text-tertiary-container" />
        <h2 className="mt-4 font-headline text-2xl font-bold">
          {LEADERBOARD_META.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-on-hero-muted">
          Học thẻ, hoàn thành bài kiểm tra và duy trì chuỗi ngày học để tích lũy
          điểm.
        </p>
      </section>

      <section
        className="mt-5 overflow-hidden rounded-card border border-surface-container bg-surface-container-lowest"
        aria-label="Danh sách xếp hạng"
      >
        {LEADERBOARD.map((learner, index) => (
          <div
            key={learner.id}
            className="flex items-center gap-3 border-b border-surface-container p-4 last:border-b-0"
          >
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-headline text-sm font-bold ${rankTone[index] ?? "bg-surface-container-low text-on-surface-variant"}`}
            >
              {index < 3 ? (
                <Medal
                  className="size-[var(--icon-md)]"
                  aria-label={`Hạng ${index + 1}`}
                />
              ) : (
                index + 1
              )}
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-sm">{learner.name}</strong>
              <span className="mt-1 flex items-center gap-3 text-xs text-on-surface-variant">
                <span>{learner.cardsLearned} thẻ</span>
                <span className="inline-flex items-center gap-1">
                  <Flame className="size-3.5 text-tertiary" />
                  {learner.streak} ngày
                </span>
              </span>
            </span>
            <strong className="shrink-0 font-headline text-sm text-primary">
              {learner.points.toLocaleString("vi-VN")} điểm
            </strong>
          </div>
        ))}
      </section>

      <p className="mt-5 flex items-start gap-2 rounded-2xl bg-surface-container-low p-4 text-xs leading-relaxed text-on-surface-variant">
        <Info className="mt-0.5 size-[var(--icon-sm)] shrink-0 text-primary" />
        {LEADERBOARD_META.note}
      </p>
    </main>
  );
}
