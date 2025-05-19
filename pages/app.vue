<script setup lang="ts">
const sidebarStore = useSidebarStore();
const locationStore = useLocationStore();
const route = useRoute();

const { currentLocation } = storeToRefs(locationStore);

effect(() => {
  if (route.name === "app") {
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
  else if (route.name === "app-locations-slug") {
    sidebarStore.sidebarMainItems = [{
      id: "app",
      label: "Back to Locations",
      href: "/app",
      icon: "tabler:arrow-left",
    }, {
      id: "app-locations-slug",
      label: currentLocation.value ? currentLocation.value.name : "View Logs",
      to: {
        name: "app-locations-slug",
        params: {
          slug: currentLocation.value?.slug,
        },
      },
      icon: "tabler:map",
    }, {
      id: "app-locations-slug-edit",
      label: currentLocation.value ? `Edit ${currentLocation.value.name}` : "Edit Location",
      to: {
        name: "app-locations-slug-edit",
        params: {
          slug: currentLocation.value?.slug,
        },
      },
      icon: "tabler:map-pin-cog",
    }, {
      id: "app-locations-slug-add",
      label: "Add Location Log",
      to: {
        name: "app-locations-slug-add",
        params: {
          slug: currentLocation.value?.slug,
        },
      },
      icon: "tabler:map-pin-plus",
    }];
  }
});
</script>

<template>
  <div class="flex-1 flex">
    <AppSidebar />
    <div class="flex-1 overflow-auto">
      <div
        class="flex size-full"
        :class="{ 'flex-col': route.path !== '/app/locations/add' }"
      >
        <NuxtPage />
        <AppMap />
      </div>
    </div>
  </div>
</template>
