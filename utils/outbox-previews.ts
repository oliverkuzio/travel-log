// Records as other API responses embed them, for previews of changes made offline (see stores/outbox.ts).

/**
 * A location as a trip's logs embed it, with its own logs only counted.
 */
export function locationPreview<T extends { logs?: { id: number }[] }>(location: T | null | undefined) {
  if (!location) {
    return null;
  }

  return { ...location, logs: (location.logs ?? []).map(log => ({ id: log.id })) };
}

/**
 * A trip as a log embeds it, without its logs.
 */
export function tripPreview<T extends { logs?: unknown }>(trip: T | null | undefined) {
  if (!trip) {
    return null;
  }

  const { logs: _logs, ...rest } = trip;
  return rest;
}

export function findById<T extends { id: number }>(items: T[] | null | undefined, id: number | null | undefined) {
  return items?.find(item => item.id === id) ?? null;
}
