import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SettingsPageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header>
      <Link href="/settings" className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-primary">
        <ArrowLeft className="size-[var(--icon-sm)]" />
        Cài đặt
      </Link>
      <h1 className="mt-7 font-headline text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{description}</p>
    </header>
  );
}
