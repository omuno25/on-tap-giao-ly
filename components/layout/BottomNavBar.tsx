"use client";

import { GraduationCap, BarChart3, Settings, UsersRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import { AppRoute } from "@/lib/routes";

export default function BottomNavBar() {
  const pathname = usePathname();

  // Các màn hình con của phòng thi là một luồng tập trung và có thể đang giữ
  // kết nối P2P. Không hiển thị điều hướng toàn cục để tránh rời phòng ngoài ý
  // muốn; từng màn hình cung cấp hành động rời/đóng phòng riêng.
  if (
    pathname !== AppRoute.ExamRoom &&
    pathname.startsWith(`${AppRoute.ExamRoom}/`)
  ) {
    return null;
  }

  const navItems = [
    { label: "Học tập", icon: GraduationCap, href: AppRoute.Home },
    { label: "Phòng thi", icon: UsersRound, href: AppRoute.ExamRoom },
    { label: "Thống kê", icon: BarChart3, href: AppRoute.Statistics },
    { label: "Cài đặt", icon: Settings, href: AppRoute.Settings },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[var(--app-max-width)] items-center justify-around rounded-t-2xl border-t border-surface-container bg-surface/90 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-bottom-nav backdrop-blur-xl">
      {navItems.map((item) => {
        const isActive =
          item.href === AppRoute.Home
            ? pathname === AppRoute.Home
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center transition-all tap-highlight-transparent active:scale-90 px-3 py-1 rounded-lg",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-on-surface/60 hover:text-primary",
            )}
          >
            <item.icon
              className="size-[var(--icon-md)] fill-none"
              strokeWidth={isActive ? 2.6 : 2}
            />
            <span className="font-headline text-[10px] font-medium mt-0.5">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
