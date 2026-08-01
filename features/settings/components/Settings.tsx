"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, ChevronRight, Info, Settings as SettingsIcon, ShieldCheck, Star, User } from "lucide-react";
import {
  MAX_PROFILE_NAME_LENGTH,
  normalizeProfileName,
  readLearnerProfile,
  sanitizeProfileNameInput,
  saveLearnerProfile,
} from "@/lib/learning-storage";

export default function Settings() {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() =>
      setName(readLearnerProfile().name),
    );
    return () => cancelAnimationFrame(frameId);
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = normalizeProfileName(name);
    setName(normalized);
    saveLearnerProfile({ name: normalized });
    setSaved(true);
  };

  return (
    <main className="mx-auto min-h-screen w-full bg-surface px-4 pb-28 pt-8 sm:px-5 sm:pt-10">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-container/30 text-primary">
          <SettingsIcon className="size-[var(--icon-lg)]" />
        </span>
        <div>
          <h1 className="font-headline text-3xl font-bold">Cài đặt</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Tùy chỉnh trải nghiệm trên thiết bị này.</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 rounded-card border border-surface-container bg-surface-container-lowest p-5">
        <div className="flex items-center gap-2">
          <User className="size-[var(--icon-md)] text-primary" />
          <label htmlFor="name" className="font-headline font-bold">Tên hiển thị</label>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">Hỗ trợ tên Unicode và tiếng Việt; chỉ sử dụng chữ cái, chữ số và khoảng trắng.</p>
        <input
          id="name"
          value={name}
          maxLength={MAX_PROFILE_NAME_LENGTH}
          onChange={(event) => {
            setName(sanitizeProfileNameInput(event.target.value));
            setSaved(false);
          }}
          className="mt-4 w-full rounded-control bg-surface-container-high p-3 outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="mt-1 text-right text-xs text-on-surface-variant">{name.length}/{MAX_PROFILE_NAME_LENGTH}</p>
        <button className="mt-4 rounded-full bg-primary px-6 py-3 font-bold text-on-primary" type="submit">Lưu thay đổi</button>
        {saved && <p className="mt-3 flex items-center gap-2 text-sm text-secondary"><CheckCircle className="size-[var(--icon-sm)]" />Đã lưu</p>}
      </form>

      <section className="mt-6 overflow-hidden rounded-card border border-surface-container bg-surface-container-lowest">
        <SettingsLink href="/settings/privacy" icon={ShieldCheck} title="Chính sách" description="Quyền riêng tư và dữ liệu trên thiết bị" />
        <SettingsLink href="/settings/rating" icon={Star} title="Xếp hạng" description="Đánh giá trải nghiệm ứng dụng" />
        <SettingsLink href="/settings/about" icon={Info} title="Về tôi" description="Thông tin về dự án FlashCard" />
      </section>
    </main>
  );
}

function SettingsLink({ href, icon: Icon, title, description }: { href: string; icon: typeof Star; title: string; description: string }) {
  return (
    <Link href={href} className="group flex cursor-pointer items-center gap-3 border-b border-surface-container px-4 py-4 last:border-b-0 hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-[var(--icon-md)]" /></span>
      <span className="min-w-0 flex-1"><strong className="block text-sm">{title}</strong><span className="mt-0.5 block truncate text-xs text-on-surface-variant">{description}</span></span>
      <ChevronRight className="size-[var(--icon-sm)] shrink-0 text-outline transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
