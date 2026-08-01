"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Star } from "lucide-react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import { readAppRating, saveAppRating } from "@/lib/learning-storage";

export default function RatingPage() {
  const [rating, setRating] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setRating(readAppRating()));
    return () => cancelAnimationFrame(frameId);
  }, []);

  const chooseRating = (value: number) => {
    setRating(value);
    saveAppRating(value);
    setSaved(true);
  };

  return (
    <main className="min-h-screen bg-surface px-4 pb-28 pt-6">
      <SettingsPageHeader title="Xếp hạng" description="Bạn cảm thấy trải nghiệm học tập với FlashCard thế nào?" />
      <section className="mt-7 rounded-feature border border-surface-container bg-surface-container-lowest p-6 text-center">
        <p className="font-headline text-lg font-bold">Chọn số sao</p>
        <div className="mt-5 flex justify-center gap-2" role="group" aria-label="Xếp hạng từ 1 đến 5 sao">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" onClick={() => chooseRating(value)} aria-label={`${value} sao`} aria-pressed={rating === value} className="cursor-pointer rounded-xl p-2 transition hover:bg-tertiary-container/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/40">
              <Star className={`size-[var(--icon-xl)] ${value <= rating ? "fill-tertiary-container text-tertiary" : "text-outline-variant"}`} />
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-on-surface-variant">{rating > 0 ? `Bạn đã chọn ${rating}/5 sao.` : "Chưa có đánh giá."}</p>
        {saved && <p className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-secondary"><CheckCircle className="size-[var(--icon-sm)]" />Đã lưu trên thiết bị</p>}
      </section>
    </main>
  );
}
