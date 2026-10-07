import type { SortOrder } from "~/lib/types";

/**
 * A copy of the items sorted by their start date, falling back to the end date for ties.
 */
export function sortByDate<T extends { startedAt: number; endedAt: number }>(items: T[], order: SortOrder) {
  const direction = order === "asc" ? 1 : -1;

  return [...items].sort((a, b) => direction * (a.startedAt - b.startedAt || a.endedAt - b.endedAt));
}
