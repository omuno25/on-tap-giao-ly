"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  createGuestName,
  hasLearnerProfile,
  MAX_PROFILE_NAME_LENGTH,
  sanitizeProfileNameInput,
  saveLearnerProfile,
} from "@/lib/learning-storage";

export default function NameSetupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      if (!hasLearnerProfile()) setIsOpen(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const finish = (submittedName?: string) => {
    const resolvedName = submittedName?.trim() || createGuestName();
    saveLearnerProfile({ name: resolvedName });
    setIsOpen(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    finish(name);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-on-surface/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-setup-title"
        aria-describedby="name-setup-description"
        className="w-full max-w-[var(--app-max-width)] rounded-t-feature bg-surface-container-lowest p-5 shadow-editorial sm:rounded-feature sm:p-7"
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-on-primary">
          <Sparkles className="size-[var(--icon-md)]" />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Chào mừng bạn
        </p>
        <h2
          id="name-setup-title"
          className="mt-2 font-headline text-2xl font-bold"
        >
          Mình nên gọi bạn là gì?
        </h2>
        <p
          id="name-setup-description"
          className="mt-2 text-sm leading-relaxed text-on-surface-variant"
        >
          Tên này chỉ được lưu trên thiết bị và có thể đổi lại trong Cài đặt.
        </p>

        <form onSubmit={submit} className="mt-6">
          <label htmlFor="onboarding-name" className="text-sm font-bold">
            Tên hiển thị
          </label>
          <input
            ref={inputRef}
            id="onboarding-name"
            name="name"
            value={name}
            maxLength={MAX_PROFILE_NAME_LENGTH}
            onChange={(event) =>
              setName(sanitizeProfileNameInput(event.target.value))
            }
            placeholder="Ví dụ: An"
            autoComplete="name"
            className="mt-2 w-full rounded-control border border-outline-variant/50 bg-surface-container-low px-4 py-3.5 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-bold text-on-primary transition active:scale-[0.98]"
          >
            Bắt đầu học
            <ArrowRight className="size-[var(--icon-sm)]" />
          </button>
          <button
            type="button"
            onClick={() => finish()}
            className="mt-2 w-full px-6 py-3 text-sm font-bold text-on-surface-variant transition hover:text-primary"
          >
            Để sau, dùng tên ngẫu nhiên
          </button>
        </form>
      </section>
    </div>
  );
}
