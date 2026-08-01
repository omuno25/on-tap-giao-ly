export function getCatechumenProgressKey(slug: string) {
  return `catechumen.${slug}.current_card_index`;
}

export function readCatechumenPosition(slug: string, total: number) {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(getCatechumenProgressKey(slug));
  if (raw === null) return 0;
  const index = Number(raw);
  return Number.isInteger(index) && index >= 0
    ? Math.min(index + 1, total)
    : 0;
}

export function clearCatechumenProgress(slug: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getCatechumenProgressKey(slug));
}
