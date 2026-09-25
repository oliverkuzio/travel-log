import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import type { SelectLocationWithType } from "./location";
import type { SelectLocationLogImage } from "./location-log-image";
import type { SelectTrip } from "./trip";

import { DateSchema, DescriptionSchema, IdSchema, NameSchema, refineDates } from "../../zod-schemas";
import { user } from "./auth";
import { location } from "./location";
import { locationLogImage } from "./location-log-image";
import { trip } from "./trip";

export const locationLog = sqliteTable("locationLog", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
  startedAt: int().notNull(),
  endedAt: int().notNull(),
  locationId: int().notNull().references(() => location.id, { onDelete: "cascade" }),
  tripId: int().references(() => trip.id, { onDelete: "set null" }),
  userId: int().notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});

export const locationLogRelations = relations(locationLog, ({ one, many }) => ({
  location: one(location, {
    fields: [locationLog.locationId],
    references: [location.id],
  }),
  trip: one(trip, {
    fields: [locationLog.tripId],
    references: [trip.id],
  }),
  images: many(locationLogImage),
}));

const InsertLocationLogBase = createInsertSchema(locationLog, {
  name: NameSchema,
  description: DescriptionSchema,
  startedAt: DateSchema,
  endedAt: DateSchema,
  tripId: IdSchema.nullable().optional(),
}).omit({
  id: true,
  locationId: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const InsertLocationLog = InsertLocationLogBase.superRefine(refineDates);

export const InsertTripLocationLog = InsertLocationLogBase.extend({
  locationId: z.number({
    required_error: "Location is required",
    invalid_type_error: "Location is required",
  }).int().positive(),
}).superRefine(refineDates);

export type InsertLocationLog = z.infer<typeof InsertLocationLog>;
export type InsertTripLocationLog = z.infer<typeof InsertTripLocationLog>;
export type SelectLocationLog = typeof locationLog.$inferSelect;
export type SelectLocationLogWithLocation = SelectLocationLog & {
  location: SelectLocationWithType;
};
export type SelectLocationLogWithImages = SelectLocationLog & {
  images: SelectLocationLogImage[];
  trip: SelectTrip | null;
};
