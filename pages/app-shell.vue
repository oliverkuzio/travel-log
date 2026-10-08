<script lang="ts" setup>
// Prerendered without SSR so the service worker can serve it for any route it has no cached copy
// of. Nuxt's router renders the requested URL rather than this page, so this is only ever shown if
// someone visits /app-shell directly.
await navigateTo("/dashboard", { replace: true });
</script>

<template>
  <div />
</template>
