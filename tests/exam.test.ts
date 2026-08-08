import { describe, expect, test } from "bun:test";
import {
  buildExamQuestions,
  calculateScore,
  formatExamTime,
  type ExamQuestion,
  type MockTestSourceQuestion,
} from "@/lib/exam";

const sourceQuestions: MockTestSourceQuestion[] = [
  { id: 1, type: "short", question: "Câu 1", answer: "Đáp án 1" },
  { id: 2, type: "short", question: "Câu 2", answer: "Đáp án 2" },
  { id: 3, type: "short", question: "Câu 3", answer: "Đáp án 3" },
  { id: 4, type: "short", question: "Câu 4", answer: "Đáp án 4" },
  { id: 5, type: "essay", question: "Tự luận", answer: "Chính xác" },
  { id: 6, type: "true-false", question: "Đúng sai", answer: "Đúng" },
];

describe("exam helpers", () => {
  test("tạo đúng số lượng và loại câu hỏi", () => {
    const questions = buildExamQuestions(sourceQuestions, 2, 1, 1);

    expect(questions).toHaveLength(4);
    expect(
      questions.filter((item) => item.examMode === "objective"),
    ).toHaveLength(2);
    expect(questions.filter((item) => item.examMode === "essay")).toHaveLength(
      1,
    );
    expect(
      questions.filter((item) => item.examMode === "true-false"),
    ).toHaveLength(1);

    for (const question of questions.filter(
      (item) => item.examMode === "objective",
    )) {
      expect(question.options).toHaveLength(4);
      expect(
        question.options?.some((item) => item.id === question.correctOptionId),
      ).toBe(true);
    }
  });

  test("chấm đúng câu khách quan và khớp chính xác câu tự luận", () => {
    const questions: ExamQuestion[] = [
      {
        id: "objective",
        title: "Khách quan",
        standardAnswer: "A",
        examMode: "objective",
        correctOptionId: "A",
      },
      {
        id: "essay",
        title: "Tự luận",
        standardAnswer: "Có dấu chấm.",
        examMode: "essay",
      },
    ];

    expect(
      calculateScore(questions, {
        objective: "A",
        essay: "  Có dấu chấm.  ",
      }),
    ).toEqual({
      objective: { total: 1, correct: 1 },
      essay: { total: 1, correct: 1 },
      total: 2,
      correct: 2,
    });

    expect(
      calculateScore(questions, { objective: "B", essay: "Có dấu chấm" })
        .correct,
    ).toBe(0);
  });

  test("định dạng thời gian thi", () => {
    expect(formatExamTime(0)).toBe("00:00");
    expect(formatExamTime(65)).toBe("01:05");
    expect(formatExamTime(25 * 60)).toBe("25:00");
  });
});
