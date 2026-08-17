"use client";

import { Clock3, Play, UsersRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProgressBar from "@/components/ui/ProgressBar";
import {
  readActiveExamSession,
  type ActiveExamSession,
} from "@/lib/learning-storage";
import { formatExamTime } from "@/lib/exam";

export default function ExamRoomPage() {
  const [session, setSession] = useState<ActiveExamSession | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setSession(readActiveExamSession());
      setLoaded(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const progress = session
    ? Math.round(((session.currentIndex + 1) / session.questions.length) * 100)
    : 0;
  const answeredCount = session
    ? Object.values(session.answers).filter((answer) => answer.trim()).length
    : 0;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl bg-surface px-4 pb-28 pt-8 sm:px-5 sm:pt-10">
      <h1 className="font-headline text-3xl font-bold">Phòng thi</h1>
      <p className="mt-2 text-on-surface-variant">
        Tiếp tục phiên đang làm hoặc cùng bạn bè luyện tập.
      </p>

      {session && (
        <section className="mt-8 rounded-2xl border border-primary/20 bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Phiên đang luyện tập
              </p>
              <h2 className="mt-1 truncate font-headline text-lg font-bold">
                {session.title}
              </h2>
            </div>
            <span className="shrink-0 rounded-full bg-secondary-container px-2.5 py-1 text-xs font-bold text-secondary">
              {progress}%
            </span>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between gap-4 text-xs text-on-surface-variant">
              <span>
                Câu {session.currentIndex + 1}/{session.questions.length}
              </span>
              <span>Đã trả lời {answeredCount} câu</span>
            </div>
            <ProgressBar progress={progress} />
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-surface-container-low p-3">
            <span className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Clock3 className="size-[var(--icon-sm)] text-error" />
              Còn {formatExamTime(session.secondsLeft)}
            </span>
            <Link
              href={session.pathname}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-95"
            >
              <Play className="size-4 fill-current" />
              Tiếp tục
            </Link>
          </div>
        </section>
      )}

      {loaded && !session && (
        <section className="mt-8 rounded-2xl border border-surface-container bg-surface-container-lowest p-6 text-center">
          <UsersRound className="mx-auto size-[var(--icon-xl)] text-primary" />
          <h2 className="mt-4 font-headline text-lg font-bold">
            Chưa có phiên đang luyện tập
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Hãy bắt đầu một bài thi thử. Phiên chưa hoàn thành sẽ xuất hiện tại
            đây.
          </p>
          <Link
            href="/thi-thu"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-95"
          >
            Bắt đầu thi thử
          </Link>
        </section>
      )}
    </main>
  );
}
