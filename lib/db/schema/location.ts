import type { z } from "zod";

import { relations } from "drizzle-orm";
import { int, real, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

import type { SelectLocationLog } from "./location-log";
import type { SelectLocationType } from "./location-type";

import { AddressSchema, DescriptionSchema, GoogleMapsUrlSchema, IdSchema, LatSchema, LongSchema, NameSchema } from "../../zod-schemas";
import { user } from "./auth";
import { locationLog } from "./location-log";
import { locationType } from "./location-type";

export const location = sqliteTable("location", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  address: text(),
  googleMapsUrl: text(),
  coverImageKey: text(),
  lat: real().notNull(),
  long: real().notNull(),
  typeId: int().references(() => locationType.id, { onDelete: "set null" }),
  userId: int().notNull().references(() => user.id, { onDelete: "cascade" }),
  // Idempotency key for creates, so a retried request returns the original row instead of a duplicate.
  clientId: text(),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
}, t => [
  unique().on(t.name, t.userId),
  unique().on(t.userId, t.clientId),
]);

export const locationRelations = relations(location, ({ one, many }) => ({
  type: one(locationType, {
    fields: [location.typeId],
    references: [locationType.id],
  }),
  logs: many(locationLog),
}));

export const InsertLocation = createInsertSchema(location, {
  name: NameSchema,
  description: DescriptionSchema,
  address: AddressSchema.optional(),
  googleMapsUrl: GoogleMapsUrlSchema.optional(),
  lat: LatSchema,
  long: LongSchema,
  typeId: IdSchema.nullable().optional(),
}).omit({
  id: true,
  slug: true,
  coverImageKey: true,
  userId: true,
  clientId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLocation = z.infer<typeof InsertLocation>;
export type SelectLocation = typeof location.$inferSelect;
export type SelectLocationWithType = SelectLocation & {
  type: SelectLocationType | null;
};
export type SelectLocationWithLogs = SelectLocationWithType & {
  logs: SelectLocationLog[];
};
