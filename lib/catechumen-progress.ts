import {
  STORAGE_KEYS,
  readStorageIndex,
  removeStorageValue,
  writeStorageIndex,
} from "@/lib/app-storage";

export function readCatechumenCardIndex(slug: string, total: number) {
  const index = readStorageIndex(STORAGE_KEYS.catechumenCardIndex(slug));
  return index === null ? 0 : Math.min(index, Math.max(0, total - 1));
}

export function readCatechumenPosition(slug: string, total: number) {
  const index = readStorageIndex(STORAGE_KEYS.catechumenCardIndex(slug));
  return index === null ? 0 : Math.min(index + 1, total);
}

export function saveCatechumenCardIndex(slug: string, index: number) {
  writeStorageIndex(STORAGE_KEYS.catechumenCardIndex(slug), index);
}

export function clearCatechumenProgress(slug: string) {
  removeStorageValue(STORAGE_KEYS.catechumenCardIndex(slug));
}
