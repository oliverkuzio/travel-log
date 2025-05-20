<script lang="ts" setup>
import { CURRENT_LOCATION_PAGES, EDIT_PAGES, LOCATION_PAGES } from "~/lib/constants";

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
  isSidebarOpen.value = localStorage.getItem("isSidebarOpen") === "true";
});

effect(() => {
  if (LOCATION_PAGES.has(route.name?.toString() || "")) {
    sidebarStore.sidebarMainItems = [{
      id: "dashboard",
      label: "Locations",
      href: "/dashboard",
      icon: "tabler:map",
    }, {
      id: "dashboard-locations-add",
      label: "Add Location",
      href: "/dashboard/locations/add",
      icon: "tabler:circle-plus-filled",
    }];
  }
  else if (CURRENT_LOCATION_PAGES.has(route.name?.toString() || "")) {
    sidebarStore.sidebarMainItems = [{
      id: "dashboard",
      label: "Back to Locations",
      href: "/dashboard",
      icon: "tabler:arrow-left",
    }];

    if (currentLocation.value && currentLocationStatus.value !== "pending") {
      sidebarStore.sidebarMainItems.push({
        id: "dashboard-locations-slug",
        label: currentLocation.value.name,
        to: {
          name: "dashboard-locations-slug",
          params: {
            slug: route.params.slug,
          },
        },
        icon: "tabler:map",
      }, {
        id: "dashboard-locations-edit",
        label: "Edit Location",
        to: {
          name: "dashboard-locations-slug-edit",
          params: {
            slug: route.params.slug,
          },
        },
        icon: "tabler:map-pin-cog",
      }, {
        id: "dashboard-locations-slug-add",
        label: "Add Location Log",
        to: {
          name: "dashboard-locations-slug-add",
          params: {
            slug: route.params.slug,
          },
        },
        icon: "tabler:circle-plus-filled",
      });
    }
  }
});

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
  localStorage.setItem("isSidebarOpen", isSidebarOpen.value.toString());
}
</script>

<template>
  <div class="flex-1 flex">
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
        <div v-if="route.path.startsWith('/dashboard/location') && currentLocationStatus === 'pending'" class="flex items-center justify-center">
          <div class="loading" />
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
    <div class="flex-1 overflow-auto bg-base-200">
      <div
        class="flex size-full"
        :class="{
          'flex-col': !EDIT_PAGES.has(route.name?.toString() || ''),
        }"
      >
        <NuxtPage
          :class="{
            'shrink-0': EDIT_PAGES.has(route.name?.toString() || ''),
            'w-96': EDIT_PAGES.has(route.name?.toString() || ''),
          }"
        />
        <AppMap />
      </div>
    </div>
  </div>
</template>
