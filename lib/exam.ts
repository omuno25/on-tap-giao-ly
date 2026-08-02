import type { MarriageSourceQuestion } from "@/lib/question-bank";

export type MockTestSourceQuestion = {
  id: string | number;
  type: MarriageSourceQuestion["type"];
  question: string;
  answer: string | string[];
};

type ExamMode = "objective" | "essay" | "true-false";

type ExamOption = {
  id: string;
  text: string;
};

export type ExamQuestion = {
  id: string;
  title: string;
  standardAnswer: string;
  examMode: ExamMode;
  options?: ExamOption[];
  correctOptionId?: string;
  image?: string;
};

export type ScoreSummary = {
  objective: { total: number; correct: number };
  essay: { total: number; correct: number };
  total: number;
  correct: number;
};

function shuffle<T>(items: T[]) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function pickQuestions<T>(pool: T[], count: number) {
  if (pool.length === 0 || count <= 0) return [];
  if (pool.length >= count) return shuffle(pool).slice(0, count);

  const picked = [...shuffle(pool)];
  while (picked.length < count) {
    picked.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  return picked;
}

function normalizeAnswer(answer: string | string[]) {
  return Array.isArray(answer) ? answer.join("; ") : answer;
}

function buildObjectiveOptions(
  source: MockTestSourceQuestion,
  pool: MockTestSourceQuestion[],
) {
  const correctText = normalizeAnswer(source.answer);
  const distractorPool = pool
    .map((item) => normalizeAnswer(item.answer))
    .filter((value) => value.trim().length > 0 && value !== correctText);

  const distractors = shuffle(Array.from(new Set(distractorPool))).slice(0, 3);
  while (distractors.length < 3) {
    distractors.push("Không có đáp án phù hợp");
  }

  const optionTexts = shuffle([correctText, ...distractors]);
  const optionIds = ["A", "B", "C", "D"];
  const options = optionTexts.map((text, index) => ({
    id: optionIds[index],
    text,
  }));
  const correctOption = options.find((option) => option.text === correctText);

  return {
    options,
    correctOptionId: correctOption?.id ?? "A",
  };
}

export function buildExamQuestions(
  sourceQuestions: MockTestSourceQuestion[],
  objectiveCount: number,
  essayCount: number,
  trueFalseCount: number,
) {
  const objectivePool = sourceQuestions.filter((q) => q.type === "short");
  const essayPool = sourceQuestions.filter((q) => q.type === "essay");
  const trueFalsePool = sourceQuestions.filter((q) => q.type === "true-false");

  const objectiveQuestions: ExamQuestion[] = pickQuestions(
    objectivePool,
    objectiveCount,
  ).map((question) => ({
    id: String(question.id),
    title: question.question,
    standardAnswer: normalizeAnswer(question.answer),
    ...buildObjectiveOptions(question, objectivePool),
    examMode: "objective",
  }));

  const essayQuestions: ExamQuestion[] = pickQuestions(
    essayPool,
    essayCount,
  ).map((question) => ({
    id: String(question.id),
    title: question.question,
    standardAnswer: normalizeAnswer(question.answer),
    examMode: "essay",
  }));

  const trueFalseQuestions: ExamQuestion[] = pickQuestions(
    trueFalsePool,
    trueFalseCount,
  ).map((question) => {
    const correctText = normalizeAnswer(question.answer);

    return {
      id: String(question.id),
      title: question.question,
      standardAnswer: correctText,
      examMode: "true-false" as const,
      options: [
        { id: "true", text: "Đúng" },
        { id: "false", text: "Sai" },
      ],
      correctOptionId: correctText === "Đúng" ? "true" : "false",
    };
  });

  return shuffle<ExamQuestion>([
    ...objectiveQuestions,
    ...essayQuestions,
    ...trueFalseQuestions,
  ]);
}

export function formatExamTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function calculateScore(
  questions: ExamQuestion[],
  answers: Record<string, string>,
): ScoreSummary {
  const objectiveQuestions = questions.filter(
    (question) =>
      question.examMode === "objective" || question.examMode === "true-false",
  );
  const essayQuestions = questions.filter(
    (question) => question.examMode === "essay",
  );

  const objectiveCorrect = objectiveQuestions.reduce((count, question) => {
    const picked = answers[question.id];
    return picked && picked === question.correctOptionId ? count + 1 : count;
  }, 0);

  const essayCorrect = essayQuestions.reduce((count, question) => {
    const input = (answers[question.id] ?? "").trim();
    const expected = question.standardAnswer.trim();
    return input === expected ? count + 1 : count;
  }, 0);

  return {
    objective: {
      total: objectiveQuestions.length,
      correct: objectiveCorrect,
    },
    essay: { total: essayQuestions.length, correct: essayCorrect },
    total: questions.length,
    correct: objectiveCorrect + essayCorrect,
  };
}
