import { int, real, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { user } from "./auth";

/**
 * Places parsed from a Google Takeout upload that are waiting to be added as locations. "ready"
 * rows have everything a location needs; "lookup" rows only have a search query and need the
 * user to find their co-ordinates via Nominatim.
 */
export const locationImport = sqliteTable("location_import", {
  id: int().primaryKey({ autoIncrement: true }),
  status: text({ enum: ["ready", "lookup"] }).notNull(),
  name: text(),
  address: text(),
  googleMapsUrl: text().notNull(),
  query: text(),
  lat: real(),
  long: real(),
  userId: int().notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: int().notNull().$default(() => Date.now()),
}, t => [
  unique().on(t.userId, t.googleMapsUrl),
]);

export type InsertLocationImport = typeof locationImport.$inferInsert;
export type SelectLocationImport = typeof locationImport.$inferSelect;
