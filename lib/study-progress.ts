import {
  STORAGE_KEYS,
  readStorageIndex,
  removeStorageValue,
  writeStorageIndex,
} from "@/lib/app-storage";

export function readStudyCardIndex() {
  return readStorageIndex(STORAGE_KEYS.studyCardIndex) ?? 0;
}

export function readStudyPosition(total: number) {
  const index = readStorageIndex(STORAGE_KEYS.studyCardIndex);
  return index === null ? 0 : Math.min(index + 1, total);
}

export function saveStudyCardIndex(index: number) {
  writeStorageIndex(STORAGE_KEYS.studyCardIndex, index);
}

export function clearStudyCardIndex() {
  removeStorageValue(STORAGE_KEYS.studyCardIndex);
}
