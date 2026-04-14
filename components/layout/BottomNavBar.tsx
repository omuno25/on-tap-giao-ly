'use client';

import { ListOrdered, ClipboardCheck, Send, BookOpen, GraduationCap, BarChart3, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function BottomNavBar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Thư viện', icon: BookOpen, href: '/library' },
    { label: 'Học tập', icon: GraduationCap, href: '/' },
    { label: 'Thống kê', icon: BarChart3, href: '/stats' },
    { label: 'Hồ sơ', icon: User, href: '/profile' },
  ];

  // For quiz/study screens, we might want a different nav or none.
  // But based on the screenshots, there's a specific one for questions.
  const isQuizPage = pathname.startsWith('/quiz') || pathname.startsWith('/study') || pathname.startsWith('/test');

  if (isQuizPage) {
    return (
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_-1px_0_rgba(0,0,0,0.05)] rounded-t-2xl">
        <div className="flex justify-around items-center px-4 pb-5 pt-1.5">
          <Link href="#" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1.5 hover:bg-surface-container-low transition-colors rounded-xl active:scale-90">
            <ListOrdered className="w-5 h-5" />
            <span className="font-headline text-[10px] mt-0.5">Câu hỏi</span>
          </Link>
          <Link href="#" className="flex flex-col items-center justify-center bg-primary-container/20 text-primary rounded-xl px-4 py-1.5 active:scale-90">
            <ClipboardCheck className="w-5 h-5" />
            <span className="font-headline text-[10px] mt-0.5 font-bold">Xem lại</span>
          </Link>
          <Link href="#" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1.5 hover:bg-surface-container-low transition-colors rounded-xl active:scale-90">
            <Send className="w-5 h-5" />
            <span className="font-headline text-[10px] mt-0.5">Nộp bài</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-surface/80 backdrop-blur-md flex justify-around items-center px-4 py-2 shadow-[0_-4px_15px_rgba(48,51,48,0.04)] rounded-t-xl">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center transition-all tap-highlight-transparent active:scale-90 px-3 py-1 rounded-lg",
              isActive ? "bg-primary/10 text-primary" : "text-on-surface/60 hover:text-primary"
            )}
          >
            <item.icon className={cn("w-5 h-5", isActive && "fill-current")} />
            <span className="font-headline text-[10px] font-medium mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
