"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, BookOpen, Trophy } from "lucide-react";
import { QUESTION_BANK } from "@/lib/question-bank";
import { readStudyPosition } from "@/lib/study-progress";
import { ExamResult, readExamResults } from "@/lib/learning-storage";

export default function StatsPage() {
  const [studyPosition, setStudyPosition] = useState(0);
  const [results, setResults] = useState<ExamResult[]>([]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setStudyPosition(readStudyPosition(QUESTION_BANK.length));
      setResults(readExamResults());
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  const bestResult = results.reduce<ExamResult | null>((best, result) => {
    if (!best) return result;

    const bestRate = best.total > 0 ? best.correct / best.total : 0;
    const resultRate = result.total > 0 ? result.correct / result.total : 0;
    return resultRate > bestRate ? result : best;
  }, null);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl bg-surface px-4 pb-28 pt-8 sm:px-5 sm:pt-10">
      <h1 className="font-headline text-3xl font-bold">Thống kê học tập</h1>
      <p className="mt-2 text-on-surface-variant">
        Dữ liệu được lưu trên trình duyệt này.
      </p>
      <section className="mt-8 grid gap-4">
        <Stat
          icon={BookOpen}
          label="Tiến độ flashcard"
          value={`${studyPosition}/${QUESTION_BANK.length}`}
        />
        <Stat
          icon={BarChart3}
          label="Số bài thi"
          value={String(results.length)}
        />
        <Stat
          icon={Trophy}
          label="Điểm cao nhất"
          value={bestResult ? `${bestResult.correct}/${bestResult.total}` : "—"}
        />
      </section>
      <section className="mt-8 bg-surface-container-lowest border border-surface-container rounded-2xl p-5">
        <h2 className="font-headline text-lg font-bold">Lịch sử thi gần đây</h2>
        {results.length === 0 ? (
          <p className="mt-4 text-sm text-on-surface-variant">
            Chưa có kết quả.{" "}
            <Link className="text-primary font-bold" href="/test">
              Làm bài thi thử
            </Link>
          </p>
        ) : (
          <div className="mt-4 divide-y divide-surface-container">
            {results.map((result, index) => (
              <div
                key={`${result.completedAt}-${index}`}
                className="py-3 flex justify-between gap-4 text-sm"
              >
                <span>
                  {new Date(result.completedAt).toLocaleString("vi-VN")}
                </span>
                <span className="font-bold text-primary">
                  {result.correct}/{result.total}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-5">
      <Icon className="size-[var(--icon-lg)] text-primary" />
      <p className="mt-4 text-sm text-on-surface-variant">{label}</p>
      <p className="font-headline text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
