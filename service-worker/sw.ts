/// <reference lib="webworker" />
import type { WorkboxPlugin } from "workbox-core";

import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";

import { findPendingImage } from "../lib/outbox";
import { PWA_CACHES } from "../lib/pwa-caches";

declare let self: ServiceWorkerGlobalScope;

const APP_SHELL_URL = "/app-shell";

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// The page prompts the user before activating a new version, then asks us to take over.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Safari refuses to serve a navigation from a cached redirect, e.g. the sign-in redirect for
// signed-out visits to /dashboard, so only keep plain successful pages.
const onlyDirectPages: WorkboxPlugin = {
  cacheWillUpdate: async ({ response }) => response.ok && !response.redirected ? response : null,
};

const pages = new NetworkFirst({
  cacheName: PWA_CACHES.pages,
  networkTimeoutSeconds: 3,
  plugins: [onlyDirectPages],
});

registerRoute(new NavigationRoute(async (options) => {
  try {
    return await pages.handle(options);
  }
  catch (error) {
    // Never visited while online, so let the client-rendered shell render the route instead.
    const shell = await matchPrecache(APP_SHELL_URL);

    if (shell) {
      return shell;
    }

    throw error;
  }
}, {
  // API routes (e.g. the OAuth callback) must always reach the server.
  denylist: [/^\/api\//],
}));

const DAY_IN_SECONDS = 60 * 60 * 24;

// Never keep errors such as a 401 from an expired session or a 404 for a deleted record.
const onlySuccessful = new CacheableResponsePlugin({ statuses: [200] });

// The user's data and session: fresh whenever the network answers in time, otherwise the last
// copy, so previously viewed pages still work offline.
registerRoute(
  ({ url, sameOrigin }) => sameOrigin && (
    /^\/api\/(?:locations|trips|types|location-imports)(?:\/|$)/.test(url.pathname)
    || url.pathname === "/api/auth/get-session"
  ),
  new NetworkFirst({
    cacheName: PWA_CACHES.api,
    networkTimeoutSeconds: 4,
    plugins: [onlySuccessful],
  }),
);

// Photos waiting in the outbox to be uploaded, shown from the device until they are.
registerRoute(
  ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/api/images/pending/"),
  async ({ url }) => {
    const image = await findPendingImage(url.pathname.split("/").pop()!);

    return image
      ? new Response(image, { headers: { "Content-Type": image.type || "image/jpeg" } })
      : new Response(null, { status: 404 });
  },
);

// Image keys are random and never reused, so a cached copy is always current.
registerRoute(
  ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/api/images/"),
  new CacheFirst({
    cacheName: PWA_CACHES.images,
    plugins: [
      onlySuccessful,
      new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 60 * DAY_IN_SECONDS, purgeOnQuotaError: true }),
    ],
  }),
);

registerRoute(
  ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/api/styles/"),
  new StaleWhileRevalidate({
    cacheName: PWA_CACHES.mapStyles,
    plugins: [onlySuccessful],
  }),
);

// Tiles, fonts and sprites for areas of the map that have been viewed. Capped, as the map can
// request thousands of tiles while panning around.
registerRoute(
  ({ url }) => url.origin === "https://api.maptiler.com" || url.origin === "https://openmaptiles.github.io",
  new CacheFirst({
    cacheName: PWA_CACHES.mapTiles,
    plugins: [
      onlySuccessful,
      new ExpirationPlugin({ maxEntries: 2000, maxAgeSeconds: 30 * DAY_IN_SECONDS, purgeOnQuotaError: true }),
    ],
  }),
);
