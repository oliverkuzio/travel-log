<script lang="ts" setup>
import { CURRENT_LOCATION_PAGES, EDIT_PAGES, LOCATION_PAGES } from "~/lib/constants";

const sidebarStore = useSidebarStore();
const locationStore = useLocationStore();
const route = useRoute();

const { currentLocation, currentLocationStatus } = storeToRefs(locationStore);

if (LOCATION_PAGES.has(route.name?.toString() || "")) {
  await locationStore.refreshLocations();
}

if (CURRENT_LOCATION_PAGES.has(route.name?.toString() || "")) {
  await locationStore.refreshCurrentLocation();
}

effect(() => {
  if (LOCATION_PAGES.has(route.name?.toString() || "")) {
    sidebarStore.sidebarMainItems = [{
      id: "app",
      label: "Locations",
      href: "/app",
      icon: "tabler:map",
    }, {
      id: "app-locations-add",
      label: "Add location",
      href: "/app/locations/add",
      icon: "tabler:circle-plus-filled",
    }];
  }
  else if (CURRENT_LOCATION_PAGES.has(route.name?.toString() || "")) {
    sidebarStore.sidebarMainItems = [{
      id: "app",
      label: "Back to Locations",
      href: "/app",
      icon: "tabler:arrow-left",
    }];

    if (currentLocation.value && currentLocationStatus.value !== "pending") {
      sidebarStore.sidebarMainItems.push({
        id: "app",
        label: currentLocation.value.name,
        to: {
          name: "app-locations-slug",
          params: {
            slug: route.params.slug,
          },
        },
        icon: "tabler:map",
      }, {
        id: "link-locations-edit",
        label: "Edit Location",
        to: {
          name: "app-locations-slug-edit",
          params: {
            slug: route.params.slug,
          },
        },
        icon: "tabler:map-pin-cog",
      }, {
        id: "link-locations-add",
        label: "Add Location Log",
        to: {
          name: "app-locations-slug-add",
          params: {
            slug: route.params.slug,
          },
        },
        icon: "tabler:map-pin-plus",
      });
    }
  }
});
</script>

<template>
  <div class="flex-1 flex">
    <AppSidebar />
    <div class="flex-1 overflow-auto">
      <div
        class="flex size-full"
        :class="{
          'flex-col': !EDIT_PAGES.has(route.name?.toString() || ''),
        }"
      >
        <NuxtPage />
        <AppMap />
      </div>
    </div>
  </div>
</template>
