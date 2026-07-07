import { and, eq } from "drizzle-orm";

import type { AppDatabase } from "~/lib/db";

import type { InsertLocationLogImage } from "../schema";

import { locationLogImage } from "../schema";

export async function insertLocationLogImage(
  db: AppDatabase,
  locationLogId: number,
  insertable: InsertLocationLogImage,
  userId: number,
) {
  const [inserted] = await db.insert(locationLogImage).values({
    ...insertable,
    locationLogId,
    userId,
  }).returning();

  return inserted;
}

export async function deleteLocationLogImage(
  db: AppDatabase,
  imageId: number,
  userId: number,
) {
  const [deleted] = await db.delete(locationLogImage).where(
    and(
      eq(locationLogImage.id, imageId),
      eq(locationLogImage.userId, userId),
    ),
  ).returning();

  return deleted;
}
