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
    <header className="fixed inset-x-0 top-0 z-50 mx-auto w-full max-w-[var(--app-max-width)] glass-header">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-2 px-3 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {showBack && (
            <button 
              onClick={() => router.back()}
              className="flex items-center justify-center p-1.5 rounded-full hover:bg-primary-container/20 transition-colors duration-200 active:scale-95"
            >
            <ArrowLeft className="size-[var(--icon-md)] text-brand-mark" />
            </button>
          )}
          <h1 className="truncate font-headline text-sm font-semibold tracking-tight text-brand-mark sm:text-base">
            {title}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {rightElement || (
            <button className="p-1.5 rounded-full hover:bg-primary-container/20 transition-colors duration-200">
              <MoreVertical className="size-[var(--icon-md)] text-brand-mark" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
