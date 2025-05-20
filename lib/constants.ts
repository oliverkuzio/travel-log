import type { LngLatLike } from "maplibre-gl";

export const CENTER_MAP = [0, 0] as LngLatLike;

export const LOCATION_PAGES = new Set([
  "dashboard",
  "dashboard-locations-add",
]);

export const CURRENT_LOCATION_PAGES = new Set([
  "dashboard-locations-slug",
  "dashboard-locations-slug-add",
  "dashboard-locations-slug-edit",
]);

export const EDIT_PAGES = new Set([
  "dashboard-locations-add",
  "dashboard-locations-slug-add",
  "dashboard-locations-slug-edit",
]);
