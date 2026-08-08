import marriageQuestionSetJson from "@/data/giao-ly-hon-nhan-dataset.json";

export type QuestionType = "essay" | "multiple-choice" | "flashcard";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  category?: string;
  standardAnswer?: string;
  options?: QuestionOption[];
  correctOptionId?: string;
  image?: string;
}

export interface MarriageSourceQuestion {
  id: number;
  type: "short" | "essay" | "true-false";
  question: string;
  answer: string | string[];
}

interface MarriageDatasetQuestion {
  id: number;
  question: string;
  answer: string | string[] | boolean;
}

interface ImportedQuestionSet {
  meta: {
    title: string;
    note?: string;
  };
  questions: MarriageDatasetQuestion[];
  essays: MarriageDatasetQuestion[];
}

const importedSet = marriageQuestionSetJson as ImportedQuestionSet;

export const MARRIAGE_QUESTION_SET = {
  meta: importedSet.meta,
  questions: [
    ...importedSet.questions.map<MarriageSourceQuestion>((item) => ({
      ...item,
      type: typeof item.answer === "boolean" ? "true-false" : "short",
      answer:
        typeof item.answer === "boolean"
          ? item.answer
            ? "Đúng"
            : "Sai"
          : item.answer,
    })),
    ...importedSet.essays.map<MarriageSourceQuestion>((item) => ({
      ...item,
      type: "essay",
      answer:
        typeof item.answer === "boolean"
          ? item.answer
            ? "Đúng"
            : "Sai"
          : item.answer,
    })),
  ],
};

function normalizeAnswer(answer: string | string[]) {
  if (Array.isArray(answer)) {
    return answer.map((item) => `- ${item}`).join("\n");
  }

  return answer;
}

const importedFlashcards: Question[] = MARRIAGE_QUESTION_SET.questions.map(
  (item) => ({
    id: String(item.id),
    type: "flashcard" as const,
    title: item.question,
    standardAnswer: normalizeAnswer(item.answer),
    category: importedSet.meta.title,
    description: importedSet.meta.note,
  }),
);

export const QUESTION_BANK: Question[] = importedFlashcards;

export function getQuestionById(id: string) {
  return QUESTION_BANK.find((question) => question.id === id);
}

export function getFirstQuestionByType(type: QuestionType) {
  return QUESTION_BANK.find((question) => question.type === type);
}
