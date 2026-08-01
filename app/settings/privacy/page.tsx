import { Database, ShieldCheck, Smartphone } from "lucide-react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-surface px-4 pb-28 pt-6">
      <SettingsPageHeader title="Chính sách quyền riêng tư" description="Cách FlashCard sử dụng và lưu dữ liệu học tập của bạn." />
      <div className="mt-7 space-y-3">
        <Policy icon={Smartphone} title="Lưu trên thiết bị">Tên hiển thị, tiến độ học, câu trả lời và lịch sử thi được lưu trong trình duyệt của bạn.</Policy>
        <Policy icon={Database} title="Không có tài khoản">Ứng dụng hiện không có máy chủ người dùng và không đồng bộ dữ liệu giữa các thiết bị.</Policy>
        <Policy icon={ShieldCheck} title="Bạn kiểm soát dữ liệu">Xóa dữ liệu trang web trong trình duyệt sẽ xóa toàn bộ tiến độ và cài đặt cục bộ.</Policy>
      </div>
      <p className="mt-6 text-xs leading-relaxed text-on-surface-variant">Cập nhật lần cuối: 01/08/2026.</p>
    </main>
  );
}

function Policy({ icon: Icon, title, children }: { icon: typeof ShieldCheck; title: string; children: React.ReactNode }) {
  return <section className="rounded-card border border-surface-container bg-surface-container-lowest p-5"><Icon className="size-[var(--icon-lg)] text-primary" /><h2 className="mt-4 font-headline font-bold">{title}</h2><p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{children}</p></section>;
}
