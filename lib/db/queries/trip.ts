import { and, desc, eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";

import type { AppDatabase } from "~/lib/db";

import type { InsertTrip } from "../schema/trip";

import { locationLog, trip } from "../schema";

const nanoid = customAlphabet("1234567890", 5);

type TripWithCoverImage = InsertTrip & { coverImageKey?: string | null; clientId?: string };

export async function insertTrip(db: AppDatabase, insertable: TripWithCoverImage, slug: string, userId: number) {
  const [created] = await db.insert(trip).values({
    ...insertable,
    slug,
    userId,
  }).returning();

  return created;
}

export async function updateTrip(db: AppDatabase, updates: TripWithCoverImage, slug: string, userId: number) {
  const [updated] = await db.update(trip).set(updates).where(and(
    eq(trip.slug, slug),
    eq(trip.userId, userId),
  )).returning();

  return updated;
}

export async function deleteTrip(db: AppDatabase, slug: string, userId: number) {
  // The `trip_id` FK is ON DELETE SET NULL, so the trip's location logs are detached, not deleted.
  const [deleted] = await db.delete(trip).where(and(
    eq(trip.slug, slug),
    eq(trip.userId, userId),
  )).returning();

  return deleted;
}

const logsWithLocation = {
  with: {
    location: {
      with: {
        type: true,
        // Only counted, for the map point card.
        logs: {
          columns: { id: true },
        },
      },
    },
  },
  orderBy: desc(locationLog.startedAt),
} as const;

export async function findTrips(db: AppDatabase, userId: number) {
  return db.query.trip.findMany({
    where: eq(trip.userId, userId),
    orderBy: desc(trip.startedAt),
    with: {
      logs: logsWithLocation,
    },
  });
}

export async function findTrip(db: AppDatabase, slug: string, userId: number) {
  return db.query.trip.findFirst({
    where: and(
      eq(trip.slug, slug),
      eq(trip.userId, userId),
    ),
    with: {
      logs: logsWithLocation,
    },
  });
}

export async function findOwnedTripBySlug(db: AppDatabase, slug: string, userId: number) {
  return db.query.trip.findFirst({
    where: and(
      eq(trip.slug, slug),
      eq(trip.userId, userId),
    ),
  });
}

export async function findTripById(db: AppDatabase, id: number, userId: number) {
  return db.query.trip.findFirst({
    where: and(
      eq(trip.id, id),
      eq(trip.userId, userId),
    ),
  });
}

export async function findTripByClientId(db: AppDatabase, clientId: string, userId: number) {
  return db.query.trip.findFirst({
    where: and(
      eq(trip.clientId, clientId),
      eq(trip.userId, userId),
    ),
  });
}

export async function findTripByName(db: AppDatabase, existing: InsertTrip, userId: number) {
  return db.query.trip.findFirst({
    where: and(
      eq(trip.name, existing.name),
      eq(trip.userId, userId),
    ),
  });
}

export async function findTripBySlug(db: AppDatabase, slug: string) {
  return db.query.trip.findFirst({
    where: eq(trip.slug, slug),
  });
}

export async function findUniqueSlug(db: AppDatabase, slug: string) {
  let existingSlug = !!(await findTripBySlug(db, slug));

  while (existingSlug) {
    const id = nanoid();
    const newSlug = `${slug}-${id}`;

    existingSlug = !!(await findTripBySlug(db, newSlug));

    if (!existingSlug) {
      return newSlug;
    }
  }

  return slug;
}
