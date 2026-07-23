import { eq } from "drizzle-orm";

import type { AppDatabase } from "~/lib/db";

import type { InsertLocationType } from "../schema/location-type";

import { locationType } from "../schema";

export async function insertLocationType(db: AppDatabase, insertable: InsertLocationType, slug: string) {
  const [created] = await db.insert(locationType).values({
    ...insertable,
    slug,
  }).returning();

  return created;
}

export async function updateLocationType(db: AppDatabase, updates: InsertLocationType, slug: string) {
  const [updated] = await db.update(locationType).set(updates).where(
    eq(locationType.slug, slug),
  ).returning();

  return updated;
}

export async function deleteLocationType(db: AppDatabase, slug: string) {
  const [deleted] = await db.delete(locationType).where(
    eq(locationType.slug, slug),
  ).returning();

  return deleted;
}

export async function findLocationTypes(db: AppDatabase) {
  return db.query.locationType.findMany();
}

export async function findLocationType(db: AppDatabase, slug: string) {
  return db.query.locationType.findFirst({
    where: eq(locationType.slug, slug),
  });
}

export async function findLocationTypeByName(db: AppDatabase, existing: InsertLocationType) {
  return db.query.locationType.findFirst({
    where: eq(locationType.name, existing.name),
  });
}
