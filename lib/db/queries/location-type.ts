import { asc, eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";

import type { AppDatabase } from "~/lib/db";

import type { InsertLocationType } from "../schema/location-type";

import { location, locationType } from "../schema";

const nanoid = customAlphabet("1234567890", 5);

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
  const existing = await findLocationType(db, slug);

  if (!existing) {
    return undefined;
  }

  // Unassign the type from any locations first; the live `type_id` FK has no ON DELETE action.
  const [, [deleted]] = await db.batch([
    db.update(location).set({ typeId: null }).where(eq(location.typeId, existing.id)),
    db.delete(locationType).where(eq(locationType.id, existing.id)).returning(),
  ]);

  return deleted;
}

export async function findLocationTypes(db: AppDatabase) {
  return db.query.locationType.findMany({
    orderBy: asc(locationType.name),
  });
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

export async function findLocationTypeById(db: AppDatabase, id: number) {
  return db.query.locationType.findFirst({
    where: eq(locationType.id, id),
  });
}

export async function findUniqueSlug(db: AppDatabase, slug: string) {
  let existingSlug = !!(await findLocationType(db, slug));

  while (existingSlug) {
    const id = nanoid();
    const newSlug = `${slug}-${id}`;

    existingSlug = !!(await findLocationType(db, newSlug));

    if (!existingSlug) {
      return newSlug;
    }
  }

  return slug;
}
