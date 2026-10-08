import { and, eq } from "drizzle-orm";

import type { AppDatabase } from "~/lib/db";

import type { InsertLocationLog } from "../schema";

import { locationLog, locationLogImage } from "../schema";

export async function findLocationLog(db: AppDatabase, locationLogId: number, userId: number) {
  const foundLog = await db.query.locationLog.findFirst({
    where: and(
      eq(locationLog.id, locationLogId),
      eq(locationLog.userId, userId),
    ),
    with: {
      trip: true,
      images: {
        orderBy(fields, operators) {
          return operators.desc(fields.createdAt);
        },
      },
    },
  });

  return foundLog;
}

export async function findLocationLogByClientId(db: AppDatabase, clientId: string, userId: number) {
  return db.query.locationLog.findFirst({
    where: and(
      eq(locationLog.clientId, clientId),
      eq(locationLog.userId, userId),
    ),
  });
}

export async function insertLocationLog(
  db: AppDatabase,
  locationId: number,
  insertable: InsertLocationLog & { clientId?: string },
  userId: number,
) {
  const [inserted] = await db.insert(locationLog).values({
    ...insertable,
    locationId,
    userId,
  }).returning();

  return inserted;
}

export async function updateLocationLog(db: AppDatabase, updateable: InsertLocationLog, locationLogId: number, userId: number) {
  const [updated] = await db.update(locationLog).set({
    ...updateable,
  }).where(
    and(
      eq(locationLog.id, locationLogId),
      eq(locationLog.userId, userId),
    ),
  ).returning();

  return updated;
}

export async function deleteLocationLog(db: AppDatabase, locationLogId: number, userId: number) {
  const existing = await db.query.locationLog.findFirst({
    where: and(
      eq(locationLog.id, locationLogId),
      eq(locationLog.userId, userId),
    ),
  });

  if (!existing) {
    return undefined;
  }

  // The FK would cascade to the images anyway; deleting them explicitly returns their R2 keys.
  const [images, [deleted]] = await db.batch([
    db.delete(locationLogImage).where(eq(locationLogImage.locationLogId, existing.id)).returning(),
    db.delete(locationLog).where(eq(locationLog.id, existing.id)).returning(),
  ]);

  return { log: deleted, images };
}
