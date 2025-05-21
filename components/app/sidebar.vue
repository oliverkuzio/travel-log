<script lang="ts" setup>
import type { SidebarItem } from "~/lib/types";

import { CURRENT_LOCATION_PAGES, LOCATION_PAGES } from "~/lib/constants";

const isSidebarOpen = ref(true);
const route = useRoute();
const sidebarStore = useSidebarStore();
const locationsStore = useLocationsStore();
const mapStore = useMapStore();

const { currentLocation, currentLocationStatus } = storeToRefs(locationsStore);

onMounted(() => {
  isSidebarOpen.value = localStorage.getItem("isSidebarOpen") === "true";
});

effect(() => {
  if (LOCATION_PAGES.has(route.name?.toString() || "")) {
    sidebarStore.sidebarMainItems = [{
      id: "link-dashboard",
      label: "Locations",
      href: "/dashboard",
      icon: "tabler:map",
    }, {
      id: "link-dashboard-locations-add",
      label: "Add Location",
      href: "/dashboard/locations/add",
      icon: "tabler:map-pin-plus",
    }];
  }
  else if (CURRENT_LOCATION_PAGES.has(route.name?.toString() || "")) {
    const sidebarMainItemBack: SidebarItem = {
      id: "link-dashboard",
      label: "Back to Locations",
      href: "/dashboard",
      icon: "tabler:arrow-left",
    };

    if (currentLocation.value && currentLocationStatus.value !== "pending") {
      sidebarStore.sidebarMainItems = [
        sidebarMainItemBack,
        {
          id: "link-dashboard-locations-slug",
          label: currentLocation.value.name,
          to: {
            name: "dashboard-locations-slug",
            params: {
              slug: currentLocation.value.slug,
            },
          },
          icon: "tabler:map-pin-filled",
        },
        {
          id: "link-dashboard-locations-edit",
          label: "Edit Location",
          to: {
            name: "dashboard-locations-slug-edit",
            params: {
              slug: currentLocation.value.slug,
            },
          },
          icon: "tabler:map-pin-cog",
        },
        {
          id: "link-dashboard-locations-slug-add",
          label: "Add Log",
          to: {
            name: "dashboard-locations-slug-add",
            params: {
              slug: currentLocation.value.slug,
            },
          },
          icon: "tabler:calendar-plus",
        },
      ];
    }
    else {
      sidebarStore.sidebarMainItems = [sidebarMainItemBack];
    }
  }
});

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
  localStorage.setItem("isSidebarOpen", isSidebarOpen.value.toString());
}
</script>

<template>
  <div class="bg-base-100 transition-all duration-300 shrink-0" :class="{ 'w-64': isSidebarOpen, 'w-16': !isSidebarOpen }">
    <div
      class="flex hover:cursor-pointer hover:bg-base-200 p-2"
      :class="{ 'justify-center': !isSidebarOpen, 'justify-end': isSidebarOpen }"
      @click="toggleSidebar"
    >
      <Icon
        v-if="isSidebarOpen"
        name="tabler:chevron-left"
        size="32"
      />
      <Icon
        v-else
        name="tabler:chevron-right"
        size="32"
      />
    </div>
    <div class="flex flex-col">
      <SidebarButton
        v-for="item in sidebarStore.sidebarMainItems"
        :key="item.id"
        :show-label="isSidebarOpen"
        :label="item.label"
        :icon="item.icon"
        :href="item.href"
        :to="item.to"
      />
      <div v-if="route.path.startsWith('/dashboard/locations') && currentLocationStatus === 'pending'" class="px-4">
        <div class="skeleton h-4 w-full" />
      </div>
      <div v-if="sidebarStore.loading || sidebarStore.sidebarSubItems.length" class="divider" />
      <div v-if="sidebarStore.loading" class="px-4">
        <div class="skeleton h-4 w-full" />
      </div>
      <div v-if="!sidebarStore.loading && sidebarStore.sidebarSubItems.length" class="flex flex-col">
        <SidebarButton
          v-for="item in sidebarStore.sidebarSubItems"
          :key="item.id"
          :show-label="isSidebarOpen"
          :label="item.label"
          :icon="item.icon"
          :to="item.to"
          :icon-color="isPointSelected(item.mapPoint, mapStore.selectedPoint) ? 'text-accent' : undefined"
          @mouseenter="mapStore.selectedPoint = item.mapPoint ?? null"
          @mouseleave="mapStore.selectedPoint = null"
        />
      </div>
      <div class="divider" />
      <SidebarButton
        :show-label="isSidebarOpen"
        label="Sign Out"
        icon="tabler:logout-2"
        href="/sign-out"
      />
    </div>
  </div>
</template>
