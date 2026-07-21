import { and, eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";

import type { AppDatabase } from "~/lib/db";

import type { InsertTrip } from "../schema/trip";

import { trip } from "../schema";

const nanoid = customAlphabet("1234567890", 5);

export async function insertTrip(db: AppDatabase, insertable: InsertTrip, slug: string, userId: number) {
  const [created] = await db.insert(trip).values({
    ...insertable,
    slug,
    userId,
  }).returning();

  return created;
}

export async function updateTrip(db: AppDatabase, updates: InsertTrip, slug: string, userId: number) {
  const [updated] = await db.update(trip).set(updates).where(and(
    eq(trip.slug, slug),
    eq(trip.userId, userId),
  )).returning();

  return updated;
}

export async function deleteTrip(db: AppDatabase, slug: string, userId: number) {
  const [deleted] = await db.delete(trip).where(and(
    eq(trip.slug, slug),
    eq(trip.userId, userId),
  )).returning();

  return deleted;
}

export async function findTrips(db: AppDatabase, userId: number) {
  return db.query.trip.findMany({
    where: eq(trip.userId, userId),
  });
}

export async function findTrip(db: AppDatabase, slug: string, userId: number) {
  return db.query.trip.findFirst({
    where: and(
      eq(trip.slug, slug),
      eq(trip.userId, userId),
    ),
    with: {
      logs: {
        orderBy(fields, operators) {
          return operators.desc(fields.startedAt);
        },
      },
    },
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
