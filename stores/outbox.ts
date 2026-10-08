import type { OutboxBody, OutboxEntry, OutboxKind, TempRef } from "~/lib/outbox";

import {
  addOutboxEntry,
  addOutboxRef,
  clearOutbox,
  clearOutboxRefs,
  createTempRef,
  deleteOutboxEntry,
  getOutboxEntries,
  getOutboxRefs,
  isTempId,
  isTempRef,
  pendingImageKey,
  putOutboxEntry,
} from "~/lib/outbox";
import { applyOutboxOverlay, OutboxNotFoundError } from "~/lib/outbox-overlay";

export type MutateOptions = {
  kind: OutboxKind;
  method: OutboxEntry["method"];
  url: string;
  body?: object | FormData;
  label: string;
  // The record being changed. Can be a temporary ref, for a record created on this device.
  target?: TempRef;
  // Whether this creates a record, which then gets temporary refs until it's synced.
  creates?: boolean;
  // How the record (or the changed fields) will look once synced.
  preview?: Record<string, unknown>;
};

// Kept simpler than `typeof $fetch`, whose typed API routes are too deep for TypeScript here.
type FetchWithOutbox = (request: string, options?: object) => Promise<unknown>;

type SendResult = {
  ok: boolean;
  status: number;
  data: any;
};

// A direct save that takes longer than this is queued instead (retrying it is safe).
const SEND_TIMEOUT = 15_000;

/**
 * Saves changes, queueing them in IndexedDB when there's no connection and syncing them, in order,
 * once there is. Pages show queued changes straight away via `fetchWithOutbox`, which overlays them on API
 * responses.
 */
export const useOutboxStore = defineStore("useOutboxStore", () => {
  const entries = ref<OutboxEntry[]>([]);
  const refs = ref(new Map<string, string>());
  const syncing = ref(false);
  const needsSignIn = ref(false);
  // Bumped whenever queued changes are added, synced or discarded, so pages can refetch.
  const changedAt = ref(0);

  const pendingCount = computed(() => entries.value.filter(entry => entry.status === "pending").length);
  const failedCount = computed(() => entries.value.filter(entry => entry.status === "failed").length);

  let loaded: Promise<void> | undefined;
  let csrfToken: string | undefined;

  async function load() {
    entries.value = await getOutboxEntries();
    refs.value = await getOutboxRefs();
  }

  function ready() {
    if (import.meta.server) {
      return Promise.resolve();
    }

    loaded ??= (async () => {
      await load();

      // Refs are only needed while queued changes still mention them.
      if (!entries.value.length && refs.value.size) {
        await clearOutboxRefs();
        refs.value = new Map();
      }
    })();

    return loaded;
  }

  async function changed() {
    await load();
    changedAt.value = Date.now();
  }

  /**
   * Sends the change now if possible, otherwise queues it. Server errors (e.g. validation) are
   * thrown as with $fetch; only a missing connection queues the change.
   */
  async function mutate<T = any>(options: MutateOptions): Promise<{ queued: boolean; data: T }> {
    await ready();

    const clientId = crypto.randomUUID();
    const body = await serializeBody(options.body);
    const entry: OutboxEntry = {
      clientId,
      kind: options.kind,
      method: options.method,
      url: options.url,
      body,
      label: options.label,
      target: options.target,
      preview: options.preview && withCoverImagePreview(options.preview, body, clientId),
      status: "pending",
      createdAt: Date.now(),
    };

    if (options.creates) {
      entry.creates = createTempRef(clientId);
    }

    // Changes must reach the server in order, so only skip the queue when it's empty.
    if (navigator.onLine && !pendingCount.value && !hasTempRefs(entry)) {
      try {
        const result = await send(entry, AbortSignal.timeout(SEND_TIMEOUT));

        if (result.ok) {
          return { queued: false, data: result.data };
        }

        throw createError({
          statusCode: result.status,
          statusMessage: result.data?.statusMessage,
          data: result.data,
        });
      }
      catch (e) {
        if (!isNetworkError(e)) {
          throw e;
        }
      }
    }

    await addOutboxEntry(entry);
    await changed();
    sync();

    return { queued: true, data: { ...entry.preview, ...entry.creates, pending: true } as T };
  }

  /**
   * Sends queued changes in the order they were made. Stops at the first network error (to try
   * again later), and marks changes the server rejects as failed, along with any that depend on them.
   */
  async function sync() {
    await ready();

    // Read directly rather than via useOnline(), which may not have seen the "online" event yet.
    if (syncing.value || !navigator.onLine || !pendingCount.value) {
      return;
    }

    // Another tab may be syncing the same queue.
    if ("locks" in navigator) {
      return navigator.locks.request("travel-log-outbox", { ifAvailable: true }, lock => lock ? drain() : undefined);
    }

    return drain();
  }

  async function drain() {
    syncing.value = true;
    needsSignIn.value = false;
    let anySynced = false;

    try {
      // Re-read, as another tab may have synced some already.
      await load();
      const blocked = new Set<string>();

      for (const entry of entries.value) {
        if (entry.status === "failed") {
          addCreates(blocked, entry);
          continue;
        }

        const blocker = findBlocker(entry, blocked);

        if (blocker) {
          await fail(entry, `Waiting for “${blocker.label}”, which couldn't be saved.`);
          addCreates(blocked, entry);
          continue;
        }

        let result: SendResult;

        try {
          result = await send(entry);
        }
        catch {
          break;
        }

        // Deleting something that's already gone is fine.
        if (result.ok || (entry.method === "DELETE" && result.status === 404)) {
          await recordCreated(entry, result.data);
          await deleteOutboxEntry(entry.id!);
          anySynced = true;
        }
        else if (result.status === 401) {
          needsSignIn.value = true;
          break;
        }
        else {
          await fail(entry, result.data?.statusMessage || `The server rejected this change (${result.status}).`);
          addCreates(blocked, entry);
        }
      }
    }
    finally {
      syncing.value = false;
      await changed();
    }

    return anySynced;
  }

  async function retryFailed() {
    await Promise.all(entries.value
      .filter(entry => entry.status === "failed")
      .map(entry => putOutboxEntry({ ...toRaw(entry), status: "pending", error: undefined })));
    await changed();
    return sync();
  }

  /**
   * Discards a queued change, along with any that depend on a record it would have created.
   */
  async function discard(entry: OutboxEntry) {
    const removed = [entry, ...dependentsOf(entry)];

    await Promise.all(removed.map(item => deleteOutboxEntry(item.id!)));
    await changed();
  }

  function dependentsOf(entry: OutboxEntry) {
    const temps = new Set<string>();
    addCreates(temps, entry);

    return entries.value.filter((item) => {
      if (item === entry || !findTempRefs(item).some(temp => temps.has(temp))) {
        return false;
      }

      addCreates(temps, item);
      return true;
    });
  }

  async function clear() {
    await clearOutbox();
    entries.value = [];
    refs.value = new Map();
  }

  /**
   * Swaps a temporary slug or id for the real one, once its create has been synced.
   */
  function resolveRef(value: string) {
    return refs.value.get(value) ?? value;
  }

  /**
   * $fetch for the stores' GET requests, with queued changes overlaid on the response.
   */
  const fetchWithOutbox: FetchWithOutbox = async (request, options) => {
    if (import.meta.server) {
      return $fetch(request, options);
    }

    await ready();
    const url = resolveUrl(request);

    if (!entries.value.length) {
      return $fetch(url, options);
    }

    let data: unknown;
    let error: unknown;

    try {
      data = await $fetch(url, options);
    }
    catch (e) {
      error = e;
    }

    try {
      const overlaid = applyOutboxOverlay(url.split("?")[0]!, data, entries.value, refs.value);

      if (overlaid !== undefined) {
        return overlaid;
      }
    }
    catch (e) {
      if (e instanceof OutboxNotFoundError) {
        throw createError({ statusCode: e.statusCode, statusMessage: e.statusMessage });
      }

      throw e;
    }

    throw error;
  };

  async function send(entry: OutboxEntry, signal?: AbortSignal, isRetry = false): Promise<SendResult> {
    const { headerName } = useCsrf();
    const headers = new Headers({ [headerName]: csrfToken ?? useCsrf().csrf ?? "" });
    let body: BodyInit | undefined;

    if (entry.method === "POST") {
      headers.set("Idempotency-Key", entry.clientId);
    }

    if (entry.body?.type === "json") {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(resolveRefs(entry.body.data));
    }
    else if (entry.body?.type === "form") {
      const formData = new FormData();

      for (const field of entry.body.fields) {
        // The JSON in a multipart "data" field may mention temporary refs too.
        const value = field.name === "data" && typeof field.value === "string"
          ? JSON.stringify(resolveRefs(JSON.parse(field.value)))
          : field.value;

        if (value instanceof Blob) {
          formData.append(field.name, value, field.fileName);
        }
        else {
          formData.append(field.name, value);
        }
      }

      body = formData;
    }

    const response = await fetch(resolveUrl(entry.url), {
      method: entry.method,
      headers,
      body,
      signal,
      credentials: "same-origin",
    });
    const data: any = await response.json().catch(() => null);

    // The page's token can be stale if it was served from the offline cache.
    if (response.status === 403 && !isRetry && data?.statusMessage === "CSRF Token Mismatch") {
      await refreshCsrfToken();
      return send(entry, signal, true);
    }

    return { ok: response.ok, status: response.status, data };
  }

  async function refreshCsrfToken() {
    const { token } = await $fetch<{ token: string }>("/api/csrf-token");
    csrfToken = token;

    // Keep $csrfFetch working for the rest of the session too.
    document.querySelector("meta[name=\"csrf-token\"]")?.setAttribute("content", token);
  }

  async function recordCreated(entry: OutboxEntry, data: any) {
    if (!entry.creates || !data) {
      return;
    }

    if (entry.creates.slug && data.slug) {
      await addOutboxRef(entry.creates.slug, data.slug);
    }

    if (entry.creates.id !== undefined && data.id !== undefined) {
      await addOutboxRef(entry.creates.id, data.id);
    }

    refs.value = await getOutboxRefs();
  }

  async function fail(entry: OutboxEntry, error: string) {
    await putOutboxEntry({ ...toRaw(entry), status: "failed", error });
  }

  function findBlocker(entry: OutboxEntry, blocked: Set<string>) {
    const temps = findTempRefs(entry).filter(temp => blocked.has(temp));

    return temps.length
      ? entries.value.find(item => item.creates && temps.some(temp => matchesCreates(item, temp)))
      : undefined;
  }

  function hasTempRefs(entry: OutboxEntry) {
    return findTempRefs(entry).length > 0;
  }

  // Temporary refs this entry mentions that haven't been resolved yet.
  function findTempRefs(entry: OutboxEntry) {
    const temps = [
      ...entry.url.split("/"),
      ...(entry.target ? [entry.target.slug, entry.target.id] : []),
      ...collectValues(entry.body?.type === "json" ? entry.body.data : formData(entry.body)),
    ].map(value => String(value));

    return temps.filter(value => isTempRef(value) && !refs.value.has(value));
  }

  function resolveUrl(url: string) {
    const [path, query] = url.split("?");
    const resolved = path!.split("/").map(segment => resolveRef(segment)).join("/");

    return query === undefined ? resolved : `${resolved}?${query}`;
  }

  function resolveRefs(value: unknown): unknown {
    if (isTempId(value)) {
      const real = refs.value.get(String(value));
      return real === undefined ? value : Number(real);
    }

    if (typeof value === "string" && isTempRef(value)) {
      return resolveRef(value);
    }

    if (Array.isArray(value)) {
      return value.map(resolveRefs);
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveRefs(item)]));
    }

    return value;
  }

  return {
    entries,
    refs,
    syncing,
    needsSignIn,
    changedAt,
    pendingCount,
    failedCount,
    ready,
    mutate,
    sync,
    retryFailed,
    discard,
    dependentsOf,
    clear,
    resolveRef,
    fetchWithOutbox,
  };
});

function matchesCreates(entry: OutboxEntry, temp: string) {
  return String(entry.creates?.slug) === temp || String(entry.creates?.id) === temp;
}

function addCreates(set: Set<string>, entry: OutboxEntry) {
  if (entry.creates?.slug) {
    set.add(entry.creates.slug);
  }

  if (entry.creates?.id !== undefined) {
    set.add(String(entry.creates.id));
  }
}

function formData(body: OutboxBody | undefined) {
  const data = body?.type === "form" && body.fields.find(field => field.name === "data")?.value;

  return typeof data === "string" ? JSON.parse(data) : undefined;
}

function collectValues(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectValues);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectValues);
  }

  return [value];
}

function isNetworkError(error: unknown) {
  // fetch rejects with a TypeError when offline, and AbortSignal.timeout() with a TimeoutError.
  return error instanceof TypeError || (error instanceof DOMException && ["TimeoutError", "AbortError"].includes(error.name));
}

async function serializeBody(body: object | FormData | undefined): Promise<OutboxBody | undefined> {
  if (!body) {
    return undefined;
  }

  if (!(body instanceof FormData)) {
    return { type: "json", data: JSON.parse(JSON.stringify(body)) };
  }

  const fields = [...body.entries()].map(([name, value]) => ({
    name,
    // IndexedDB can store a Blob but not a File in every browser, so keep the bytes and the name.
    value: value instanceof File ? new Blob([value], { type: value.type }) : value,
    fileName: value instanceof File ? value.name : undefined,
  }));

  return { type: "form", fields };
}

/**
 * Shows a queued cover photo (served by the service worker from the outbox) or its removal.
 */
function withCoverImagePreview(preview: Record<string, unknown>, body: OutboxBody | undefined, clientId: string) {
  if (body?.type !== "form") {
    return preview;
  }

  if (body.fields.some(field => field.name === "coverImage")) {
    return { ...preview, coverImageKey: pendingImageKey(clientId) };
  }

  if (body.fields.some(field => field.name === "removeCoverImage")) {
    return { ...preview, coverImageKey: null };
  }

  return preview;
}
