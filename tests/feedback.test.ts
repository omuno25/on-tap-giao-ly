import { describe, expect, test } from "bun:test";
import {
  isRejectedFeedbackUpstreamResponse,
  MAX_FEEDBACK_MESSAGE_LENGTH,
  validateFeedbackPayload,
} from "@/lib/feedback";

describe("feedback validation", () => {
  test("chấp nhận và chuẩn hóa góp ý hợp lệ", () => {
    expect(
      validateFeedbackPayload({
        type: "Góp ý",
        rating: 5,
        message: "  Ứng dụng rất hữu ích.  ",
        page: "/cai-dat/phan-hoi",
      }),
    ).toEqual({
      success: true,
      data: {
        type: "Góp ý",
        rating: 5,
        message: "Ứng dụng rất hữu ích.",
        page: "/cai-dat/phan-hoi",
      },
    });
  });

  test("từ chối loại, rating, nội dung và page không hợp lệ", () => {
    const invalidPayloads = [
      { type: "Spam", rating: 5, message: "Test", page: "/" },
      { type: "Góp ý", rating: 0, message: "Test", page: "/" },
      { type: "Góp ý", rating: 5, message: "", page: "/" },
      {
        type: "Góp ý",
        rating: 5,
        message: "a".repeat(MAX_FEEDBACK_MESSAGE_LENGTH + 1),
        page: "/",
      },
      { type: "Góp ý", rating: 5, message: "Test", page: "https://bad" },
    ];

    for (const payload of invalidPayloads) {
      expect(validateFeedbackPayload(payload).success).toBe(false);
    }
  });

  test("ngăn nội dung trở thành công thức Google Sheet", () => {
    const result = validateFeedbackPayload({
      type: "Báo lỗi",
      rating: 2,
      message: "=IMPORTXML(\"https://example.com\")",
      page: "/cai-dat/phan-hoi",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.message.startsWith("'=")).toBe(true);
  });

  test("chỉ từ chối phản hồi thất bại rõ ràng từ Apps Script", () => {
    expect(isRejectedFeedbackUpstreamResponse({ ok: false })).toBe(true);
    expect(isRejectedFeedbackUpstreamResponse({ success: false })).toBe(true);
    expect(isRejectedFeedbackUpstreamResponse({ result: "failed" })).toBe(
      true,
    );
    expect(isRejectedFeedbackUpstreamResponse({ status: "ERROR" })).toBe(true);
    expect(isRejectedFeedbackUpstreamResponse({ ok: true })).toBe(false);
    expect(isRejectedFeedbackUpstreamResponse({ result: "success" })).toBe(
      false,
    );
    expect(isRejectedFeedbackUpstreamResponse({ message: "Đã ghi" })).toBe(
      false,
    );
  });
});
