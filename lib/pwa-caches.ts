// Shared by the service worker and the app, so this must not import anything browser- or Nuxt-specific.

/**
 * Runtime caches the service worker fills as the app is used.
 */
export const PWA_CACHES = {
  pages: "pages",
  api: "api",
  images: "images",
  mapStyles: "map-styles",
  mapTiles: "map-tiles",
} as const;

/**
 * Caches holding the signed-in user's own data, which must be cleared on sign-out. The map caches
 * are left alone as they're the same for everyone.
 */
export const USER_CACHES = [PWA_CACHES.pages, PWA_CACHES.api, PWA_CACHES.images];
