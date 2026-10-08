// Changes made while offline, kept in IndexedDB until they can be sent. Shared by the app and the
// service worker (which serves queued photos from here), so this must not import anything Nuxt-specific.
import type { DBSchema } from "idb";

import { openDB } from "idb";

export type OutboxKind
  = | "location:create" | "location:update" | "location:delete"
    | "trip:create" | "trip:update" | "trip:delete"
    | "log:create" | "log:update" | "log:delete"
    | "image:create" | "image:delete";

export type OutboxFormField = {
  name: string;
  value: string | Blob;
  fileName?: string;
};

export type OutboxBody
  = | { type: "json"; data: unknown }
    | { type: "form"; fields: OutboxFormField[] };

/**
 * Stands in for a record that exists only in the outbox: a temporary slug (for URLs) and id,
 * swapped for the real values once the create has been synced.
 */
export type TempRef = {
  slug?: string;
  id?: number;
};

export type OutboxEntry = {
  id?: number;
  // Sent as the Idempotency-Key, so retrying a create never duplicates it.
  clientId: string;
  kind: OutboxKind;
  method: "POST" | "PUT" | "DELETE";
  url: string;
  body?: OutboxBody;
  // Shown on the sync page, e.g. "Add location “Kyoto Station”".
  label: string;
  // The record this entry changes, by slug (locations, trips) or id (logs, images).
  target?: TempRef;
  // The temporary refs for the record this entry creates.
  creates?: TempRef;
  // The record (or changed fields) as it will look once synced, shown in the meantime.
  preview?: Record<string, unknown>;
  status: "pending" | "failed";
  error?: string;
  createdAt: number;
};

type OutboxSchema = DBSchema & {
  entries: {
    key: number;
    value: OutboxEntry;
  };
  // Temporary slug or id (as a string) => the real one, once its create has been synced.
  refs: {
    key: string;
    value: { temp: string; real: string };
  };
};

const PENDING_IMAGE_PREFIX = "pending/";
// Generated slugs only contain lowercase letters, digits and hyphens, so this can't clash with one.
const TEMP_SLUG_PREFIX = "offline_";
// Temporary ids sit far above any id D1 will hand out, but are still positive integers so forms
// accept them (e.g. picking a location created offline for a trip's log).
const TEMP_ID_MIN = 2 ** 52;

export function createTempRef(clientId: string): TempRef {
  return {
    slug: `${TEMP_SLUG_PREFIX}${clientId.slice(0, 8)}`,
    id: TEMP_ID_MIN + Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - TEMP_ID_MIN)),
  };
}

export function isTempId(value: unknown) {
  return typeof value === "number" && value >= TEMP_ID_MIN;
}

export function isTempRef(value: string) {
  return value.startsWith(TEMP_SLUG_PREFIX) || (/^\d+$/.test(value) && isTempId(Number(value)));
}

let db: ReturnType<typeof openDB<OutboxSchema>> | undefined;

function getDb() {
  db ??= openDB<OutboxSchema>("travel-log-outbox", 1, {
    upgrade(database) {
      database.createObjectStore("entries", { keyPath: "id", autoIncrement: true });
      database.createObjectStore("refs", { keyPath: "temp" });
    },
  });

  return db;
}

export async function getOutboxEntries() {
  // Keys are auto-incremented, so this is the order the changes were made in.
  return (await getDb()).getAll("entries");
}

export async function addOutboxEntry(entry: OutboxEntry) {
  return (await getDb()).add("entries", entry);
}

export async function putOutboxEntry(entry: OutboxEntry) {
  return (await getDb()).put("entries", entry);
}

export async function deleteOutboxEntry(id: number) {
  return (await getDb()).delete("entries", id);
}

export async function getOutboxRefs() {
  const refs = await (await getDb()).getAll("refs");

  return new Map(refs.map(ref => [ref.temp, ref.real]));
}

export async function addOutboxRef(temp: string | number, real: string | number) {
  return (await getDb()).put("refs", { temp: String(temp), real: String(real) });
}

export async function clearOutbox() {
  const database = await getDb();

  await Promise.all([database.clear("entries"), database.clear("refs")]);
}

export async function clearOutboxRefs() {
  return (await getDb()).clear("refs");
}

/**
 * The image key a queued photo is shown under until it's uploaded. `/api/images/pending/<clientId>`
 * is served by the service worker from the entry's form data.
 */
export function pendingImageKey(clientId: string) {
  return `${PENDING_IMAGE_PREFIX}${clientId}`;
}

export async function findPendingImage(clientId: string) {
  const entries = await getOutboxEntries();
  const entry = entries.find(entry => entry.clientId === clientId);

  if (entry?.body?.type !== "form") {
    return undefined;
  }

  return entry.body.fields.find(field => field.value instanceof Blob)?.value as Blob | undefined;
}
