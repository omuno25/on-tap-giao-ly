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
  version: 3;
  sessionId: string;
  pathname: string;
  title: string;
  eyebrow: string;
  exitHref: string;
  questions: ExamQuestion[];
  currentIndex: number;
  answers: Record<string, string>;
  secondsLeft: number;
  durationSeconds: number;
  expiresAt: string;
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
  const value = readStorageJson<unknown>(
    STORAGE_KEYS.activeExamSession,
    null,
  );

  const session = normalizeActiveExamSession(value);
  if (!session || isActiveExamSessionInvalidated(session.sessionId)) {
    removeStorageValue(STORAGE_KEYS.activeExamSession);
    return null;
  }

  if (!isRecord(value) || value.version !== 3) {
    writeStorageJson(STORAGE_KEYS.activeExamSession, session);
  }

  return session;
}

export function saveActiveExamSession(session: ActiveExamSession) {
  if (isActiveExamSessionInvalidated(session.sessionId)) return false;
  writeStorageJson(STORAGE_KEYS.activeExamSession, session);
  return true;
}

export function clearActiveExamSession(sessionId?: string) {
  if (sessionId) {
    writeStorageValue(STORAGE_KEYS.invalidatedExamSession, sessionId);
  }
  removeStorageValue(STORAGE_KEYS.activeExamSession);
}

export function isActiveExamSessionInvalidated(sessionId: string) {
  return readStorageValue(STORAGE_KEYS.invalidatedExamSession) === sessionId;
}

export function createExamSessionId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `exam-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export function createExamExpiration(durationSeconds: number) {
  return new Date(Date.now() + durationSeconds * 1000).toISOString();
}

export function getRemainingExamSeconds(expiresAt: string) {
  return Math.max(0, Math.ceil((Date.parse(expiresAt) - Date.now()) / 1000));
}

function normalizeActiveExamSession(value: unknown): ActiveExamSession | null {
  if (!isRecord(value)) return null;

  const questions = value.questions;
  const answers = value.answers;
  if (
    ![1, 2, 3].includes(value.version as number) ||
    ((value.version === 2 || value.version === 3) &&
      !isNonEmptyString(value.sessionId)) ||
    !isSafeAppPath(value.pathname) ||
    !isNonEmptyString(value.title) ||
    typeof value.eyebrow !== "string" ||
    !isSafeAppPath(value.exitHref) ||
    !Array.isArray(questions) ||
    questions.length === 0 ||
    !questions.every(isExamQuestion) ||
    !isStringRecord(answers) ||
    !Number.isInteger(value.currentIndex) ||
    (value.currentIndex as number) < 0 ||
    (value.currentIndex as number) >= questions.length ||
    !isNonNegativeFiniteNumber(value.secondsLeft) ||
    !isPositiveFiniteNumber(value.durationSeconds) ||
    (value.secondsLeft as number) > (value.durationSeconds as number) ||
    typeof value.updatedAt !== "string" ||
    !Number.isFinite(Date.parse(value.updatedAt)) ||
    (value.version === 3 &&
      (typeof value.expiresAt !== "string" ||
        !Number.isFinite(Date.parse(value.expiresAt))))
  ) {
    return null;
  }

  const expiresAt =
    value.version === 3
      ? (value.expiresAt as string)
      : createExamExpiration(value.secondsLeft as number);

  return {
    version: 3,
    sessionId:
      value.version === 2 || value.version === 3
        ? (value.sessionId as string)
        : createExamSessionId(),
    pathname: value.pathname as string,
    title: value.title as string,
    eyebrow: value.eyebrow as string,
    exitHref: value.exitHref as string,
    questions,
    currentIndex: value.currentIndex as number,
    answers,
    secondsLeft: getRemainingExamSeconds(expiresAt),
    durationSeconds: value.durationSeconds as number,
    expiresAt,
    updatedAt: value.updatedAt,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isSafeAppPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
  );
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isNonNegativeFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((item) => typeof item === "string")
  );
}

function isExamQuestion(value: unknown): value is ExamQuestion {
  if (!isRecord(value)) return false;
  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.title) ||
    typeof value.standardAnswer !== "string" ||
    !["objective", "essay", "true-false"].includes(String(value.examMode))
  ) {
    return false;
  }

  if (value.options !== undefined) {
    if (
      !Array.isArray(value.options) ||
      !value.options.every(
        (option) =>
          isRecord(option) &&
          isNonEmptyString(option.id) &&
          typeof option.text === "string",
      )
    ) {
      return false;
    }
  }

  return (
    value.correctOptionId === undefined ||
    typeof value.correctOptionId === "string"
  );
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
