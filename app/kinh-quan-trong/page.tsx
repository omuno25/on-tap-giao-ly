import Link from "next/link";
import { ArrowLeft, ScrollText } from "lucide-react";
import { PRAYER_META, PRAYERS } from "@/lib/prayers";
import PrayerMediaPlayer from "@/features/prayers/components/PrayerMediaPlayer";
import { AppRoute } from "@/lib/routes";

export default function PrayersPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-surface px-4 pb-28 pt-6 sm:px-6 sm:pt-10">
      <Link
        href={AppRoute.Home}
        className="inline-flex items-center gap-2 text-sm font-bold text-primary"
      >
        <ArrowLeft className="size-[var(--icon-sm)]" />
        Trang chủ
      </Link>
      <section className="mt-8 rounded-3xl border border-surface-container bg-surface-container-lowest p-6 text-center sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary-container/35 text-secondary">
          <ScrollText className="size-[var(--icon-xl)]" />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-secondary">
          Bộ thẻ mới
        </p>
        <h1 className="mt-2 font-headline text-3xl font-bold">
          {PRAYER_META.title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-on-surface-variant">
          {PRAYERS.length} audio đã sẵn sàng để nghe và học thuộc.
        </p>
      </section>
      <PrayerMediaPlayer prayers={PRAYERS} />
    </main>
  );
}
