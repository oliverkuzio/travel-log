import type { z } from "zod";

import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

import { DescriptionSchema, IconSchema, NameSchema } from "../../zod-schemas";

export const locationType = sqliteTable("locationType", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  slug: text().notNull().unique(),
  icon: text().notNull(),
  description: text(),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});

export const InsertLocationType = createInsertSchema(locationType, {
  name: NameSchema,
  description: DescriptionSchema,
  icon: IconSchema,
}).omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLocationType = z.infer<typeof InsertLocationType>;
export type SelectLocationType = typeof locationType.$inferSelect;
