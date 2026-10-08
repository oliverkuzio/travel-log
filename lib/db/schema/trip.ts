import type { z } from "zod";

import { relations } from "drizzle-orm";
import { int, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

import type { SelectLocationLogWithLocation } from "./location-log";

import { DateSchema, DescriptionSchema, NameSchema, refineDates } from "../../zod-schemas";
import { user } from "./auth";
import { locationLog } from "./location-log";

export const trip = sqliteTable("trip", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  startedAt: int().notNull(),
  endedAt: int().notNull(),
  coverImageKey: text(),
  userId: int().notNull().references(() => user.id, { onDelete: "cascade" }),
  // Idempotency key for creates, so a retried request returns the original row instead of a duplicate.
  clientId: text(),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
}, t => [
  unique().on(t.name, t.userId),
  unique().on(t.userId, t.clientId),
]);

export const tripRelations = relations(trip, ({ many }) => ({
  logs: many(locationLog),
}));

export const InsertTripFields = createInsertSchema(trip, {
  name: NameSchema,
  description: DescriptionSchema,
  startedAt: DateSchema,
  endedAt: DateSchema,
}).omit({
  id: true,
  slug: true,
  coverImageKey: true,
  userId: true,
  clientId: true,
  createdAt: true,
  updatedAt: true,
});

export const InsertTrip = InsertTripFields.superRefine(refineDates);

export type InsertTrip = z.infer<typeof InsertTrip>;
export type SelectTrip = typeof trip.$inferSelect;
export type SelectTripWithLogs = SelectTrip & {
  logs: SelectLocationLogWithLocation[];
};
