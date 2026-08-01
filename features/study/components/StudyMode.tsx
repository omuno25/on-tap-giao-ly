"use client";

import { X, Church, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QUESTION_BANK } from "@/lib/question-bank";
import { readStudyCardIndex, saveStudyCardIndex } from "@/lib/study-progress";
import FlipCard from "@/features/study/components/FlipCard";

export default function StudyMode() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isProgressHydrated, setIsProgressHydrated] = useState(false);
  const flashcards = QUESTION_BANK.filter((item) => item.type === "flashcard");
  const flashcard = flashcards[currentCardIndex];
  const totalQuestions = flashcards.length;
  const currentQuestionIndex = currentCardIndex + 1;
  const progress =
    totalQuestions > 0
      ? Math.round((currentQuestionIndex / totalQuestions) * 100)
      : 0;

  useEffect(() => {
    if (totalQuestions <= 0) return;

    const frameId = window.requestAnimationFrame(() => {
      const savedIndex = readStudyCardIndex();
      setCurrentCardIndex(Math.min(savedIndex, totalQuestions - 1));
      setIsProgressHydrated(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [totalQuestions]);

  useEffect(() => {
    if (!isProgressHydrated) return;
    saveStudyCardIndex(currentCardIndex);
  }, [currentCardIndex, isProgressHydrated]);

  useEffect(() => {
    return () => {
      // Cleanup pending timer when leaving page.
      if ((window as Window & { __studyNextTimer?: number }).__studyNextTimer) {
        window.clearTimeout(
          (window as Window & { __studyNextTimer?: number }).__studyNextTimer,
        );
      }
    };
  }, []);

  if (!flashcard) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <p className="text-on-surface-variant text-sm">
          Chưa có flashcard trong question bank JSON.
        </p>
      </div>
    );
  }

  const goToNextCard = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setIsFlipped(false);

    (window as Window & { __studyNextTimer?: number }).__studyNextTimer =
      window.setTimeout(() => {
        setIsTransitioning(false);
        setCurrentCardIndex((prev) => (prev + 1) % totalQuestions);
      }, 500);
  };

  const reviewCurrentCard = () => {
    if (isTransitioning) return;
    setIsFlipped(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 mx-auto flex w-full max-w-[var(--app-max-width)] items-center justify-between gap-2 border-b border-surface-container bg-surface/80 px-3 py-3 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/giao-ly-hon-nhan"
            className="hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-95"
          >
            <X className="size-[var(--icon-md)] text-on-surface" />
          </Link>
          <div className="flex min-w-0 flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant leading-none mb-0.5">
              Phiên học
            </span>
            <span className="truncate font-headline text-xs font-bold leading-tight text-primary sm:text-sm">
              Giáo lý Hôn nhân - Bộ {totalQuestions} câu
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="text-xs font-medium text-on-surface-variant">
            {currentQuestionIndex}/{totalQuestions} thẻ
          </span>
          <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-surface-container-highest sm:block sm:w-24">
            <div
              className="h-full bg-gradient-to-r from-secondary to-secondary-container rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-20 pb-28">
        {/* Flashcard */}
        <FlipCard
          question={flashcard.title}
          answer={flashcard.standardAnswer ?? "Chưa có đáp án cho thẻ này."}
          flipped={isFlipped}
          onFlip={() => setIsFlipped((value) => !value)}
          icon={Church}
        />

        {/* Action Area */}
        <div className="mt-10 w-full max-w-xl relative min-h-[92px]">
          <AnimatePresence initial={false} mode="wait">
            {!isFlipped ? (
              <motion.div
                key="flip-btn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <button
                  onClick={() => setIsFlipped(true)}
                  className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-10 py-3.5 rounded-full font-headline font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2.5"
                >
                  <RefreshCw className="size-[var(--icon-sm)]" />
                  Lật thẻ
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="rating-btns"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl p-1.5 sm:gap-3"
              >
                <button
                  onClick={reviewCurrentCard}
                  disabled={isTransitioning}
                  className="h-[50px] min-w-0 flex-1 rounded-full bg-surface-container-high text-on-surface font-headline text-sm font-bold shadow-sm transition-all hover:bg-surface-container active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-[170px]"
                >
                  Xem lại
                </button>
                <button
                  onClick={goToNextCard}
                  disabled={isTransitioning}
                  className="h-[50px] min-w-0 flex-1 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline text-sm font-bold shadow-md transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-[170px]"
                >
                  Tiếp theo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Shortcuts */}
        <div className="mt-12 text-on-surface-variant/40 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded text-[9px] font-bold">
              CÁCH
            </kbd>
            <span className="text-[11px] font-medium">Lật</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded text-[9px] font-bold">
              1-4
            </kbd>
            <span className="text-[11px] font-medium">Đánh giá</span>
          </div>
        </div>
      </main>

      {/* Stats Footer */}
      {/* <section className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 md:px-6 block">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-surface-container-low/50 backdrop-blur-sm p-3 rounded-lg flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-secondary-container flex items-center justify-center">
              <Timer className="size-[var(--icon-sm)] text-on-secondary-container" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-on-surface-variant/60 tracking-tight leading-none mb-0.5">
                Thời gian học
              </p>
              <p className="text-xs font-headline font-bold">14p 22s</p>
            </div>
          </div>
          <div className="bg-surface-container-low/50 backdrop-blur-sm p-3 rounded-lg flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-primary-container flex items-center justify-center">
              <TrendingUp className="size-[var(--icon-sm)] text-on-primary-container" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-on-surface-variant/60 tracking-tight leading-none mb-0.5">
                Độ chính xác
              </p>
              <p className="text-xs font-headline font-bold">88%</p>
            </div>
          </div>
          <div className="bg-surface-container-low/50 backdrop-blur-sm p-3 rounded-lg flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-tertiary-container flex items-center justify-center">
              <Award className="size-[var(--icon-sm)] text-on-tertiary-container" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-on-surface-variant/60 tracking-tight leading-none mb-0.5">
                Chuỗi ngày
              </p>
              <p className="text-xs font-headline font-bold">12 Ngày</p>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
