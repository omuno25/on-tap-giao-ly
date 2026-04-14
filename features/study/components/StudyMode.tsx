"use client";

import { X, Church, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QUESTION_BANK } from "@/lib/question-bank";

export default function StudyMode() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const flashcards = QUESTION_BANK.filter((item) => item.type === "flashcard");
  const flashcard = flashcards[currentCardIndex];

  if (!flashcard) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <p className="text-on-surface-variant text-sm">
          Chưa có flashcard trong question bank JSON.
        </p>
      </div>
    );
  }
  const totalQuestions = flashcards.length;
  const currentQuestionIndex = currentCardIndex + 1;
  const progress =
    totalQuestions > 0
      ? Math.round((currentQuestionIndex / totalQuestions) * 100)
      : 0;

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
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 py-3 border-b border-surface-container">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-95"
          >
            <X className="w-5 h-5 text-on-surface" />
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant leading-none mb-0.5">
              Phiên học
            </span>
            <span className="font-headline font-bold text-primary text-sm leading-tight">
              Giáo lý Hôn nhân - Bộ {totalQuestions} câu
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-on-surface-variant">
            {currentQuestionIndex}/{totalQuestions} thẻ
          </span>
          <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-secondary to-secondary-container rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-20 pb-28">
        {/* Flashcard */}
        <div
          className="w-full max-w-xl aspect-[4/3] md:aspect-[5/3.5] relative perspective-1000 cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ perspective: "1200px", WebkitPerspective: "1200px" }}
        >
          <motion.div
            className="w-full h-full relative will-change-transform"
            style={{
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
              transform: "translateZ(0)",
              WebkitTransform: "translateZ(0)",
            }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            initial={false}
            transition={{ duration: 0.45, ease: "easeInOut" }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 w-full h-full bg-surface-container-lowest rounded-[1.25rem] shadow-lg border border-outline-variant/10 flex flex-col overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(0deg) translateZ(0)",
                WebkitTransform: "rotateY(0deg) translateZ(0)",
              }}
            >
              <div className="h-1 w-full bg-tertiary-container" />
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-5 opacity-40">
                  <Church className="w-10 h-10" />
                </div>
                <h1 className="text-2xl md:text-3xl font-headline font-bold tracking-tight text-on-surface max-w-md leading-tight">
                  {flashcard.title}
                </h1>
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 w-full h-full bg-surface-container-lowest rounded-[1.25rem] shadow-lg border border-outline-variant/10 flex flex-col overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg) translateZ(0)",
                WebkitTransform: "rotateY(180deg) translateZ(0)",
              }}
            >
              <div className="h-1 w-full bg-primary-container" />
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <p className="text-lg md:text-xl text-on-surface leading-relaxed max-w-sm mx-auto font-medium">
                  {flashcard.standardAnswer ?? "Chưa có đáp án cho thẻ này."}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

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
                  <RefreshCw className="w-4 h-4" />
                  Lật thẻ
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="rating-btns"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 flex items-center justify-center gap-3 p-1.5 rounded-xl"
              >
                <button
                  onClick={reviewCurrentCard}
                  disabled={isTransitioning}
                  className="w-[170px] h-[50px] rounded-full bg-surface-container-high text-on-surface font-headline font-bold text-sm shadow-sm hover:bg-surface-container transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Xem lại
                </button>
                <button
                  onClick={goToNextCard}
                  disabled={isTransitioning}
                  className="w-[170px] h-[50px] rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
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
              <Timer className="w-4 h-4 text-on-secondary-container" />
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
              <TrendingUp className="w-4 h-4 text-on-primary-container" />
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
              <Award className="w-4 h-4 text-on-tertiary-container" />
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
