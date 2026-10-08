import type { H3Event } from "h3";

import { z } from "zod";

const IdempotencyKeySchema = z.string().uuid();

/**
 * The `Idempotency-Key` header the app sends with creates, so a request that is retried (e.g. when
 * syncing changes made offline) returns the row it already created rather than a duplicate.
 */
export default function getIdempotencyKey(event: H3Event) {
  const key = getRequestHeader(event, "idempotency-key");

  if (key === undefined) {
    return undefined;
  }

  if (!IdempotencyKeySchema.safeParse(key).success) {
    throw createError({ statusCode: 400, statusMessage: "Invalid idempotency key." });
  }

  return key;
}
