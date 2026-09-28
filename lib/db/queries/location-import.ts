import { and, asc, eq, inArray } from "drizzle-orm";

import type { AppDatabase } from "~/lib/db";
import type { ParsedTakeoutPlace } from "~/lib/google-takeout";

import chunk from "../chunk";
import { locationImport } from "../schema";

// D1 allows at most 100 bound parameters per statement.
const INSERT_CHUNK_SIZE = 10;
const IN_CHUNK_SIZE = 90;

/**
 * Stages places for import, ignoring any the user has already staged. Returns the number staged.
 */
export async function insertLocationImports(db: AppDatabase, places: ParsedTakeoutPlace[], userId: number) {
  const statements = chunk(places, INSERT_CHUNK_SIZE).map(rows => db
    .insert(locationImport)
    .values(rows.map(row => ({ ...row, userId })))
    .onConflictDoNothing()
    .returning({ id: locationImport.id }));

  if (!statements.length) {
    return 0;
  }

  const results = await db.batch(statements as [typeof statements[number], ...typeof statements]);

  return results.reduce((total, inserted) => total + inserted.length, 0);
}

export async function findLocationImports(db: AppDatabase, userId: number) {
  return db.query.locationImport.findMany({
    where: eq(locationImport.userId, userId),
    orderBy: [asc(locationImport.name), asc(locationImport.query)],
  });
}

export async function findLocationImport(db: AppDatabase, id: number, userId: number) {
  return db.query.locationImport.findFirst({
    where: and(
      eq(locationImport.id, id),
      eq(locationImport.userId, userId),
    ),
  });
}

export async function findLocationImportsByIds(db: AppDatabase, ids: number[], userId: number) {
  const results = await Promise.all(chunk(ids, IN_CHUNK_SIZE).map(idsChunk => db.query.locationImport.findMany({
    where: and(
      inArray(locationImport.id, idsChunk),
      eq(locationImport.userId, userId),
    ),
  })));

  return results.flat();
}

export async function findReadyLocationImports(db: AppDatabase, userId: number) {
  return db.query.locationImport.findMany({
    where: and(
      eq(locationImport.status, "ready"),
      eq(locationImport.userId, userId),
    ),
  });
}

export async function deleteLocationImports(db: AppDatabase, ids: number[], userId: number) {
  await Promise.all(chunk(ids, IN_CHUNK_SIZE).map(idsChunk => db.delete(locationImport).where(and(
    inArray(locationImport.id, idsChunk),
    eq(locationImport.userId, userId),
  ))));
}

export async function deleteAllLocationImports(db: AppDatabase, userId: number) {
  await db.delete(locationImport).where(eq(locationImport.userId, userId));
}
