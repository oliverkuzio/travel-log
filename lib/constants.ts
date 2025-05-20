import type { LngLatLike } from "maplibre-gl";

export const CENTER_MAP = [0, 0] as LngLatLike;

export const LOCATION_PAGES = new Set([
  "app",
  "app-locations-add",
]);

export const CURRENT_LOCATION_PAGES = new Set([
  "app-locations-slug",
  "app-locations-slug-add",
  "app-locations-slug-edit",
]);

export const EDIT_PAGES = new Set([
  "app-locations-add",
  "app-locations-slug-add",
  "app-locations-slug-edit",
]);
