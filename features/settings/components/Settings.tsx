"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  ChevronRight,
  History,
  MessageSquarePlus,
  Settings as SettingsIcon,
  ShieldCheck,
  Trash2,
  Trophy,
  User,
} from "lucide-react";
import {
  MAX_PROFILE_NAME_LENGTH,
  normalizeProfileName,
  readLearnerProfile,
  sanitizeProfileNameInput,
  saveLearnerProfile,
} from "@/lib/learning-storage";
import { clearAllAppStorage } from "@/lib/app-storage";
import { AppRoute } from "@/lib/routes";

export default function Settings() {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetError, setResetError] = useState(false);

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

  const resetData = () => {
    const result = clearAllAppStorage();
    if (!result.success) {
      setResetError(true);
      return;
    }

    window.location.replace(`/?reset=${Date.now()}`);
  };

  return (
    <main className="mx-auto min-h-screen w-full bg-surface px-4 pb-28 pt-8 sm:px-5 sm:pt-10">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-container/30 text-primary">
          <SettingsIcon className="size-[var(--icon-lg)]" />
        </span>
        <div>
          <h1 className="font-headline text-3xl font-bold">Cài đặt</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Tùy chỉnh trải nghiệm trên thiết bị này.
          </p>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="mt-8 rounded-card border border-surface-container bg-surface-container-lowest p-5"
      >
        <div className="flex items-center gap-2">
          <User className="size-[var(--icon-md)] text-primary" />
          <label htmlFor="name" className="font-headline font-bold">
            Tên hiển thị
          </label>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
          Hỗ trợ tên Unicode và tiếng Việt; chỉ sử dụng chữ cái, chữ số và
          khoảng trắng.
        </p>
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
        <p className="mt-1 text-right text-xs text-on-surface-variant">
          {name.length}/{MAX_PROFILE_NAME_LENGTH}
        </p>
        <button
          className="mt-4 rounded-full bg-primary px-6 py-3 font-bold text-on-primary"
          type="submit"
        >
          Lưu thay đổi
        </button>
        {saved && (
          <p className="mt-3 flex items-center gap-2 text-sm text-secondary">
            <CheckCircle className="size-[var(--icon-sm)]" />
            Đã lưu
          </p>
        )}
      </form>

      <section className="mt-6 overflow-hidden rounded-card border border-surface-container bg-surface-container-lowest">
        <SettingsLink
          href={AppRoute.SettingsPrivacy}
          icon={ShieldCheck}
          title="Chính sách"
          description="Quyền riêng tư và dữ liệu trên thiết bị"
        />
        <SettingsLink
          href={AppRoute.SettingsRating}
          icon={Trophy}
          title="Xếp hạng"
          description="Bảng xếp hạng người học"
        />
        <SettingsLink
          href={AppRoute.SettingsFeedback}
          icon={MessageSquarePlus}
          title="Góp ý ứng dụng"
          description="Gửi ý tưởng, báo lỗi hoặc góp ý nội dung"
        />
        <SettingsLink
          href={AppRoute.SettingsReleaseNotes}
          icon={History}
          title="Phiên bản"
          description="Ghi chú phát hành"
        />
      </section>

      <section className="mt-6 rounded-card border border-error/25 bg-error/5 p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-error/10 text-error">
            <Trash2 className="size-[var(--icon-md)]" />
          </span>
          <div>
            <h2 className="font-headline font-bold text-error">
              Đặt lại toàn bộ dữ liệu
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
              Xóa tên, tiến độ học, kết quả kiểm tra, câu trả lời và các audio
              đã hoàn thành trên thiết bị này.
            </p>
          </div>
        </div>
        {!confirmingReset ? (
          <button
            type="button"
            onClick={() => {
              setConfirmingReset(true);
              setResetError(false);
            }}
            className="mt-4 w-full cursor-pointer rounded-full border border-error px-6 py-3 text-sm font-bold text-error transition-colors hover:bg-error hover:text-on-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/30"
          >
            Xóa toàn bộ dữ liệu
          </button>
        ) : (
          <div className="mt-4 rounded-2xl bg-error/10 p-4">
            <p className="text-sm font-bold text-error">
              Bạn chắc chắn muốn xóa?
            </p>
            <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
              Thao tác này không thể hoàn tác. Ứng dụng sẽ trở về trạng thái như
              lần đầu sử dụng.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="cursor-pointer rounded-full bg-surface-container-high px-4 py-3 text-sm font-bold text-on-surface"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={resetData}
                className="cursor-pointer rounded-full bg-error px-4 py-3 text-sm font-bold text-on-error"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        )}
        {resetError && (
          <p role="alert" className="mt-3 text-xs font-bold text-error">
            Không thể xóa dữ liệu. Hãy kiểm tra quyền lưu trữ của trình duyệt
            rồi thử lại.
          </p>
        )}
      </section>
    </main>
  );
}

function SettingsLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Trophy;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex cursor-pointer items-center gap-3 border-b border-surface-container px-4 py-4 last:border-b-0 hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-[var(--icon-md)]" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-sm">{title}</strong>
        <span className="mt-0.5 block truncate text-xs text-on-surface-variant">
          {description}
        </span>
      </span>
      <ChevronRight className="size-[var(--icon-sm)] shrink-0 text-outline transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
