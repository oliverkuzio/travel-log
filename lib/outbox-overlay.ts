import type { OutboxEntry, OutboxKind } from "./outbox";

import { pendingImageKey } from "./outbox";

// API records are only patched with known fields here, so they're treated loosely.
type AnyRecord = Record<string, any>;

export class OutboxNotFoundError extends Error {
  statusCode = 404;
  statusMessage = "This was deleted on this device and will be removed when you're back online.";
}

/**
 * Whether a record is (or has changes) waiting to be synced.
 */
export function isPendingRecord(record: unknown) {
  return !!record && typeof record === "object" && "pending" in record && record.pending === true;
}

/**
 * Applies the changes waiting in the outbox to an API response, so pages show them before they've
 * been synced. Returns undefined if the outbox has nothing to add, e.g. a record that was never
 * cached, in which case the original response (or error) stands.
 *
 * Throws OutboxNotFoundError for a record deleted on this device.
 */
export function applyOutboxOverlay(path: string, data: unknown, entries: OutboxEntry[], refs: Map<string, string>) {
  if (!entries.length) {
    return data;
  }

  const overlay = new Overlay(entries, refs);
  const location = path.match(/^\/api\/locations\/([^/]+)$/);
  const log = path.match(/^\/api\/locations\/[^/]+\/(\d+)$/);
  const trip = path.match(/^\/api\/trips\/([^/]+)$/);

  if (path === "/api/locations") {
    return overlay.locations(data as AnyRecord[] | undefined);
  }

  if (location) {
    return overlay.location(location[1]!, data as AnyRecord | undefined);
  }

  if (log) {
    return overlay.log(log[1]!, data as AnyRecord | undefined);
  }

  if (path === "/api/trips") {
    return overlay.trips(data as AnyRecord[] | undefined);
  }

  if (trip) {
    return overlay.trip(trip[1]!, data as AnyRecord | undefined);
  }

  return data;
}

class Overlay {
  constructor(private entries: OutboxEntry[], private refs: Map<string, string>) {}

  locations(data: AnyRecord[] | undefined) {
    const items = this.list(data, "location", "slug");

    if (!items) {
      return data;
    }

    // The list only includes log ids, for counting.
    return items.map(location => ({
      ...location,
      logs: this.logsFor(location.logs ?? [], log => this.same(log.locationId ?? location.id, location.id))
        .map(log => ({ id: log.id })),
    }));
  }

  trips(data: AnyRecord[] | undefined) {
    const items = this.list(data, "trip", "slug");

    if (!items) {
      return data;
    }

    return items.map(trip => ({
      ...trip,
      logs: this.logsFor(trip.logs ?? [], log => this.same(log.tripId, trip.id)),
    }));
  }

  location(slug: string, data: AnyRecord | undefined) {
    const location = this.record(data, "location", { slug });

    return location && {
      ...location,
      logs: this.logsFor(location.logs ?? [], log => this.same(log.locationId, location.id)),
    };
  }

  trip(slug: string, data: AnyRecord | undefined) {
    const trip = this.record(data, "trip", { slug });

    return trip && {
      ...trip,
      logs: this.logsFor(trip.logs ?? [], log => this.same(log.tripId, trip.id)),
    };
  }

  log(id: string, data: AnyRecord | undefined) {
    const log = this.record(data, "log", { id: Number(id) });

    if (!log) {
      return undefined;
    }

    const deleted = this.targets("image:delete");
    const added = this.ofKind("image:create")
      .filter(entry => this.same(entry.target?.id, log.id))
      .map(entry => ({
        id: entry.creates?.id,
        key: pendingImageKey(entry.clientId),
        locationLogId: log.id,
        createdAt: entry.createdAt,
        pending: true,
      }));

    // Newest first, as the API returns them.
    return {
      ...log,
      images: [...added.reverse(), ...(log.images ?? []).filter((image: AnyRecord) => !deleted.has(this.real(image.id)))],
    };
  }

  /**
   * A list with creates added, updates applied and deletes removed, matching records by `key`.
   */
  private list(data: AnyRecord[] | undefined, entity: "location" | "trip", key: "slug") {
    const created = this.ofKind(`${entity}:create`);

    if (!data && !created.length) {
      return undefined;
    }

    const deleted = this.targets(`${entity}:delete`, key);
    const items = [...(data ?? []), ...created.map(entry => this.created(entry))];

    return items
      .filter(item => !deleted.has(this.real(item[key])))
      .map(item => this.updated(item, `${entity}:update`, key));
  }

  /**
   * A single record (from the API, or one created on this device) with its updates applied.
   */
  private record(data: AnyRecord | undefined, entity: "location" | "trip" | "log", target: { slug?: string; id?: number }) {
    const key = target.slug !== undefined ? "slug" : "id";
    const value = this.real(target[key]);

    if (this.targets(`${entity}:delete`, key).has(value)) {
      throw new OutboxNotFoundError();
    }

    const created = this.ofKind(`${entity}:create`).find(entry => this.real(entry.creates?.[key]) === value);
    const record = data ?? (created && this.created(created));

    return record && this.updated(record, `${entity}:update`, key);
  }

  /**
   * Logs with updates applied and deletes removed, plus logs created on this device. `belongs`
   * decides which logs are shown, since an update can move a log to another trip.
   */
  private logsFor(logs: AnyRecord[], belongs: (log: AnyRecord) => boolean) {
    const deleted = this.targets("log:delete");
    const created = this.ofKind("log:create").map(entry => this.created(entry));

    return [...logs, ...created]
      .filter(log => !deleted.has(this.real(log.id)))
      .map(log => this.updated(log, "log:update", "id"))
      .filter(belongs)
      .sort((a, b) => b.startedAt - a.startedAt);
  }

  private created(entry: OutboxEntry): AnyRecord {
    return { ...entry.preview, ...entry.creates, createdAt: entry.createdAt, pending: true };
  }

  private updated(record: AnyRecord, kind: OutboxKind, key: "slug" | "id") {
    const updates = this.ofKind(kind).filter(entry => this.real(entry.target?.[key]) === this.real(record[key]));

    return updates.length
      ? Object.assign({}, record, ...updates.map(entry => entry.preview), { pending: true })
      : record;
  }

  private ofKind(kind: OutboxKind) {
    return this.entries.filter(entry => entry.kind === kind);
  }

  private targets(kind: OutboxKind, key: "slug" | "id" = "id") {
    return new Set(this.ofKind(kind).map(entry => this.real(entry.target?.[key])));
  }

  // Compares by the real value, as a synced create's temporary ref may still appear in other entries.
  private real(value: unknown) {
    const text = String(value);

    return this.refs.get(text) ?? text;
  }

  private same(a: unknown, b: unknown) {
    return a !== undefined && a !== null && this.real(a) === this.real(b);
  }
}
