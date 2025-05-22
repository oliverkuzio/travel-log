<script lang="ts" setup>
import { CURRENT_LOCATION_PAGES, LOCATION_PAGES } from "~/lib/constants";

const route = useRoute();
const locationsStore = useLocationsStore();

if (LOCATION_PAGES.has(route.name?.toString() || "")) {
  await locationsStore.refreshLocations();
}

if (CURRENT_LOCATION_PAGES.has(route.name?.toString() || "")) {
  await locationsStore.refreshLocations();
  await locationsStore.refreshCurrentLocation();
}
</script>

<template>
  <div class="flex-1 flex items-stretch">
    <AppSidebar />
    <div class="flex-1 flex items-stretch bg-base-100 relative">
      <NuxtPage class="w-96 shrink-0 max-h-screen overflow-y-scroll z-10" />
      <div class="flex-1">
        <AppMap />
      </div>
    </div>
  </div>
</template>
