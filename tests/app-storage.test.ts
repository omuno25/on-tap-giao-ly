import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
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
  readActiveExamSession,
  saveActiveExamSession,
} from "@/lib/learning-storage";

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
    const session = {
      version: 1 as const,
      pathname: "/thi-thu",
      title: "Thi thử",
      eyebrow: "Giáo lý",
      exitHref: "/",
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
      updatedAt: "2026-08-17T00:00:00.000Z",
    };

    saveActiveExamSession(session);
    expect(readActiveExamSession()).toEqual(session);

    clearActiveExamSession();
    expect(readActiveExamSession()).toBeNull();
  });
});
