import marriageQuestionSetJson from '@/data/marriage-question-set.json';

export type QuestionType = 'essay' | 'multiple-choice' | 'flashcard';

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
  type: 'short' | 'essay';
  question: string;
  answer: string | string[];
}

interface ImportedQuestionSet {
  meta: {
    title: string;
    note?: string;
  };
  questions: MarriageSourceQuestion[];
}

const importedSet = marriageQuestionSetJson as ImportedQuestionSet;

export const MARRIAGE_QUESTION_SET = importedSet;

function normalizeAnswer(answer: string | string[]) {
  if (Array.isArray(answer)) {
    return answer.map((item) => `- ${item}`).join('\n');
  }

  return answer;
}

const importedFlashcards: Question[] = importedSet.questions.map((item) => ({
    id: String(item.id),
    type: 'flashcard' as const,
    title: item.question,
    standardAnswer: normalizeAnswer(item.answer),
    category: importedSet.meta.title,
    description: importedSet.meta.note,
  }));

export const QUESTION_BANK: Question[] = importedFlashcards;

export function getQuestionById(id: string) {
  return QUESTION_BANK.find((question) => question.id === id);
}

export function getFirstQuestionByType(type: QuestionType) {
  return QUESTION_BANK.find((question) => question.type === type);
}
