import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import type { SelectLocation } from "./location";
import type { SelectLocationLogImage } from "./location-log-image";

import { DateSchema, DescriptionSchema, NameSchema } from "../../zod-schemas";
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
  tripId: int().references(() => trip.id, { onDelete: "cascade" }),
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

export const InsertLocationLog = createInsertSchema(locationLog, {
  name: NameSchema,
  description: DescriptionSchema,
  startedAt: DateSchema,
  endedAt: DateSchema,
}).omit({
  id: true,
  locationId: true,
  tripId: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).superRefine((values, context) => {
  if (values.startedAt > values.endedAt || values.endedAt < values.startedAt) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Start Date must be before End Date",
      path: ["startedAt"],
    });

    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End Date must be after Start Date",
      path: ["endedAt"],
    });
  }
});

export type InsertLocationLog = z.infer<typeof InsertLocationLog>;
export type SelectLocationLog = typeof locationLog.$inferSelect;
export type SelectLocationLogWithLocation = SelectLocationLog & {
  location: SelectLocation;
};
export type SelectLocationLogWithImages = SelectLocationLog & {
  images: SelectLocationLogImage[];
};
