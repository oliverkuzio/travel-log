import type { LngLatLike } from "maplibre-gl";

export const CENTER_MAP = [0, 0] as LngLatLike;

// Images are resized client side before upload, so this only needs to fit a resized JPEG.
export const MAX_IMAGE_SIZE = 1024 * 1024 * 0.5;

// The daisyUI secondary (trip) colour and its content colour, as hex because MapLibre layers can't use CSS classes.
export const ROUTE_COLOR = "#edb200";
export const ROUTE_CASING_COLOR = "#733e0a";

export const DASHBOARD_PAGES = new Set([
  "dashboard",
]);

export const TRIPS_LIST_PAGES = new Set([
  "dashboard-trips",
  "dashboard-trips-add",
]);

export const LOCATIONS_LIST_PAGES = new Set([
  "dashboard-locations",
  "dashboard-locations-add",
]);

export const LOCATION_IMPORT_PAGES = new Set([
  "dashboard-locations-import",
]);

export const LOCATION_TYPE_PAGES = new Set([
  "dashboard-types",
  "dashboard-types-add",
  "dashboard-types-slug-edit",
]);

export const EDIT_PAGES = new Set([
  "dashboard-locations-slug-edit",
]);

export const TRIP_SELECT_PAGES = new Set([
  "dashboard-locations-slug-add",
  "dashboard-locations-slug-id-edit",
]);

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
