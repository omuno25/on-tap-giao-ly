"use client";

import {
  Play,
  HelpCircle,
  Flame,
  Church,
  Plus,
  Search,
  Menu,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProgressCircle from "@/components/ui/ProgressCircle";
import { motion } from "motion/react";
import { QUESTION_BANK } from "@/lib/question-bank";

export default function Dashboard() {
  const totalQuestions = QUESTION_BANK.length;

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Bar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md flex items-center justify-between px-5 py-3 border-b border-surface-container">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
            <Menu className="w-5 h-5 text-on-surface" />
          </button>
          <h1 className="text-xl font-black tracking-tight text-[#457B9D] font-headline">
            FlashCard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
            <Search className="w-5 h-5 text-on-surface" />
          </button>
          <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-container-high border-2 border-primary-container">
            <Image
              src="https://picsum.photos/seed/user/100/100"
              alt="User Avatar"
              width={36}
              height={36}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-28 px-5 max-w-7xl mx-auto">
        {/* Hero Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="max-w-2xl">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-2">
              Chào mừng, <span className="text-primary">User</span>.
            </h2>
            <p className="text-on-surface-variant text-base leading-relaxed">
              Không gian học tập của bạn đã sẵn sàng. Bạn có{" "}
              <span className="font-bold text-on-surface">
                {totalQuestions} câu hỏi
              </span>{" "}
              cần ôn tập hôm nay.
            </p>
          </div>

          {/* Daily Goal */}
          <div className="bg-surface-container-low p-4 rounded-2xl flex items-center gap-4 shadow-sm">
            <ProgressCircle progress={0} size={56} strokeWidth={6} label="0%" />
            <div>
              <p className="font-headline text-xs font-semibold text-on-surface">
                Mục tiêu ngày
              </p>
              <p className="text-[11px] text-on-surface-variant">
                0/{totalQuestions} câu đã hoàn thành
              </p>
            </div>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Quick Start Card */}
          <div className="md:col-span-8 relative overflow-hidden bg-primary-container/20 rounded-[1.5rem] p-6 flex flex-col justify-between min-h-[280px] group">
            <div className="relative z-10">
              <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 inline-block">
                Khuyên dùng
              </span>
              <h3 className="font-headline text-2xl font-extrabold text-on-primary-container max-w-sm mb-3 leading-tight">
                Bắt đầu học Giáo lý Hôn nhân?
              </h3>
              <p className="text-on-primary-container/80 max-w-xs text-sm">
                Bộ {totalQuestions} câu hỏi thi Giáo lý đang chờ bạn khám phá.
                Hãy bắt đầu ngay bây giờ.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap gap-3">
              <Link href="/study">
                <button className="bg-primary text-on-primary font-headline font-bold px-6 py-3 rounded-lg text-sm flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20">
                  <Play className="w-4 h-4 fill-current" />
                  Bắt đầu học
                </button>
              </Link>
              <Link href="/test">
                <button className="bg-surface-container-highest text-on-surface-variant font-headline font-bold px-6 py-3 rounded-lg text-sm flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 border border-outline/20">
                  <HelpCircle className="w-4 h-4" />
                  Thi thử ngẫu nhiên
                </button>
              </Link>
            </div>

            {/* Decorative BG */}
            <div className="absolute top-0 right-0 w-1/2 h-full hidden md:block">
              <Image
                src="https://picsum.photos/seed/church/800/600"
                alt="Church Interior"
                fill
                className="object-cover mix-blend-overlay opacity-40"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-primary-container/20"></div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="md:col-span-4 bg-tertiary-container rounded-[1.5rem] p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <Flame className="w-8 h-8 text-on-tertiary-container fill-current" />
                <span className="font-headline font-black text-3xl text-on-tertiary-container">
                  0
                </span>
              </div>
              <p className="font-headline font-bold text-sm text-on-tertiary-container mt-3">
                Chuỗi ngày học
              </p>
            </div>
            <div className="mt-6">
              <p className="text-[11px] text-on-tertiary-container/70 mb-2 font-medium">
                Tiến độ tuần
              </p>
              <div className="flex items-end gap-1 h-12">
                {[0, 0, 0, 0, 0, 0, 0].map((_, i) => (
                  <div
                    key={i}
                    className="w-full bg-on-tertiary-container/10 rounded-t-sm h-[10%]"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* My Decks Section */}
          <div className="md:col-span-12 mt-4 flex justify-between items-center">
            <h3 className="font-headline text-xl font-bold text-on-surface">
              Bộ thẻ của tôi
            </h3>
          </div>

          <div className="md:col-span-12 bg-surface-container-lowest rounded-2xl p-5 shadow-sm border-t-[3px] border-primary flex flex-col md:flex-row justify-between items-center gap-5 hover:scale-[1.005] transition-transform">
            <div className="flex items-start gap-4 w-full md:w-auto">
              <div className="bg-surface-container-low p-2.5 rounded-xl shrink-0">
                <Church className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-headline text-lg font-bold text-on-surface leading-tight mb-0.5">
                  Bộ {totalQuestions} Câu Hỏi Thi Giáo Lý
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Giáo lý Hôn nhân & Gia đình
                </p>
              </div>
            </div>
            <div className="w-full md:w-56">
              <div className="flex justify-between text-[10px] font-bold mb-1.5">
                <span className="text-on-surface-variant uppercase tracking-wider">
                  0 / {totalQuestions} Thẻ
                </span>
                <span className="text-primary">0%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full w-0" />
              </div>
            </div>
            <Link href="/study">
              <button className="bg-primary text-on-primary font-headline font-bold px-5 py-2 rounded-lg text-[13px] transition-all hover:opacity-90 active:scale-95">
                Tiếp tục
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* FAB */}
      <button className="fixed bottom-24 right-6 bg-primary text-on-primary w-12 h-12 rounded-xl shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
