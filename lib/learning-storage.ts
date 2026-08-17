import {
  STORAGE_KEYS,
  hasStorageValue,
  readStorageJson,
  readStorageValue,
  removeStorageValue,
  writeStorageJson,
  writeStorageValue,
} from "@/lib/app-storage";
import type { ExamQuestion } from "@/lib/exam";

export type ExamResult = {
  correct: number;
  total: number;
  objectiveCorrect: number;
  objectiveTotal: number;
  essayCorrect: number;
  essayTotal: number;
  completedAt: string;
};

export type LearnerProfile = {
  name: string;
};

export type ActiveExamSession = {
  version: 1;
  pathname: string;
  title: string;
  eyebrow: string;
  exitHref: string;
  questions: ExamQuestion[];
  currentIndex: number;
  answers: Record<string, string>;
  secondsLeft: number;
  durationSeconds: number;
  updatedAt: string;
};

export const MAX_PROFILE_NAME_LENGTH = 20;
export const MAX_GREETING_NAME_LENGTH = 16;

export const PROFILE_UPDATED_EVENT = "learning:profile-updated";

export function readEssayAnswer(questionId: string) {
  return readStorageValue(STORAGE_KEYS.essayAnswer(questionId)) ?? "";
}

export function saveEssayAnswer(questionId: string, answer: string) {
  writeStorageValue(STORAGE_KEYS.essayAnswer(questionId), answer);
}

export function readExamResults() {
  return readStorageJson<ExamResult[]>(STORAGE_KEYS.examResults, []);
}

export function saveExamResult(result: ExamResult) {
  writeStorageJson(
    STORAGE_KEYS.examResults,
    [result, ...readExamResults()].slice(0, 20),
  );
}

export function readActiveExamSession() {
  const session = readStorageJson<ActiveExamSession | null>(
    STORAGE_KEYS.activeExamSession,
    null,
  );

  if (
    !session ||
    session.version !== 1 ||
    !session.pathname.startsWith("/") ||
    !Array.isArray(session.questions) ||
    session.questions.length === 0 ||
    !Number.isInteger(session.currentIndex) ||
    session.currentIndex < 0 ||
    session.currentIndex >= session.questions.length ||
    !Number.isFinite(session.secondsLeft) ||
    session.secondsLeft <= 0
  ) {
    return null;
  }

  return session;
}

export function saveActiveExamSession(session: ActiveExamSession) {
  writeStorageJson(STORAGE_KEYS.activeExamSession, session);
}

export function clearActiveExamSession() {
  removeStorageValue(STORAGE_KEYS.activeExamSession);
}

export function readLearnerProfile() {
  const profile = readStorageJson<LearnerProfile>(STORAGE_KEYS.profile, {
    name: "User",
  });
  return { name: normalizeProfileName(profile.name) };
}

export function hasLearnerProfile() {
  return hasStorageValue(STORAGE_KEYS.profile);
}

export function createGuestName() {
  const randomValues = new Uint32Array(1);
  globalThis.crypto?.getRandomValues(randomValues);
  const randomNumber = randomValues[0]
    ? 100000 + (randomValues[0] % 900000)
    : 100000 + Math.floor(Math.random() * 900000);
  return `User ${randomNumber}`;
}

export function saveLearnerProfile(profile: LearnerProfile) {
  writeStorageJson(STORAGE_KEYS.profile, {
    name: normalizeProfileName(profile.name),
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT));
  }
}

export function normalizeProfileName(name: string) {
  const normalized = sanitizeProfileNameInput(name).trim().replace(/\s+/g, " ");
  return normalized.slice(0, MAX_PROFILE_NAME_LENGTH) || "User";
}

export function sanitizeProfileNameInput(name: string) {
  return name
    .normalize("NFC")
    .replace(/[^\p{L}\p{M}\p{N} ]/gu, "")
    .replace(/\s+/g, " ")
    .slice(0, MAX_PROFILE_NAME_LENGTH);
}

export function getGreetingName(name: string) {
  const normalized = normalizeProfileName(name);
  return normalized.length > MAX_GREETING_NAME_LENGTH
    ? `${normalized.slice(0, MAX_GREETING_NAME_LENGTH - 1)}…`
    : normalized;
}
