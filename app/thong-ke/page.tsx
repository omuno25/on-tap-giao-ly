"use client";

import { ArrowRight, BarChart3, BookOpen, ChevronLeft, ChevronRight, Crown, Trophy, UsersRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { readGroupExamHistory, type GroupExamHistoryEntry } from "@/lib/group-exam";
import { type ExamResult, readExamResults } from "@/lib/learning-storage";
import { QUESTION_BANK } from "@/lib/question-bank";
import { AppRoute } from "@/lib/routes";
import { readStudyPosition } from "@/lib/study-progress";

const HISTORY_PAGE_SIZE = 5;

export default function StatsPage() {
  const [studyPosition, setStudyPosition] = useState(0);
  const [personalResults, setPersonalResults] = useState<ExamResult[]>([]);
  const [groupHistory, setGroupHistory] = useState<GroupExamHistoryEntry[]>([]);
  const [personalPage, setPersonalPage] = useState(1);
  const [groupPage, setGroupPage] = useState(1);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setStudyPosition(readStudyPosition(QUESTION_BANK.length));
      setPersonalResults(readExamResults());
      setGroupHistory(readGroupExamHistory());
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  const completedGroupHistory = useMemo(
    () => groupHistory.filter((entry) => entry.result),
    [groupHistory],
  );
  const allScores = [
    ...personalResults.map(({ correct, total }) => ({ correct, total })),
    ...completedGroupHistory.map((entry) => ({
      correct: entry.result!.correctCount,
      total: 20,
    })),
  ];
  const bestScore = allScores.reduce<(typeof allScores)[number] | null>(
    (best, score) =>
      !best || score.correct / score.total > best.correct / best.total
        ? score
        : best,
    null,
  );
  const personalPageCount = Math.max(
    1,
    Math.ceil(personalResults.length / HISTORY_PAGE_SIZE),
  );
  const groupPageCount = Math.max(
    1,
    Math.ceil(groupHistory.length / HISTORY_PAGE_SIZE),
  );
  const visiblePersonalResults = personalResults.slice(
    (personalPage - 1) * HISTORY_PAGE_SIZE,
    personalPage * HISTORY_PAGE_SIZE,
  );
  const visibleGroupHistory = groupHistory.slice(
    (groupPage - 1) * HISTORY_PAGE_SIZE,
    groupPage * HISTORY_PAGE_SIZE,
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl bg-surface px-4 pb-28 pt-8 sm:px-5 sm:pt-10">
      <h1 className="font-headline text-3xl font-bold">Thống kê học tập</h1>
      <p className="mt-2 text-on-surface-variant">Dữ liệu được lưu trên trình duyệt này.</p>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat icon={BookOpen} label="Tiến độ flashcard" value={`${studyPosition}/${QUESTION_BANK.length}`} />
        <Stat icon={BarChart3} label="Bài đã hoàn thành" value={String(personalResults.length + completedGroupHistory.length)} />
        <Stat icon={Trophy} label="Điểm cao nhất" value={bestScore ? `${bestScore.correct}/${bestScore.total}` : "—"} />
      </section>

      <HistorySection title="Lịch sử thi cá nhân" icon={Trophy}>
        {personalResults.length === 0 ? (
          <EmptyHistory href={AppRoute.MockTest} label="Làm bài thi thử" />
        ) : visiblePersonalResults.map((result, index) => (
          <div key={`${result.completedAt}-${index}`} className="flex items-center justify-between gap-4 border-b border-surface-container py-3 last:border-b-0">
            <div>
              <p className="text-sm font-bold">Thi thử cá nhân</p>
              <p className="mt-0.5 text-xs text-on-surface-variant">{formatHistoryDate(result.completedAt)}</p>
            </div>
            <span className="font-headline font-bold text-primary">{result.correct}/{result.total}</span>
          </div>
        ))}
        <Pagination
          page={personalPage}
          pageCount={personalPageCount}
          onChange={setPersonalPage}
        />
      </HistorySection>

      <HistorySection title="Lịch sử thi cùng phòng" icon={UsersRound}>
        {groupHistory.length === 0 ? (
          <EmptyHistory href={AppRoute.ExamRoom} label="Vào Phòng thi" />
        ) : visibleGroupHistory.map((entry) => {
          const rank = entry.leaderboard.find((item) => item.userId === entry.userId)?.rank;
          const target = entry.result
            ? `${AppRoute.GroupExamResults}?room=${entry.roomCode}&role=${entry.role}`
            : `${AppRoute.GroupExam}?room=${entry.roomCode}&role=${entry.role}`;
          return (
            <Link key={`${entry.role}-${entry.roomCode}-${entry.userId}`} href={target} className="flex items-center gap-3 border-b border-surface-container py-3 last:border-b-0">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                {entry.role === "host" ? <Crown className="size-[var(--icon-sm)]" /> : <UsersRound className="size-[var(--icon-sm)]" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">Phòng {entry.roomCode}</p>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  {entry.result
                    ? `${entry.role === "host" ? "Chủ phòng" : `Chủ phòng: ${entry.hostName}`} · ${formatHistoryDate(entry.submittedAt ?? entry.updatedAt)}`
                    : "Bài thi chưa hoàn thành"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-headline text-sm font-bold text-primary">{entry.result ? `${entry.result.correctCount}/20` : "Tiếp tục"}</p>
                {rank ? <p className="text-[10px] text-on-surface-variant">Hạng {rank}</p> : null}
              </div>
              <ArrowRight className="size-[var(--icon-sm)] shrink-0 text-primary" />
            </Link>
          );
        })}
        <Pagination
          page={groupPage}
          pageCount={groupPageCount}
          onChange={setGroupPage}
        />
      </HistorySection>
    </main>
  );
}

function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label="Phân trang lịch sử"
      className="mt-4 flex items-center justify-between gap-3 border-t border-surface-container pt-4"
    >
      <button
        type="button"
        aria-label="Trang trước"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="grid size-9 place-items-center rounded-full border border-outline-variant/40 text-primary disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft className="size-[var(--icon-sm)]" />
      </button>
      <span className="text-xs font-bold text-on-surface-variant">
        Trang {page}/{pageCount}
      </span>
      <button
        type="button"
        aria-label="Trang sau"
        disabled={page === pageCount}
        onClick={() => onChange(page + 1)}
        className="grid size-9 place-items-center rounded-full border border-outline-variant/40 text-primary disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRight className="size-[var(--icon-sm)]" />
      </button>
    </nav>
  );
}

function HistorySection({ title, icon: Icon, children }: { title: string; icon: typeof Trophy; children: ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl border border-surface-container bg-surface-container-lowest p-5">
      <h2 className="flex items-center gap-2 font-headline text-lg font-bold"><Icon className="size-[var(--icon-sm)] text-primary" />{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EmptyHistory({ href, label }: { href: string; label: string }) {
  return <p className="py-2 text-sm text-on-surface-variant">Chưa có kết quả. <Link className="font-bold text-primary" href={href}>{label}</Link></p>;
}

function formatHistoryDate(value: string) {
  return new Date(value).toLocaleString("vi-VN");
}

function Stat({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-5">
      <Icon className="size-[var(--icon-lg)] text-primary" />
      <p className="mt-4 text-sm text-on-surface-variant">{label}</p>
      <p className="mt-1 font-headline text-2xl font-bold">{value}</p>
    </div>
  );
}
