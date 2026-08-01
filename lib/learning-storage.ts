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

export const MAX_PROFILE_NAME_LENGTH = 20;
export const MAX_GREETING_NAME_LENGTH = 16;

const EXAM_RESULTS_KEY = "learning.exam_results";
const PROFILE_KEY = "learning.profile";
export const PROFILE_UPDATED_EVENT = "learning:profile-updated";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readEssayAnswer(questionId: string) {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(`learning.essay.${questionId}`) ?? "";
}

export function saveEssayAnswer(questionId: string, answer: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`learning.essay.${questionId}`, answer);
}

export function readExamResults() {
  return readJson<ExamResult[]>(EXAM_RESULTS_KEY, []);
}

export function saveExamResult(result: ExamResult) {
  writeJson(EXAM_RESULTS_KEY, [result, ...readExamResults()].slice(0, 20));
}

export function readLearnerProfile() {
  const profile = readJson<LearnerProfile>(PROFILE_KEY, { name: "User" });
  return { name: normalizeProfileName(profile.name) };
}

export function hasLearnerProfile() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(PROFILE_KEY) !== null;
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
  writeJson(PROFILE_KEY, { name: normalizeProfileName(profile.name) });
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
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .replace(/\s+/g, " ")
    .slice(0, MAX_PROFILE_NAME_LENGTH);
}

export function getGreetingName(name: string) {
  const normalized = normalizeProfileName(name);
  return normalized.length > MAX_GREETING_NAME_LENGTH
    ? `${normalized.slice(0, MAX_GREETING_NAME_LENGTH - 1)}…`
    : normalized;
}
