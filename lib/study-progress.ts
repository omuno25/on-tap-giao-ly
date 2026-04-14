export const STUDY_CARD_INDEX_KEY = "study.current_card_index";

export function readStudyCardIndex() {
  if (typeof window === "undefined") return 0;

  const raw = window.localStorage.getItem(STUDY_CARD_INDEX_KEY);
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

export function saveStudyCardIndex(index: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STUDY_CARD_INDEX_KEY, String(index));
}

export function clearStudyCardIndex() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STUDY_CARD_INDEX_KEY);
}
