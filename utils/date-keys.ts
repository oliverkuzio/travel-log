/**
 * The local YYYY-MM-DD keys of every day from the start to the end, inclusive.
 */
export function getDateKeysInRange(startedAt: number, endedAt: number) {
  const keys: string[] = [];
  const day = new Date(startedAt);
  const lastKey = toDateInputValue(endedAt);

  day.setHours(0, 0, 0, 0);

  for (let key = toDateInputValue(day.getTime()); key <= lastKey; key = toDateInputValue(day.getTime())) {
    keys.push(key);
    day.setDate(day.getDate() + 1);
  }

  return keys;
}

/**
 * Whether a local YYYY-MM-DD day falls within the start and end. Keys compare correctly as strings.
 */
export function isDateKeyInRange(key: string, startedAt: number, endedAt: number) {
  return toDateInputValue(startedAt) <= key && key <= toDateInputValue(endedAt);
}

/**
 * Local midnight of a YYYY-MM-DD key, for formatting.
 */
export function dateKeyToTimestamp(key: string) {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(year!, month! - 1, day!).getTime();
}
