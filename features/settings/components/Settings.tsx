"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle, Settings as SettingsIcon, User } from "lucide-react";
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
        <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">Chỉ sử dụng chữ cái, chữ số và khoảng trắng.</p>
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
    </main>
  );
}
