import { and, asc, eq, inArray } from "drizzle-orm";
import { customAlphabet } from "nanoid";

import type { AppDatabase } from "~/lib/db";

import type { InsertLocation } from "../schema/location";

import chunk from "../chunk";
import { location, locationLog, locationLogImage } from "../schema";

const nanoid = customAlphabet("1234567890", 5);

type LocationWithCoverImage = InsertLocation & { coverImageKey?: string | null };

export async function insertLocation(db: AppDatabase, insertable: LocationWithCoverImage, slug: string, userId: number) {
  const [created] = await db.insert(location).values({
    ...insertable,
    slug,
    userId,
  }).returning();

  return created;
}

export async function updateLocation(db: AppDatabase, updates: LocationWithCoverImage, slug: string, userId: number) {
  const [updated] = await db.update(location).set(updates).where(and(
    eq(location.slug, slug),
    eq(location.userId, userId),
  )).returning();

  return updated;
}

export async function deleteLocation(db: AppDatabase, slug: string, userId: number) {
  const existing = await findOwnedLocationBySlug(db, slug, userId);

  if (!existing) {
    return undefined;
  }

  // The FKs would cascade to the logs and images anyway; deleting the images explicitly returns
  // their R2 keys.
  const logIds = db.select({ id: locationLog.id }).from(locationLog).where(eq(locationLog.locationId, existing.id));
  const [images, , [deleted]] = await db.batch([
    db.delete(locationLogImage).where(inArray(locationLogImage.locationLogId, logIds)).returning(),
    db.delete(locationLog).where(eq(locationLog.locationId, existing.id)),
    db.delete(location).where(eq(location.id, existing.id)).returning(),
  ]);

  return { location: deleted, images };
}

export async function findLocations(db: AppDatabase, userId: number) {
  return db.query.location.findMany({
    where: eq(location.userId, userId),
    orderBy: asc(location.name),
    with: {
      type: true,
      // Only counted, for the map point card.
      logs: {
        columns: { id: true },
      },
    },
  });
}

export async function findLocation(db: AppDatabase, slug: string, userId: number) {
  return db.query.location.findFirst({
    where: and(
      eq(location.slug, slug),
      eq(location.userId, userId),
    ),
    with: {
      type: true,
      logs: {
        orderBy(fields, operators) {
          return operators.desc(fields.startedAt);
        },
      },
    },
  });
}

export async function findOwnedLocationBySlug(db: AppDatabase, slug: string, userId: number) {
  return db.query.location.findFirst({
    where: and(
      eq(location.slug, slug),
      eq(location.userId, userId),
    ),
  });
}

export async function findLocationById(db: AppDatabase, id: number, userId: number) {
  return db.query.location.findFirst({
    where: and(
      eq(location.id, id),
      eq(location.userId, userId),
    ),
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

export async function findLocationNamesAndUrls(db: AppDatabase, userId: number) {
  const rows = await db.select({ name: location.name, googleMapsUrl: location.googleMapsUrl })
    .from(location)
    .where(eq(location.userId, userId));

  return {
    names: new Set(rows.map(row => row.name)),
    urls: new Set(rows.flatMap(row => row.googleMapsUrl ? [row.googleMapsUrl] : [])),
  };
}

/**
 * Batch version of findUniqueSlug: makes each slug unique against the database and each other.
 */
export async function findUniqueSlugs(db: AppDatabase, slugs: string[]) {
  const existing = new Set<string>();

  const results = await Promise.all(chunk([...new Set(slugs)], 90).map(slugsChunk => db
    .select({ slug: location.slug })
    .from(location)
    .where(inArray(location.slug, slugsChunk))));

  results.flat().forEach(row => existing.add(row.slug));

  return slugs.map((slug) => {
    let unique = slug;

    while (existing.has(unique)) {
      unique = `${slug}-${nanoid()}`;
    }

    existing.add(unique);

    return unique;
  });
}

export async function insertLocations(db: AppDatabase, insertables: (InsertLocation & { slug: string })[], userId: number) {
  // Each row binds up to 11 parameters and D1 allows 100 per statement.
  const statements = chunk(insertables, 8).map(rows => db
    .insert(location)
    .values(rows.map(row => ({ ...row, userId })))
    .returning({ id: location.id }));

  if (!statements.length) {
    return 0;
  }

  const results = await db.batch(statements as [typeof statements[number], ...typeof statements]);

  return results.reduce((total, inserted) => total + inserted.length, 0);
}
