import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: [
    "nitro-cloudflare-dev",
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxtjs/color-mode",
    "@pinia/nuxt",
    "@vee-validate/nuxt",
    "nuxt-csurf",
    "nuxt-maplibre",
    "@sentry/nuxt/module",
    "@vite-pwa/nuxt",
  ],

  css: ["~/assets/css/main.css"],

  nitro: {
    preset: "cloudflare_module",

    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: [
        "maplibre-gl",
      ],
    },
    server: {
      watch: {
        ignored: [
          "./.docker/*",
        ],
      },
    },
  },

  routeRules: {
    // A client-rendered page the service worker serves for navigations it has no cached copy of,
    // so the router can still render the requested route while offline.
    "/app-shell": { ssr: false },
  },

  pwa: {
    strategies: "injectManifest",
    srcDir: "service-worker",
    filename: "sw.ts",
    registerType: "prompt",
    manifest: {
      id: "/",
      name: "Travel Log",
      short_name: "Travel Log",
      description: "Keep track of your travels and adventures.",
      start_url: "/dashboard",
      scope: "/",
      display: "standalone",
      // The dark theme's base-100, as dark is the default theme.
      theme_color: "#002d2c",
      background_color: "#002d2c",
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
        { src: "/maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    injectManifest: {
      globPatterns: ["**/*.{js,css,html,png,ico,svg,woff2}"],
      globIgnores: ["styles/**", "**/sentry-example*"],
      // Rendered by the server rather than built, so re-fetch it with each new build.
      additionalManifestEntries: [{ url: "/app-shell", revision: Date.now().toString() }],
    },
    client: {
      installPrompt: true,
      // Check for a new deployment hourly, as installed apps can stay open for days.
      periodicSyncForUpdates: 3600,
    },
  },

  colorMode: {
    dataValue: "theme",
  },

  sentry: {
    // eslint-disable-next-line node/no-process-env
    org: process.env.SENTRY_ORG,
    // eslint-disable-next-line node/no-process-env
    project: process.env.SENTRY_PROJECT,
  },

  sourcemap: {
    client: "hidden",
  },
});
