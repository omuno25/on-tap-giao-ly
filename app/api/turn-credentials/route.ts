import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type IceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

function isIceServer(value: unknown): value is IceServer {
  if (typeof value !== "object" || value === null) return false;
  const server = value as Record<string, unknown>;
  return (
    typeof server.urls === "string" ||
    (Array.isArray(server.urls) &&
      server.urls.every((url) => typeof url === "string"))
  );
}

function isTurnServer(server: IceServer) {
  const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
  return urls.some(
    (url) => url.startsWith("turn:") || url.startsWith("turns:"),
  );
}

export async function GET() {
  const apiUrl = process.env.METERED_TURN_API_URL;
  const apiKey = process.env.METERED_TURN_API_KEY;

  if (!apiUrl || !apiKey) {
    return NextResponse.json(
      { error: "TURN chưa được cấu hình" },
      { status: 503 },
    );
  }

  try {
    const url = new URL(apiUrl);
    url.searchParams.set("apiKey", apiKey);

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      console.error("Metered TURN trả về HTTP", response.status);
      return NextResponse.json(
        { error: "Không thể lấy TURN credential" },
        { status: 502 },
      );
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      return NextResponse.json(
        { error: "Metered trả về dữ liệu không hợp lệ" },
        { status: 502 },
      );
    }

    const turnConfig = payload.filter(isIceServer).filter(isTurnServer);
    if (turnConfig.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy TURN server" },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { turnConfig },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Không thể gọi Metered TURN:", error);
    return NextResponse.json(
      { error: "Không thể lấy TURN credential" },
      { status: 502 },
    );
  }
}
