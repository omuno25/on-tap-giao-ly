import { BookOpen, Code2, Heart } from "lucide-react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-surface px-4 pb-28 pt-6">
      <SettingsPageHeader title="Về tôi" description="Thông tin về FlashCard và mục tiêu của dự án." />
      <section className="mt-7 rounded-feature bg-hero p-6 text-on-hero">
        <BookOpen className="size-[var(--icon-xl)]" />
        <h2 className="mt-5 font-headline text-2xl font-bold">FlashCard</h2>
        <p className="mt-3 text-sm leading-relaxed text-on-hero-muted">Ứng dụng hỗ trợ học Giáo lý Hôn nhân, Giáo lý Dự tòng và các kinh cần thuộc theo cách đơn giản, tập trung trên mobile.</p>
      </section>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <InfoCard icon={Heart} title="Mục tiêu" text="Giúp việc ôn tập dễ tiếp cận hơn mỗi ngày." />
        <InfoCard icon={Code2} title="Mã nguồn mở" text="Dự án được chuẩn bị để cộng đồng cùng đóng góp." />
      </div>
      <section className="mt-5 rounded-card border border-surface-container bg-surface-container-lowest p-5"><p className="text-xs font-bold uppercase tracking-wider text-primary">Phiên bản</p><p className="mt-2 font-headline text-lg font-bold">0.1.0</p></section>
    </main>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof Heart; title: string; text: string }) {
  return <section className="rounded-card bg-surface-container-low p-4"><Icon className="size-[var(--icon-md)] text-primary" /><h2 className="mt-3 text-sm font-bold">{title}</h2><p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{text}</p></section>;
}
