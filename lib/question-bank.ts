import questionBankJson from '@/data/question-bank.json';
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

interface ImportedQuestion {
  id: number;
  type: 'short' | 'essay';
  question: string;
  answer: string | string[];
}

interface ImportedSummaryItem {
  question: string;
  answer: string | string[];
}

interface ImportedQuestionSet {
  meta: {
    title: string;
    note?: string;
  };
  questions: ImportedQuestion[];
  essay_summary: ImportedSummaryItem[];
}

const importedSet = marriageQuestionSetJson as ImportedQuestionSet;

function normalizeAnswer(answer: string | string[]) {
  if (Array.isArray(answer)) {
    return answer.map((item) => `- ${item}`).join('\n');
  }

  return answer;
}

const importedFlashcards: Question[] = [
  ...importedSet.questions.map((item) => ({
    id: `fc-imported-${item.id}`,
    type: 'flashcard' as const,
    title: item.question,
    standardAnswer: normalizeAnswer(item.answer),
    category: importedSet.meta.title,
    description: importedSet.meta.note,
  })),
  ...importedSet.essay_summary.map((item, index) => ({
    id: `fc-summary-${index + 1}`,
    type: 'flashcard' as const,
    title: item.question,
    standardAnswer: normalizeAnswer(item.answer),
    category: `${importedSet.meta.title} (Tóm tắt)`,
    description: importedSet.meta.note,
  })),
];

export const QUESTION_BANK: Question[] = [...(questionBankJson as Question[]), ...importedFlashcards];

export function getQuestionById(id: string) {
  return QUESTION_BANK.find((question) => question.id === id);
}

export function getFirstQuestionByType(type: QuestionType) {
  return QUESTION_BANK.find((question) => question.type === type);
}
