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
  ],

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      // Override via NUXT_PUBLIC_S3_BUCKET_URL env var at build time
      s3BucketUrl: "",
    },
  },

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
