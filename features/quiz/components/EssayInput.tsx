'use client';

import { ArrowLeft, MoreVertical, Edit3, ChevronLeft, CheckCircle, History } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'motion/react';
import { getQuestionById, QUESTION_BANK } from '@/lib/question-bank';
import TopAppBar from '@/components/layout/TopAppBar';

export default function EssayInput() {
  const [answer, setAnswer] = useState('');
  const question = getQuestionById('13');

  if (!question) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <p className="text-on-surface-variant text-sm">Không tìm thấy câu hỏi tự luận `id=13` trong question bank JSON.</p>
      </div>
    );
  }
  const totalQuestions = QUESTION_BANK.length;
  const currentQuestionIndex = QUESTION_BANK.findIndex((item) => item.id === question.id) + 1;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopAppBar title="Bản kiểm tra Bí tích Hôn nhân" />

      <main className="pt-20 pb-28 px-4 md:px-8 max-w-4xl mx-auto w-full">
        {/* Header Status */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <div className="space-y-1.5">
            <span className="inline-block px-2.5 py-0.5 bg-tertiary-container text-on-tertiary-container rounded-full text-[11px] font-semibold">
              {question.category}
            </span>
            <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight max-w-xl leading-tight">
              {question.title}
            </h2>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1.5">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container-highest" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="6" />
                <circle className="text-primary-fixed" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.84" strokeDashoffset="112" strokeWidth="6" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-headline text-lg font-bold leading-none">{currentQuestionIndex}</span>
                <span className="text-[8px] uppercase tracking-widest text-on-surface-variant font-bold">trên {totalQuestions}</span>
              </div>
            </div>
            <p className="text-on-surface-variant font-medium text-xs">Câu hỏi {currentQuestionIndex} trên {totalQuestions}</p>
          </div>
        </header>

        {/* Main Answer Section */}
        <section className="bg-surface-container-low rounded-2xl p-0.5 overflow-hidden">
          <div className="bg-surface-container-lowest rounded-[14px] editorial-shadow border-t-2 border-tertiary-container">
            <div className="p-5 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Edit3 className="w-5 h-5 text-tertiary" />
                  <h3 className="font-headline text-lg font-semibold text-on-surface">Câu trả lời của bạn</h3>
                </div>
                <span className="text-on-surface-variant text-[11px] font-medium">Gợi ý tối thiểu 150 từ</span>
              </div>
              
              <div className="relative">
                <textarea 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full min-h-[300px] p-5 bg-surface-container-high focus:bg-surface-container-lowest border-none rounded-lg text-base text-on-surface placeholder-on-surface-variant/40 focus:ring-1 focus:ring-primary/20 transition-all outline-none resize-none"
                  placeholder="Nhập câu trả lời của bạn tại đây..."
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-0.5 bg-surface/60 backdrop-blur-sm rounded-full border border-outline-variant/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Đã lưu</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button className="w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2 bg-surface-container-high text-on-surface text-sm font-semibold rounded-lg hover:bg-primary-container/20 transition-all active:scale-95 group">
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Quay lại
                </button>
                <Link href="/essay/review" className="w-full sm:w-auto">
                  <button className="w-full px-8 py-3 flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-bold rounded-lg shadow-md hover:shadow-primary/20 transition-all active:scale-95">
                    Xác nhận câu trả lời
                    <CheckCircle className="w-4 h-4 fill-current" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Help Section */}
        <aside className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-surface-container rounded-xl flex items-start gap-3.5">
            <div className="p-2.5 bg-secondary-container/30 rounded-lg">
              <History className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h4 className="font-headline font-semibold text-sm text-on-surface">Tham chiếu Giáo lý</h4>
              <p className="text-[13px] text-on-surface-variant mt-0.5 leading-relaxed">
                Xem Sách Giáo lý Hội thánh Công giáo (GLHTCG) 1601-1666 để biết giáo lý chi tiết về Bí tích Hôn nhân.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
