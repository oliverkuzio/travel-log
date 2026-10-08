<script lang="ts" setup>
const colorMode = useColorMode();

useHead({
  titleTemplate: title => title ? `${title} | Travel Log` : "Travel Log",
  link: [
    { rel: "icon", href: "/favicon.ico", sizes: "any" },
    { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
    { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  ],
  meta: [
    // Each theme's base-100, so the browser and installed app chrome match the page.
    { name: "theme-color", content: () => colorMode.value === "light" ? "#effcf9" : "#002d2c" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    { name: "apple-mobile-web-app-title", content: "Travel Log" },
  ],
});

useSeoMeta({
  description: "Keep track of your travels and adventures.",
});
</script>

<template>
  <NuxtPwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
