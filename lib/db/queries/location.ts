import { and, eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";

import type { AppDatabase } from "~/lib/db";

import type { InsertLocation } from "../schema/location";

import { location } from "../schema";

const nanoid = customAlphabet("1234567890", 5);

export async function insertLocation(db: AppDatabase, insertable: InsertLocation, slug: string, userId: number) {
  const [created] = await db.insert(location).values({
    ...insertable,
    slug,
    userId,
  }).returning();

  return created;
}

export async function updateLocation(db: AppDatabase, updates: InsertLocation, slug: string, userId: number) {
  const [updated] = await db.update(location).set(updates).where(and(
    eq(location.slug, slug),
    eq(location.userId, userId),
  )).returning();

  return updated;
}

export async function deleteLocation(db: AppDatabase, slug: string, userId: number) {
  const [deleted] = await db.delete(location).where(and(
    eq(location.slug, slug),
    eq(location.userId, userId),
  )).returning();

  return deleted;
}

export async function findLocations(db: AppDatabase, userId: number) {
  return db.query.location.findMany({
    where: eq(location.userId, userId),
  });
}

export async function findLocation(db: AppDatabase, slug: string, userId: number) {
  return db.query.location.findFirst({
    where: and(
      eq(location.slug, slug),
      eq(location.userId, userId),
    ),
    with: {
      locationLogs: {
        orderBy(fields, operators) {
          return operators.desc(fields.startedAt);
        },
      },
    },
  });
}

export async function findLocationByName(db: AppDatabase, existing: InsertLocation, userId: number) {
  return db.query.location.findFirst({
    where: and(
      eq(location.name, existing.name),
      eq(location.userId, userId),
    ),
  });
}

export async function findLocationBySlug(db: AppDatabase, slug: string) {
  return db.query.location.findFirst({
    where: eq(location.slug, slug),
  });
}

export async function findUniqueSlug(db: AppDatabase, slug: string) {
  let existingSlug = !!(await findLocationBySlug(db, slug));

  while (existingSlug) {
    const id = nanoid();
    const newSlug = `${slug}-${id}`;

    existingSlug = !!(await findLocationBySlug(db, newSlug));

    if (!existingSlug) {
      return newSlug;
    }
  }

  return slug;
}
