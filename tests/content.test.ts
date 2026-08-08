import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { CATECHUMEN_SETS } from "@/lib/catechumen";
import { PRAYERS } from "@/lib/prayers";
import { MARRIAGE_QUESTION_SET, QUESTION_BANK } from "@/lib/question-bank";

function expectUnique(values: string[]) {
  expect(new Set(values).size).toBe(values.length);
}

describe("learning content", () => {
  test("bộ câu hỏi hôn nhân có ID duy nhất và nội dung hợp lệ", () => {
    expect(MARRIAGE_QUESTION_SET.questions.length).toBeGreaterThan(0);
    expectUnique(
      MARRIAGE_QUESTION_SET.questions.map((item) => String(item.id)),
    );
    expect(QUESTION_BANK).toHaveLength(MARRIAGE_QUESTION_SET.questions.length);

    for (const item of MARRIAGE_QUESTION_SET.questions) {
      expect(item.question.trim().length).toBeGreaterThan(0);
      const answer = Array.isArray(item.answer)
        ? item.answer.join("")
        : item.answer;
      expect(answer.trim().length).toBeGreaterThan(0);
    }
  });

  test("các bộ dự tòng có slug và ID thẻ duy nhất", () => {
    expect(CATECHUMEN_SETS.length).toBeGreaterThan(0);
    expectUnique(CATECHUMEN_SETS.map((set) => set.slug));

    for (const set of CATECHUMEN_SETS) {
      expect(set.cards.length).toBeGreaterThan(0);
      expectUnique(set.cards.map((card) => card.id));
      for (const card of set.cards) {
        expect(card.question.trim().length).toBeGreaterThan(0);
        expect(card.answer.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("mọi audio bài kinh đều tồn tại trong public", () => {
    expect(PRAYERS.length).toBeGreaterThan(0);
    expectUnique(PRAYERS.map((prayer) => prayer.id));

    for (const prayer of PRAYERS) {
      expect(prayer.title.trim().length).toBeGreaterThan(0);
      expect(Boolean(prayer.text?.trim() || prayer.audio)).toBe(true);
      if (!prayer.audio) continue;

      expect(prayer.audio.startsWith("/audio/")).toBe(true);
      const audioPath = resolve(
        process.cwd(),
        "public",
        prayer.audio.replace(/^\/+/, ""),
      );
      expect(existsSync(audioPath)).toBe(true);
    }
  });
});
