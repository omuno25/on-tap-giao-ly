"use client";

import { FormEvent, useState } from "react";
import { ExternalLink, MessageSquarePlus, Star } from "lucide-react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";

const FEEDBACK_TYPES = ["Góp ý", "Báo lỗi", "Nội dung"] as const;
const GITHUB_ISSUE_URL =
  "https://github.com/omuno25/on-tap-giao-ly/issues/new";

export default function FeedbackForm() {
  const [type, setType] = useState<(typeof FEEDBACK_TYPES)[number]>("Góp ý");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const body = message.trim();
    if (!body || rating === 0) return;

    const query = new URLSearchParams({
      title: `[${type}] `,
      body: `**Đánh giá:** ${rating}/5 sao\n\n${body}`,
    });
    window.open(
      `${GITHUB_ISSUE_URL}?${query.toString()}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <main className="min-h-screen bg-surface px-4 pb-28 pt-6">
      <SettingsPageHeader
        title="Góp ý ứng dụng"
        description="Chia sẻ ý tưởng, báo lỗi hoặc góp ý về nội dung."
      />

      <form
        onSubmit={submit}
        className="mt-7 rounded-card border border-surface-container bg-surface-container-lowest p-5"
      >
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="size-[var(--icon-md)] text-primary" />
          <h2 className="font-headline font-bold">Bạn muốn góp ý điều gì?</h2>
        </div>

        <div
          className="mt-5 flex flex-wrap gap-2"
          role="group"
          aria-label="Loại góp ý"
        >
          {FEEDBACK_TYPES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setType(item)}
              aria-pressed={type === item}
              className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition-colors ${type === item ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant"}`}
            >
              {item}
            </button>
          ))}
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold">Mức độ hài lòng</legend>
          <div className="mt-2 flex gap-1" role="group" aria-label="Chọn từ 1 đến 5 sao">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} sao`}
                aria-pressed={rating === value}
                className="cursor-pointer rounded-xl p-2 transition-colors hover:bg-tertiary-container/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/40"
              >
                <Star
                  className={`size-[var(--icon-lg)] ${value <= rating ? "fill-tertiary-container text-tertiary" : "text-outline-variant"}`}
                />
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">
            {rating > 0 ? `Bạn đã chọn ${rating}/5 sao.` : "Chưa chọn mức đánh giá."}
          </p>
        </fieldset>

        <label htmlFor="feedback" className="mt-5 block text-sm font-bold">
          Nội dung
        </label>
        <textarea
          id="feedback"
          value={message}
          onChange={(event) => setMessage(event.target.value.slice(0, 1000))}
          rows={7}
          placeholder="Nhập góp ý của bạn..."
          required
          className="mt-2 w-full resize-none rounded-control bg-surface-container-low p-4 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="mt-1 text-right text-xs text-on-surface-variant">
          {message.length}/1000
        </p>

        <button
          type="submit"
          disabled={!message.trim() || rating === 0}
          className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Tiếp tục trên GitHub{" "}
          <ExternalLink className="size-[var(--icon-sm)]" />
        </button>
        <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
          Nội dung chỉ được chuyển sang GitHub khi bạn bấm nút. Bạn có thể kiểm
          tra lại trước khi gửi.
        </p>
      </form>
    </main>
  );
}
