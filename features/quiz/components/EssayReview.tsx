'use client';

import { ArrowLeft, MoreVertical, HelpCircle, CheckCircle, Gavel, Lightbulb, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { MOCK_QUESTIONS } from '@/lib/mock-data';
import TopAppBar from '@/components/layout/TopAppBar';
import ProgressCircle from '@/components/ui/ProgressCircle';

export default function EssayReview() {
  const question = MOCK_QUESTIONS.find(q => q.id === '12')!;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopAppBar title="Bài thi Bí tích Hôn phối" />

      <main className="pt-20 pb-28 px-5 max-w-3xl mx-auto w-full">
        {/* Progress & Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-primary font-bold tracking-wider uppercase">Câu hỏi 12 trên 20</span>
            <h2 className="text-2xl font-bold font-headline text-on-surface leading-tight">Xem lại Câu trả lời Tự luận</h2>
          </div>
          <ProgressCircle progress={60} subLabel="Hoàn thành" />
        </div>

        {/* Content Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* Question Module */}
          <section className="md:col-span-12 bg-surface-container-low p-6 rounded-xl relative overflow-hidden border border-surface-container-high">
            <div className="absolute top-0 left-0 w-full h-1 bg-tertiary-container" />
            <div className="flex items-start gap-4">
              <div className="bg-primary-container/20 p-2 rounded-lg text-primary">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold font-headline text-on-surface">{question.title}</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">
                  {question.description}
                </p>
              </div>
            </div>
          </section>

          {/* User Answer */}
          <section className="md:col-span-12 lg:col-span-5 bg-surface-container-lowest p-6 rounded-xl editorial-shadow flex flex-col border border-surface-container">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-outline" />
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Câu trả lời của bạn</h4>
            </div>
            <div className="flex-grow">
              <p className="text-on-surface leading-relaxed text-base italic">
                &quot;Các đặc tính chính là đơn nhất và bất khả phân ly. Đơn nhất nghĩa là chỉ có một phối ngẫu, và bất khả phân ly nghĩa là hôn nhân không thể bị phá vỡ cho đến khi qua đời. Những điều này quan trọng vì chúng phản chiếu mối quan hệ giữa Chúa Kitô và Hội Thánh.&quot;
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-secondary font-bold bg-secondary-container/20 w-fit px-3 py-1.5 rounded-full">
              <CheckCircle className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs">Đã ghi nhận câu trả lời</span>
            </div>
          </section>

          {/* Standard Answer */}
          <section className="md:col-span-12 lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl editorial-shadow border-l-4 border-primary border-y border-r border-surface-container">
            <div className="flex items-center gap-2 mb-4">
              <Gavel className="w-4 h-4 text-primary" />
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest">Tiêu chuẩn Giáo luật</h4>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-surface-container rounded-lg">
                <p className="text-xs text-on-surface-variant font-bold mb-1 font-headline">Điều 1056 quy định:</p>
                <p className="text-sm text-on-surface leading-relaxed font-medium">
                  &quot;Các đặc tính thiết yếu của hôn nhân là sự <strong className="text-primary">đơn nhất</strong> và tính <strong className="text-primary">bất khả phân ly</strong>; trong hôn nhân Kitô giáo, các đặc tính ấy còn có một sự bền vững đặc biệt nhờ bí tích.&quot;
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p className="text-on-surface-variant text-sm leading-snug">
                    <span className="font-bold text-on-surface">Đơn nhất:</span> Loại trừ đa thê và đa phu. Nó biểu thị sự kết hợp độc chiếm giữa một người nam và một người nữ.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p className="text-on-surface-variant text-sm leading-snug">
                    <span className="font-bold text-on-surface">Bất khả phân ly:</span> Sự ràng buộc vĩnh viễn không thể chấm dứt bởi bất kỳ quyền năng nhân loại nào hoặc vì bất kỳ nguyên nhân nào khác ngoài cái chết.
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-tertiary-container/10 rounded-lg flex gap-3">
                <Lightbulb className="w-5 h-5 text-tertiary" />
                <p className="text-xs text-on-tertiary-container italic">
                  Gợi ý: Câu trả lời của bạn đã xác định đúng cả hai đặc tính và mối liên hệ biểu trưng của chúng với Chúa Kitô và Hội Thánh.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Action Section */}
        <div className="mt-10 flex justify-center">
          <button className="group flex items-center gap-3 bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-full font-headline font-bold text-base shadow-lg hover:shadow-primary-container/20 transition-all duration-300 active:scale-95">
            Câu tiếp theo
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>
    </div>
  );
}
