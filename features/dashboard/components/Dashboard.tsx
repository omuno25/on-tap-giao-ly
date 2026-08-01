"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronRight,
  Church,
  Flame,
  Play,
  ScrollText,
  Sparkles,
  User,
} from "lucide-react";
import { QUESTION_BANK } from "@/lib/question-bank";
import { CATECHUMEN_SETS } from "@/lib/catechumen";
import {
  PROFILE_UPDATED_EVENT,
  getGreetingName,
  readLearnerProfile,
} from "@/lib/learning-storage";
import { STUDY_CARD_INDEX_KEY } from "@/lib/study-progress";
import { getCatechumenProgressKey } from "@/lib/catechumen-progress";

type DeckCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  count: string;
  href?: string;
  icon: typeof Church;
  tone: "blue" | "amber" | "green";
  progress?: number;
};

export default function Dashboard() {
  const totalMarriageCards = QUESTION_BANK.length;
  const catechumenSet = CATECHUMEN_SETS[0];
  const [learnerName, setLearnerName] = useState("User");
  const [marriagePosition, setMarriagePosition] = useState(0);
  const [catechumenPosition, setCatechumenPosition] = useState(0);

  useEffect(() => {
    const syncProfile = () => setLearnerName(readLearnerProfile().name);
    const frameId = requestAnimationFrame(() => {
      syncProfile();
      setMarriagePosition(
        readPosition(STUDY_CARD_INDEX_KEY, totalMarriageCards),
      );
      if (catechumenSet) {
        setCatechumenPosition(
          readPosition(
            getCatechumenProgressKey(catechumenSet.slug),
            catechumenSet.cards.length,
          ),
        );
      }
    });
    window.addEventListener(PROFILE_UPDATED_EVENT, syncProfile);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener(PROFILE_UPDATED_EVENT, syncProfile);
    };
  }, [catechumenSet, totalMarriageCards]);

  const marriageProgress = useMemo(
    () => percent(marriagePosition, totalMarriageCards),
    [marriagePosition, totalMarriageCards],
  );
  const catechumenProgress = useMemo(
    () => percent(catechumenPosition, catechumenSet?.cards.length ?? 0),
    [catechumenPosition, catechumenSet],
  );
  const greetingName = getGreetingName(learnerName);

  return (
    <div className="min-h-screen bg-surface pb-28">
      <header className="sticky top-0 z-40 border-b border-surface-container/80 bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Trang chủ FlashCard">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-on-primary shadow-sm">
              <Sparkles className="size-[var(--icon-md)]" />
            </span>
            <span className="font-headline text-lg font-black tracking-tight text-on-surface">FlashCard</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-2 rounded-full bg-surface-container-low px-2 py-1.5 pr-3 text-sm font-bold transition-colors hover:bg-surface-container" aria-label="Mở cài đặt">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-container/40 text-primary"><User className="size-[var(--icon-sm)]" /></span>
            <span className="max-w-24 truncate">{learnerName}</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-9">
        <section className="overflow-hidden rounded-feature bg-hero text-on-hero shadow-lg shadow-primary/10">
          <div className="relative p-5 sm:p-8">
            <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-hero-accent/25 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-hero-muted">Học mỗi ngày một chút</p>
              <h1 className="mt-3 max-w-2xl font-headline text-2xl font-bold leading-tight sm:text-4xl">
                Chào <span className="break-words">{greetingName}</span>, hôm nay mình học tiếp nhé.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-on-hero-muted sm:text-base">
                Nội dung được chia thành từng bộ rõ ràng, tiến độ tự lưu trên thiết bị này.
              </p>
            </div>
            <Link href="/study" className="relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-on-hero px-6 py-3.5 font-headline text-sm font-bold text-hero shadow-sm transition-transform active:scale-[0.98]">
              <Play className="size-[var(--icon-sm)] fill-current" />
              {marriagePosition > 0 ? "Tiếp tục học" : "Bắt đầu học"}
            </Link>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-4">
          <Summary icon={BookOpen} value={String(totalMarriageCards + (catechumenSet?.cards.length ?? 0))} label="Thẻ đang có" />
          <Summary icon={Flame} value="0" label="Ngày liên tiếp" />
          <Summary icon={BarChart3} value={`${marriageProgress}%`} label="Hôn nhân" href="/stats" />
        </section>

        <section className="mt-9">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Thư viện</p>
              <h2 className="mt-1 font-headline text-2xl font-bold">Chọn bộ để học</h2>
            </div>
            <Link href="/stats" className="hidden items-center gap-1 text-sm font-bold text-primary sm:flex">Xem thống kê <ChevronRight className="size-[var(--icon-sm)]" /></Link>
          </div>

          <div className="mt-5 grid gap-4">
            <DeckCard eyebrow="Đang học" title="Giáo lý Hôn nhân" description="Ôn tập kiến thức Hôn nhân và Gia đình Công giáo." count={`${totalMarriageCards} thẻ`} href="/study" icon={Church} tone="blue" progress={marriageProgress} />
            <DeckCard eyebrow="Bài 29–40" title="Giáo lý Dự tòng" description="Năm Phụng vụ, cầu nguyện, các Bí tích và đời sau." count={`${catechumenSet?.cards.length ?? 0} thẻ`} href={catechumenSet ? `/catechumen/${catechumenSet.slug}` : "/catechumen"} icon={BookOpen} tone="amber" progress={catechumenProgress} />
            <DeckCard eyebrow="Sắp thêm nội dung" title="18 Kinh cần thuộc" description="Một vị trí riêng đã sẵn sàng cho bộ kinh đọc và học thuộc." count="18 bài kinh" href="/prayers" icon={ScrollText} tone="green" />
          </div>
        </section>

        <section className="mt-9 grid gap-4 rounded-2xl border border-surface-container bg-surface-container-lowest p-4 sm:p-5">
          <div><p className="font-headline font-bold">Sẵn sàng kiểm tra kiến thức?</p><p className="mt-1 text-sm text-on-surface-variant">Làm đề ngẫu nhiên 13 câu trong 25 phút.</p></div>
          <Link href="/test" className="inline-flex items-center justify-center gap-2 rounded-full bg-on-surface px-6 py-3 text-sm font-bold text-surface">Thi thử ngay <ArrowRight className="size-[var(--icon-sm)]" /></Link>
        </section>
      </main>
    </div>
  );
}

function readPosition(key: string, total: number) {
  const raw = localStorage.getItem(key);
  if (raw === null) return 0;
  const index = Number(raw);
  return Number.isInteger(index) && index >= 0 ? Math.min(index + 1, total) : 0;
}

function percent(position: number, total: number) {
  return total > 0 ? Math.round((position / total) * 100) : 0;
}

function Summary({ icon: Icon, value, label, href }: { icon: typeof BookOpen; value: string; label: string; href?: string }) {
  const content = <><Icon className="size-[var(--icon-md)] text-primary" /><strong className="mt-2 font-headline text-lg sm:text-2xl">{value}</strong><span className="mt-0.5 text-[10px] leading-tight text-on-surface-variant sm:text-xs">{label}</span></>;
  const className = "flex min-w-0 flex-col rounded-2xl bg-surface-container-low p-3 sm:p-5 cursor-pointer transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
  return href ? <Link href={href} className={className}>{content}</Link> : <div className={className}>{content}</div>;
}

function DeckCard({ eyebrow, title, description, count, href, icon: Icon, tone, progress }: DeckCardProps) {
  const tones = { blue: "bg-primary/10 text-primary", amber: "bg-tertiary-container/35 text-tertiary", green: "bg-secondary-container/35 text-secondary" };
  const content = (
    <>
      <div className="flex items-start justify-between gap-4"><span className={`grid h-12 w-12 place-items-center rounded-2xl ${tones[tone]}`}><Icon className="size-[var(--icon-lg)]" /></span><span className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{eyebrow}</span></div>
      <h3 className="mt-5 font-headline text-xl font-bold">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-on-surface-variant">{description}</p>
      {progress !== undefined && <div className="mt-5"><div className="flex justify-between text-xs font-bold"><span>{count}</span><span className="text-primary">{progress}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container-high"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} /></div></div>}
      {progress === undefined && <p className="mt-5 text-xs font-bold text-on-surface-variant">{count}</p>}
      <div className="mt-5 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold transition-colors group-hover:bg-primary group-hover:text-on-primary"><span>{progress === undefined ? "Xem bộ thẻ" : progress > 0 ? "Học tiếp" : "Bắt đầu"}</span><ChevronRight className="size-[var(--icon-sm)]" /></div>
    </>
  );
  const className = "group flex min-h-64 flex-col rounded-3xl border border-surface-container bg-surface-container-lowest p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:p-6";

  return href ? (
    <Link href={href} className={`${className} cursor-pointer`}>
      {content}
    </Link>
  ) : (
    <article className={className}>{content}</article>
  );
}
