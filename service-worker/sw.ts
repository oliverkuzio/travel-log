/// <reference lib="webworker" />
import type { WorkboxPlugin } from "workbox-core";

import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

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
  cacheName: "pages",
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
