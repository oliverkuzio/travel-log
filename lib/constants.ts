import type { LngLatLike } from "maplibre-gl";

export const CENTER_MAP = [0, 0] as LngLatLike;

export const CURRENT_TRIP_PAGES = new Set([
  "dashboard-trips-slug",
  "dashboard-trips-slug-add",
  "dashboard-trips-slug-edit",
]);

export const CURRENT_LOCATION_PAGES = new Set([
  "dashboard-locations-slug",
  "dashboard-locations-slug-add",
  "dashboard-locations-slug-edit",
]);

export const CURRENT_LOCATION_LOG_PAGES = new Set([
  "dashboard-locations-slug-id",
  "dashboard-locations-slug-id-add",
  "dashboard-locations-slug-id-edit",
  "dashboard-locations-slug-id-images",
]);

export const CURRENT_PAGES = new Set([
  ...CURRENT_TRIP_PAGES,
  ...CURRENT_LOCATION_PAGES,
  ...CURRENT_LOCATION_LOG_PAGES,
]);
