import { NextResponse } from "next/server";
import {
  isRejectedFeedbackUpstreamResponse,
  validateFeedbackPayload,
} from "@/lib/feedback";

const MAX_REQUEST_BYTES = 4_096;
const UPSTREAM_TIMEOUT_MS = 10_000;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { ok: false, message: "Dữ liệu gửi lên quá lớn." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Dữ liệu góp ý không hợp lệ." },
      { status: 400 },
    );
  }

  const validation = validateFeedbackPayload(body);
  if (!validation.success) {
    return NextResponse.json(
      { ok: false, message: validation.error },
      { status: 400 },
    );
  }

  const endpoint = getGoogleScriptEndpoint();
  if (!endpoint) {
    console.error("GOOGLE_SCRIPT_URL is missing or invalid.");
    return NextResponse.json(
      { ok: false, message: "Dịch vụ góp ý chưa được cấu hình." },
      { status: 503 },
    );
  }

  const payload = new URLSearchParams({
    type: validation.data.type,
    rating: String(validation.data.rating),
    message: validation.data.message,
    page: validation.data.page,
  });

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: payload,
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script returned ${response.status}.`);
    }

    const responseText = await response.text();
    const result = parseJson(responseText);
    if (isRejectedFeedbackUpstreamResponse(result)) {
      throw new Error("Google Apps Script rejected the feedback.");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "Unable to submit feedback to Google Apps Script.",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { ok: false, message: "Không thể gửi góp ý lúc này. Vui lòng thử lại." },
      { status: 502 },
    );
  }
}

function parseJson(value: string): unknown {
  if (!value.trim()) return null;

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function getGoogleScriptEndpoint() {
  const value = process.env.GOOGLE_SCRIPT_URL;
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.hostname === "script.google.com" &&
      url.pathname.startsWith("/macros/s/") &&
      url.pathname.endsWith("/exec")
      ? url
      : null;
  } catch {
    return null;
  }
}
