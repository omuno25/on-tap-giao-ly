'use client';

import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TopAppBarProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export default function TopAppBar({ title, showBack = true, rightElement }: TopAppBarProps) {
  const router = useRouter();

  return (
    <header className="fixed top-0 w-full z-50 glass-header">
      <div className="flex justify-between items-center w-full px-5 py-3">
        <div className="flex items-center gap-3">
          {showBack && (
            <button 
              onClick={() => router.back()}
              className="flex items-center justify-center p-1.5 rounded-full hover:bg-primary-container/20 transition-colors duration-200 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-[#457B9D]" />
            </button>
          )}
          <h1 className="font-headline text-base font-semibold tracking-tight text-[#457B9D]">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {rightElement || (
            <button className="p-1.5 rounded-full hover:bg-primary-container/20 transition-colors duration-200">
              <MoreVertical className="w-5 h-5 text-[#457B9D]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
