import {
  STORAGE_KEYS,
  readStorageJson,
  writeStorageJson,
} from "@/lib/app-storage";

export function readCompletedPrayerIds() {
  return readStorageJson<unknown[]>(STORAGE_KEYS.completedPrayers, []).filter(
    (id): id is string => typeof id === "string",
  );
}

export function markPrayerCompleted(prayerId: string) {
  const completedIds = new Set(readCompletedPrayerIds());
  completedIds.add(prayerId);
  writeStorageJson(STORAGE_KEYS.completedPrayers, [...completedIds]);
}
