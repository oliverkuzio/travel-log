import type { z } from "zod";

import { relations } from "drizzle-orm";
import { int, real, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

import type { SelectLocationLog } from "./location-log";

import { DateSchema, DescriptionSchema, LatSchema, LongSchema, NameSchema } from "../../zod-schemas";
import { user } from "./auth";
import { locationLog } from "./location-log";

export const trip = sqliteTable("trip", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  lat: real().notNull(),
  long: real().notNull(),
  startedAt: int().notNull(),
  endedAt: int().notNull(),
  userId: int().notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
}, t => [
  unique().on(t.name, t.userId),
]);

export const tripRelations = relations(trip, ({ many }) => ({
  logs: many(locationLog),
}));

export const InsertTrip = createInsertSchema(trip, {
  name: NameSchema,
  description: DescriptionSchema,
  startedAt: DateSchema,
  endedAt: DateSchema,
  lat: LatSchema,
  long: LongSchema,
}).omit({
  id: true,
  slug: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTrip = z.infer<typeof InsertTrip>;
export type SelectTrip = typeof trip.$inferSelect;
export type SelectTripWithLogs = SelectTrip & {
  locationLogs: SelectLocationLog[];
};
