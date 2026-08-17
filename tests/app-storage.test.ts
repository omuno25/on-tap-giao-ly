import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  STORAGE_KEYS,
  clearAllAppStorage,
  readStorageIndex,
  readStorageJson,
  readStorageValue,
  writeStorageIndex,
  writeStorageJson,
  writeStorageValue,
} from "@/lib/app-storage";
import {
  clearActiveExamSession,
  getRemainingExamSeconds,
  getOrCreateUserId,
  readActiveExamSession,
  saveActiveExamSession,
} from "@/lib/learning-storage";
import {
  readActiveGroupExamRoom,
  saveHostedExamRoom,
  saveJoinedExamRoom,
} from "@/lib/group-exam";
import { AppRoute } from "@/lib/routes";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

beforeEach(() => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage: new MemoryStorage() },
  });
});

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

describe("app storage", () => {
  test("đọc và ghi chuỗi/JSON", () => {
    writeStorageValue("learning.value", "ok");
    writeStorageJson("learning.json", { completed: true });

    expect(readStorageValue("learning.value")).toBe("ok");
    expect(readStorageJson("learning.json", { completed: false })).toEqual({
      completed: true,
    });
    expect(readStorageJson("missing", { completed: false })).toEqual({
      completed: false,
    });
  });

  test("chỉ nhận chỉ số nguyên không âm", () => {
    writeStorageIndex("study.index", 3.9);
    expect(readStorageIndex("study.index")).toBe(3);

    writeStorageValue("study.index", "-1");
    expect(readStorageIndex("study.index")).toBeNull();
  });

  test("chỉ xóa dữ liệu thuộc ứng dụng", () => {
    writeStorageValue("learning.profile", "profile");
    writeStorageValue("study.index", "1");
    writeStorageValue("unrelated", "keep");

    expect(clearAllAppStorage()).toEqual({ success: true, removed: 2 });
    expect(readStorageValue("learning.profile")).toBeNull();
    expect(readStorageValue("study.index")).toBeNull();
    expect(readStorageValue("unrelated")).toBe("keep");
  });

  test("lưu, đọc và xóa phiên thi đang hoạt động", () => {
    const expiresAt = new Date(Date.now() + 120_000).toISOString();
    const session = {
      version: 3 as const,
      sessionId: "session-1",
      pathname: AppRoute.MockTest,
      title: "Thi thử",
      eyebrow: "Giáo lý",
      exitHref: AppRoute.Home,
      questions: [
        {
          id: "q1",
          title: "Câu hỏi",
          standardAnswer: "Đáp án",
          examMode: "essay" as const,
        },
      ],
      currentIndex: 0,
      answers: { q1: "Đang trả lời" },
      secondsLeft: 120,
      durationSeconds: 300,
      expiresAt,
      updatedAt: "2026-08-17T00:00:00.000Z",
    };

    saveActiveExamSession(session);
    expect(readActiveExamSession()).toEqual(session);

    clearActiveExamSession(session.sessionId);
    expect(readActiveExamSession()).toBeNull();
    expect(saveActiveExamSession(session)).toBe(false);
    expect(readActiveExamSession()).toBeNull();
  });

  test("tự dọn phiên thi có dữ liệu không hợp lệ", () => {
    writeStorageJson(STORAGE_KEYS.activeExamSession, {
      version: 2,
      sessionId: "broken-session",
      pathname: 123,
      questions: [],
    });

    expect(readActiveExamSession()).toBeNull();
    expect(readStorageValue(STORAGE_KEYS.activeExamSession)).toBeNull();
  });

  test("tính thời gian còn lại theo thời điểm hết hạn", () => {
    const now = Date.now();
    const originalDateNow = Date.now;
    Date.now = () => now;

    try {
      expect(
        getRemainingExamSeconds(new Date(now + 65_000).toISOString()),
      ).toBe(65);
      expect(
        getRemainingExamSeconds(new Date(now - 1_000).toISOString()),
      ).toBe(0);
    } finally {
      Date.now = originalDateNow;
    }
  });

  test("tạo userId một lần và dùng lại trên cùng thiết bị", () => {
    const firstUserId = getOrCreateUserId();
    const secondUserId = getOrCreateUserId();

    expect(firstUserId.length).toBeGreaterThan(0);
    expect(secondUserId).toBe(firstUserId);
    expect(readStorageValue(STORAGE_KEYS.userId)).toBe(firstUserId);
  });

  test("chỉ đánh dấu một phòng thi nhóm đang active khi đổi vai trò", () => {
    saveHostedExamRoom({
      version: 1,
      roomCode: "ROOMA1",
      hostUserId: "user-a",
      hostName: "A",
      createdAt: "2026-08-17T00:00:00.000Z",
      status: "started",
      participants: [],
      results: [{ userId: "user-a", correctCount: 10 }],
      start: null,
    });
    expect(readActiveGroupExamRoom()).toEqual({
      role: "host",
      roomCode: "ROOMA1",
    });

    saveJoinedExamRoom({
      version: 1,
      roomCode: "ROOMB2",
      hostUserId: "user-b",
      hostName: "B",
      participantUserId: "user-a",
      participantName: "A",
      result: null,
      leaderboard: [],
      start: null,
    });
    expect(readActiveGroupExamRoom()).toEqual({
      role: "participant",
      roomCode: "ROOMB2",
    });
  });

});
