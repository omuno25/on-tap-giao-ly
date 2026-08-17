"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, MessageSquarePlus, Send, Star } from "lucide-react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import {
  FEEDBACK_TYPES,
  MAX_FEEDBACK_MESSAGE_LENGTH,
  type FeedbackType,
} from "@/lib/feedback";
import { AppRoute } from "@/lib/routes";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export default function FeedbackForm() {
  const [type, setType] = useState<FeedbackType>("Góp ý");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const body = message.trim();
    if (!body || rating === 0 || status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(AppRoute.FeedbackApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          rating,
          message: body,
          page: window.location.pathname,
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || result.ok !== true) {
        throw new Error(result.message || "Không thể gửi góp ý.");
      }

      setMessage("");
      setRating(0);
      setStatus("success");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể gửi góp ý. Vui lòng thử lại.",
      );
      setStatus("error");
    }
  };

  const markAsEditing = () => {
    if (status !== "submitting") setStatus("idle");
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
              onClick={() => {
                setType(item);
                markAsEditing();
              }}
              aria-pressed={type === item}
              className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition-colors ${type === item ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant"}`}
            >
              {item}
            </button>
          ))}
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold">Mức độ hài lòng</legend>
          <div
            className="mt-2 flex gap-1"
            role="group"
            aria-label="Chọn từ 1 đến 5 sao"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setRating(value);
                  markAsEditing();
                }}
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
            {rating > 0
              ? `Bạn đã chọn ${rating}/5 sao.`
              : "Chưa chọn mức đánh giá."}
          </p>
        </fieldset>

        <label htmlFor="feedback" className="mt-5 block text-sm font-bold">
          Nội dung
        </label>
        <textarea
          id="feedback"
          value={message}
          onChange={(event) => {
            setMessage(
              event.target.value.slice(0, MAX_FEEDBACK_MESSAGE_LENGTH),
            );
            markAsEditing();
          }}
          rows={7}
          placeholder="Nhập góp ý của bạn..."
          required
          className="mt-2 w-full resize-none rounded-control bg-surface-container-low p-4 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="mt-1 text-right text-xs text-on-surface-variant">
          {message.length}/{MAX_FEEDBACK_MESSAGE_LENGTH}
        </p>

        <button
          type="submit"
          disabled={!message.trim() || rating === 0 || status === "submitting"}
          className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "submitting" ? "Đang gửi..." : "Gửi góp ý"}
          <Send className="size-[var(--icon-sm)]" />
        </button>

        <div className="mt-3" aria-live="polite">
          {status === "success" ? (
            <p className="flex items-center gap-2 text-sm font-medium text-secondary">
              <CheckCircle2 className="size-[var(--icon-sm)]" />
              Cảm ơn bạn! Góp ý đã được gửi thành công.
            </p>
          ) : status === "error" ? (
            <p className="text-sm font-medium text-error">{errorMessage}</p>
          ) : null}
        </div>
      </form>
    </main>
  );
}
