"use client";

import { X, Timer, CheckCircle, Flag, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { getFirstQuestionByType, QUESTION_BANK } from "@/lib/question-bank";
import ProgressBar from "@/components/ui/ProgressBar";

export default function MockTest() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const question = getFirstQuestionByType("multiple-choice");

  if (!question) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <p className="text-on-surface-variant text-sm">
          Chưa có câu hỏi trắc nghiệm trong question bank JSON.
        </p>
      </div>
    );
  }
  const totalQuestions = QUESTION_BANK.length;
  const currentQuestionIndex =
    QUESTION_BANK.findIndex((item) => item.id === question.id) + 1;
  const progress =
    totalQuestions > 0
      ? Math.round((currentQuestionIndex / totalQuestions) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 py-3 border-b border-surface-container">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hover:bg-surface-container-low p-1.5 rounded-full transition-colors active:scale-95"
          >
            <X className="w-5 h-5 text-on-surface" />
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-primary tracking-widest font-headline uppercase">
              Giáo Xứ Đức Mẹ Hằng Cứu Giúp
            </span>
            <span className="text-base font-semibold font-headline text-on-surface leading-tight">
              Thi Thử Giáo Lý Hôn Nhân
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[9px] font-bold text-outline uppercase tracking-tighter">
              Phòng Thi
            </span>
            <span className="text-xs font-medium text-on-surface">
              Kỳ Thi Cuối Khóa
            </span>
          </div>
          <Image
            src="https://picsum.photos/seed/user/100/100"
            alt="User Avatar"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface"
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      <main className="flex-1 pt-20 pb-28 px-6 max-w-4xl mx-auto flex flex-col gap-6 w-full">
        {/* Progress and Timer */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between gap-3">
            <div className="flex justify-between items-center">
              <span className="font-headline font-bold text-on-surface text-sm">
                Câu hỏi {currentQuestionIndex}
                <span className="text-outline font-normal">
                  {" "}
                  / {totalQuestions}
                </span>
              </span>
              <span className="text-secondary font-bold text-[11px] bg-secondary-container px-2.5 py-0.5 rounded-full">
                Tiến độ: {progress}%
              </span>
            </div>
            <ProgressBar progress={progress} />
          </div>
          <div className="bg-surface-container-low p-5 rounded-2xl flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <Timer className="w-5 h-5 text-error fill-current" />
              <span className="font-headline font-black text-on-surface tabular-nums text-lg">
                14:28
              </span>
            </div>
            <span className="text-[9px] font-bold text-outline tracking-wider uppercase">
              Thời gian còn lại
            </span>
          </div>
        </section>

        {/* Question Card */}
        <article className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-primary-container rounded-b-full z-10" />
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-6 p-6 md:p-7 border border-surface-container">
            <div className="flex flex-col gap-3">
              <span className="inline-block self-start px-3 bg-primary/5 text-primary text-[10px] font-bold tracking-widest rounded-full uppercase py-0.5">
                Đề thi chính thức
              </span>
              <h2 className="font-headline font-bold text-on-surface leading-snug text-xl">
                {question.title}
              </h2>
            </div>
            {question.image && (
              <div className="w-full aspect-video md:aspect-[24/9] rounded-xl overflow-hidden bg-surface-container-low relative">
                <Image
                  src={question.image}
                  alt="Question Image"
                  fill
                  className="object-cover mix-blend-multiply opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        </article>

        {/* Options */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {question.options?.map((option) => {
            const isSelected = selectedOption === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`group relative flex items-center gap-4 transition-all duration-300 rounded-xl text-left active:scale-95 overflow-hidden p-3.5 border ${
                  isSelected
                    ? "bg-primary-container border-primary ring-2 ring-primary ring-offset-2 ring-offset-surface"
                    : "bg-surface-container-high border-transparent hover:bg-primary-container/40"
                }`}
              >
                <span
                  className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-headline font-bold text-xs transition-colors ${
                    isSelected
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-lowest text-on-surface group-hover:bg-primary group-hover:text-on-primary"
                  }`}
                >
                  {option.id}
                </span>
                <span
                  className={`font-medium leading-relaxed text-sm ${isSelected ? "text-on-primary-container" : ""}`}
                >
                  {option.text}
                </span>
                {isSelected && (
                  <CheckCircle className="absolute right-3.5 w-5 h-5 text-primary fill-current" />
                )}
              </button>
            );
          })}
        </section>

        {/* Footer Actions */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 mt-2">
          <button className="order-2 md:order-1 flex items-center gap-1.5 text-on-surface/60 hover:text-on-surface font-bold text-[11px] uppercase tracking-widest transition-colors active:scale-95">
            <Flag className="w-4 h-4" />
            Báo lỗi câu hỏi
          </button>
          <div className="order-1 md:order-2 flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-8 py-3 bg-surface-container-highest text-on-surface font-bold rounded-full hover:bg-surface-dim transition-all active:scale-95 text-sm">
              Quay lại
            </button>
            <button className="flex-[2] md:flex-none px-10 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-full shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 text-sm">
              Xác nhận trả lời
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
