import tailwindcss from "@tailwindcss/vite";

import "./lib/env";

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
  },

  colorMode: {
    dataValue: "theme",
  },
});
