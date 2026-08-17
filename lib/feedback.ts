export const FEEDBACK_TYPES = ["Góp ý", "Báo lỗi"] as const;
export const MAX_FEEDBACK_MESSAGE_LENGTH = 1000;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export type FeedbackPayload = {
  type: FeedbackType;
  rating: number;
  message: string;
  page: string;
};

export type FeedbackValidationResult =
  | { success: true; data: FeedbackPayload }
  | { success: false; error: string };

export function validateFeedbackPayload(
  value: unknown,
): FeedbackValidationResult {
  if (!isRecord(value)) {
    return { success: false, error: "Dữ liệu góp ý không hợp lệ." };
  }

  const type = value.type;
  const rating = value.rating;
  const message = typeof value.message === "string" ? value.message.trim() : "";
  const page = typeof value.page === "string" ? value.page.trim() : "";

  if (!FEEDBACK_TYPES.includes(type as FeedbackType)) {
    return { success: false, error: "Loại góp ý không hợp lệ." };
  }

  if (!Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5) {
    return { success: false, error: "Mức đánh giá phải từ 1 đến 5 sao." };
  }

  if (!message || message.length > MAX_FEEDBACK_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `Nội dung phải có từ 1 đến ${MAX_FEEDBACK_MESSAGE_LENGTH} ký tự.`,
    };
  }

  if (!page.startsWith("/") || page.startsWith("//") || page.length > 200) {
    return { success: false, error: "Trang gửi góp ý không hợp lệ." };
  }

  return {
    success: true,
    data: {
      type: type as FeedbackType,
      rating: rating as number,
      message: protectSheetCell(message),
      page,
    },
  };
}

export function isRejectedFeedbackUpstreamResponse(value: unknown) {
  if (!isRecord(value)) return false;

  if (value.ok === false || value.success === false) return true;

  const result = normalizeStatus(value.result);
  const status = normalizeStatus(value.status);
  return isFailureStatus(result) || isFailureStatus(status);
}

function protectSheetCell(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeStatus(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isFailureStatus(value: string) {
  return ["error", "failed", "failure", "rejected"].includes(value);
}
