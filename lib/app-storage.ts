/**
 * Registry duy nhất cho toàn bộ dữ liệu Ôn tập Giáo lý lưu trên trình duyệt.
 * Giữ nguyên tên key cũ để không làm mất tiến độ của người dùng hiện tại.
 */
export const STORAGE_KEYS = {
  profile: "learning.profile",
  examResults: "learning.exam_results",
  studyCardIndex: "study.current_card_index",
  completedPrayers: "learning.prayers.completed",
  essayAnswer: (questionId: string) => `learning.essay.${questionId}`,
  catechumenCardIndex: (slug: string) =>
    `catechumen.${slug}.current_card_index`,
} as const;

const APP_STORAGE_PREFIXES = ["learning.", "study.", "catechumen."] as const;

function getStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function readStorageValue(key: string) {
  return getStorage()?.getItem(key) ?? null;
}

export function writeStorageValue(key: string, value: string) {
  getStorage()?.setItem(key, value);
}

export function removeStorageValue(key: string) {
  getStorage()?.removeItem(key);
}

export function hasStorageValue(key: string) {
  return readStorageValue(key) !== null;
}

export function readStorageJson<T>(key: string, fallback: T): T {
  const raw = readStorageValue(key);
  if (raw === null) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorageJson<T>(key: string, value: T) {
  writeStorageValue(key, JSON.stringify(value));
}

export function readStorageIndex(key: string) {
  const raw = readStorageValue(key);
  if (raw === null) return null;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : null;
}

export function writeStorageIndex(key: string, value: number) {
  writeStorageValue(key, String(Math.max(0, Math.floor(value))));
}

export function clearAllAppStorage() {
  const storage = getStorage();
  if (!storage) return { success: false, removed: 0 };

  try {
    const keysToRemove = getAppStorageKeys(storage);
    keysToRemove.forEach((key) => storage.removeItem(key));

    // Một số WebView cập nhật danh sách key chậm khi xóa liên tiếp.
    // Kiểm tra lại và dùng clear() làm fallback trên origin riêng của app.
    let remainingKeys = getAppStorageKeys(storage);
    if (remainingKeys.length > 0) {
      storage.clear();
      remainingKeys = getAppStorageKeys(storage);
    }

    return {
      success: remainingKeys.length === 0,
      removed: keysToRemove.length,
    };
  } catch {
    return { success: false, removed: 0 };
  }
}

function getAppStorageKeys(storage: Storage) {
  return Array.from(
    { length: storage.length },
    (_, index) => storage.key(index),
  ).filter(
    (key): key is string =>
      key !== null &&
      APP_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix)),
  );
}
