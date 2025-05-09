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

export async function findLocationByName(existing: InsertLocation, userId: number) {
  return await db.query.location.findFirst({
    where: and(
      eq(location.name, existing.name),
      eq(location.userId, userId),
    ),
  });
}

export async function findLocationBySlug(slug: string) {
  return await db.query.location.findFirst({
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
