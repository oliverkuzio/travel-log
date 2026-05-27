import tailwindcss from "@tailwindcss/vite";

import env from "./lib/env";

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
  ],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      s3BucketUrl: env.S3_BUCKET_URL,
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
});
