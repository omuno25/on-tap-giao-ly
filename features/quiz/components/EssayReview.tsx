"use client";

import {
  HelpCircle,
  CheckCircle,
  Gavel,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getQuestionById, QUESTION_BANK } from "@/lib/question-bank";
import TopAppBar from "@/components/layout/TopAppBar";
import ProgressCircle from "@/components/ui/ProgressCircle";
import { readEssayAnswer } from "@/lib/learning-storage";

export default function EssayReview() {
  const question = getQuestionById("13");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    const frameId = requestAnimationFrame(() =>
      setAnswer(readEssayAnswer("13")),
    );
    return () => cancelAnimationFrame(frameId);
  }, []);

  if (!question) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <p className="text-on-surface-variant text-sm">
          Không tìm thấy câu hỏi tự luận `id=13` trong question bank JSON.
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
      <TopAppBar title="Bài thi Bí tích Hôn phối" />

      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-20 sm:px-5">
        {/* Progress & Header */}
        <div className="mb-8 flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-primary font-bold tracking-wider uppercase">
              Câu hỏi {currentQuestionIndex} trên {totalQuestions}
            </span>
            <h2 className="text-2xl font-bold font-headline text-on-surface leading-tight">
              Xem lại Câu trả lời Tự luận
            </h2>
          </div>
          <ProgressCircle progress={progress} subLabel="Hoàn thành" />
        </div>

        {/* Content Bento Grid */}
        <div className="grid grid-cols-1 gap-5 items-stretch">
          {/* Question Module */}
          <section className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden border border-surface-container-high">
            <div className="absolute top-0 left-0 w-full h-1 bg-tertiary-container" />
            <div className="flex items-start gap-4">
              <div className="bg-primary-container/20 p-2 rounded-lg text-primary">
                <HelpCircle className="size-[var(--icon-md)]" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold font-headline text-on-surface">
                  {question.title}
                </h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">
                  {question.description}
                </p>
              </div>
            </div>
          </section>

          {/* User Answer */}
          <section className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow flex flex-col border border-surface-container">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="size-[var(--icon-sm)] text-outline" />
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Câu trả lời của bạn
              </h4>
            </div>
            <div className="flex-grow">
              <p className="text-on-surface leading-relaxed text-base italic">
                {answer || "Bạn chưa nhập câu trả lời."}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-secondary font-bold bg-secondary-container/20 w-fit px-3 py-1.5 rounded-full">
              <CheckCircle className="size-[var(--icon-sm)] fill-current" />
              <span className="text-xs">Đã ghi nhận câu trả lời</span>
            </div>
          </section>

          {/* Standard Answer */}
          <section className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow border-l-4 border-primary border-y border-r border-surface-container">
            <div className="flex items-center gap-2 mb-4">
              <Gavel className="size-[var(--icon-sm)] text-primary" />
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest">
                Đáp án tham khảo
              </h4>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-surface-container rounded-lg">
                <p className="text-sm text-on-surface leading-relaxed font-medium">
                  {question.standardAnswer ??
                    "Chưa có đáp án chuẩn cho câu này."}
                </p>
              </div>
              <div className="mt-4 p-3 bg-tertiary-container/10 rounded-lg flex gap-3">
                <Lightbulb className="size-[var(--icon-md)] shrink-0 text-tertiary" />
                <p className="text-xs text-on-tertiary-container italic">
                  Hãy tự đối chiếu các ý chính trong câu trả lời của bạn với đáp
                  án tham khảo. Ứng dụng chưa chấm tự luận bằng AI.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Action Section */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/thi-thu"
            className="group flex items-center gap-3 bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-full font-headline font-bold text-base shadow-lg hover:shadow-primary-container/20 transition-all duration-300 active:scale-95"
          >
            Câu tiếp theo
            <ArrowRight className="size-[var(--icon-md)] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </main>
    </div>
  );
}
