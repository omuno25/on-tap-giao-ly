"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

type FlipCardProps = {
  question: string;
  answer: string;
  flipped: boolean;
  onFlip: () => void;
  icon?: LucideIcon;
};

export default function FlipCard({
  question,
  answer,
  flipped,
  onFlip,
  icon: Icon,
}: FlipCardProps) {
  return (
    <button
      type="button"
      onClick={onFlip}
      className="relative mx-auto block h-[var(--study-card-mobile-height)] w-full max-w-xl cursor-pointer text-left sm:h-auto sm:aspect-[4/3] md:aspect-[5/3.5]"
      style={{ perspective: "1200px", WebkitPerspective: "1200px" }}
      aria-label={flipped ? "Xem câu hỏi" : "Lật thẻ xem đáp án"}
    >
      <motion.div
        className="relative h-full w-full will-change-transform"
        style={{
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
        }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        initial={false}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      >
        <section
          className="absolute inset-0 flex h-full w-full flex-col overflow-hidden rounded-[1.25rem] border border-outline-variant/10 bg-surface-container-lowest shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg) translateZ(0)",
            WebkitTransform: "rotateY(0deg) translateZ(0)",
          }}
        >
          <div className="h-1 w-full bg-tertiary-container" />
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6 text-center sm:p-8">
            {Icon && (
              <span className="mb-5 opacity-40">
                <Icon className="size-[var(--icon-xl)]" />
              </span>
            )}
            <h1 className="max-w-md font-headline text-2xl font-bold leading-tight tracking-tight text-on-surface md:text-3xl">
              {question}
            </h1>
          </div>
        </section>

        <section
          className="absolute inset-0 flex h-full w-full flex-col overflow-hidden rounded-[1.25rem] border border-outline-variant/10 bg-surface-container-lowest shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg) translateZ(0)",
            WebkitTransform: "rotateY(180deg) translateZ(0)",
          }}
        >
          <div className="h-1 w-full bg-primary-container" />
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6 text-center sm:p-8">
            <p className="mx-auto max-w-sm whitespace-pre-line text-lg font-medium leading-relaxed text-on-surface md:text-xl">
              {answer}
            </p>
          </div>
        </section>
      </motion.div>
    </button>
  );
}
