'use client';

import { GraduationCap, BarChart3, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function BottomNavBar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Học tập', icon: GraduationCap, href: '/' },
    { label: 'Thống kê', icon: BarChart3, href: '/stats' },
    { label: 'Hồ sơ', icon: User, href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-surface/80 backdrop-blur-md flex justify-around items-center px-4 py-2 shadow-[0_-4px_15px_rgba(48,51,48,0.04)] rounded-t-xl">
      {navItems.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
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
