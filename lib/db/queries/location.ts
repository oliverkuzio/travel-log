import { and, eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";

import db from "~/lib/db";

import type { InsertLocation } from "../schema/location";

import { location } from "../schema";

const nanoid = customAlphabet("1234567890", 5);

export async function insertLocation(insertable: InsertLocation, slug: string, userId: number) {
  const [created] = await db.insert(location).values({
    ...insertable,
    slug,
    userId,
  }).returning();

  return created;
}

export async function updateLocation(updates: InsertLocation, slug: string, userId: number) {
  const [updated] = await db.update(location).set(updates).where(and(
    eq(location.slug, slug),
    eq(location.userId, userId),
  )).returning();

  return updated;
}

export async function deleteLocation(slug: string, userId: number) {
  const [deleted] = await db.delete(location).where(and(
    eq(location.slug, slug),
    eq(location.userId, userId),
  )).returning();

  return deleted;
}

export async function findLocations(userId: number) {
  return db.query.location.findMany({
    where: eq(location.userId, userId),
  });
}

export async function findLocation(slug: string, userId: number) {
  return db.query.location.findFirst({
    where: and(
      eq(location.slug, slug),
      eq(location.userId, userId),
    ),
    with: {
      locationLogs: true,
    },
  });
}

export async function findLocationByName(existing: InsertLocation, userId: number) {
  return db.query.location.findFirst({
    where: and(
      eq(location.name, existing.name),
      eq(location.userId, userId),
    ),
  });
}

export async function findLocationBySlug(slug: string) {
  return db.query.location.findFirst({
    where: eq(location.slug, slug),
  });
}

export async function findUniqueSlug(slug: string) {
  let existingSlug = !!(await findLocationBySlug(slug));

  while (existingSlug) {
    const id = nanoid();
    const newSlug = `${slug}-${id}`;

    existingSlug = !!(await findLocationBySlug(newSlug));

    if (!existingSlug) {
      return newSlug;
    }
  }

  return slug;
}
