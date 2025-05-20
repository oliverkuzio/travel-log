<script lang="ts" setup>
import { CURRENT_LOCATION_PAGES, LOCATION_PAGES } from "~/lib/constants";

const isSidebarOpen = ref(true);
const route = useRoute();
const sidebarStore = useSidebarStore();
const locationsStore = useLocationsStore();
const mapStore = useMapStore();

const { currentLocation, currentLocationStatus } = storeToRefs(locationsStore);

if (LOCATION_PAGES.has(route.name?.toString() || "")) {
  await locationsStore.refreshLocations();
}

if (CURRENT_LOCATION_PAGES.has(route.name?.toString() || "")) {
  await locationsStore.refreshCurrentLocation();
}

onMounted(() => {
  isSidebarOpen.value = localStorage.getItem("sidebarOpen") === "true";
});

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
        id: "app-locations-slug",
        label: currentLocation.value.name,
        to: {
          name: "app-locations-slug",
          params: {
            slug: route.params.slug,
          },
        },
        icon: "tabler:map",
      }, {
        id: "app-locations-slug-edit",
        label: "Edit Location",
        to: {
          name: "app-locations-slug-edit",
          params: {
            slug: route.params.slug,
          },
        },
        icon: "tabler:map-pin-cog",
      }, {
        id: "app-locations-slug-add",
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

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
  localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen.value));
}
</script>

<template>
  <div class="bg-base-200 border-t border-base-300 transition-all duration-300 shrink-0" :class="{ 'w-64': isSidebarOpen, 'w-16': !isSidebarOpen }">
    <SidebarToggle :show-labels="isSidebarOpen" :handle-toggle="toggleSidebar" />
    <div class="flex flex-col gap-2">
      <div class="flex flex-col">
        <SidebarButton
          v-for="item in sidebarStore.sidebarMainItems"
          :key="item.id"
          :href="item.href"
          :to="item.to"
          :label="item.label"
          :icon="item.icon"
          :show-label="isSidebarOpen"
        />
        <div v-if="route.path.startsWith('/app/locations') && currentLocationStatus === 'pending'" class="gap-4">
          <div class="skeleton h-4 w-full" />
        </div>
        <div v-if="sidebarStore.loading || sidebarStore.sidebarSubItems.length">
          <div class="divider" />
        </div>
        <div v-if="sidebarStore.loading" class="gap-4">
          <div class="skeleton h-4 w-full" />
        </div>
        <div v-if="!sidebarStore.loading && sidebarStore.sidebarSubItems.length" class="flex flex-col gap-4">
          <SidebarButton
            v-for="item in sidebarStore.sidebarSubItems"
            :key="item.id"
            :to="item.to"
            :label="item.label"
            :icon="item.icon"
            :show-label="isSidebarOpen"
            :icon-color="isPointSelected(item.mapPoint, mapStore.selectedPoint) ? 'text-primary' : undefined"
            @mouseenter="mapStore.selectedPoint = item.mapPoint ?? null"
            @mouseleave="mapStore.selectedPoint = null"
          />
        </div>
        <div class="divider" />
        <SidebarButton
          href="/sign-out"
          label="Sign out"
          icon="tabler:logout-2"
          :show-label="isSidebarOpen"
        />
      </div>
    </div>
  </div>
</template>
