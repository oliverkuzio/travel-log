<script lang="ts" setup>
import type { SidebarItem } from "~/lib/types";

const isSidebarOpen = ref(true);
const sidebarStore = useSidebarStore();
const authStore = useAuthStore();
const mapStore = useMapStore();

onMounted(() => {
  isSidebarOpen.value = localStorage.getItem("isSidebarOpen") === "true";
});

const mainItems = computed(() => {
  const items: SidebarItem[] = [{
    id: "link-dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: "tabler:layout-dashboard",
  }, {
    id: "link-dashboard-trips",
    label: "Trips",
    href: "/dashboard/trips",
    icon: TRIP_ICON,
    iconColor: getPointColors("trip").text,
    matchPrefix: true,
  }, {
    id: "link-dashboard-locations",
    label: "Locations",
    href: "/dashboard/locations",
    icon: "tabler:map-pins",
    iconColor: getPointColors("location").text,
    matchPrefix: true,
  }];

  if (authStore.isAdmin) {
    items.push({
      id: "link-dashboard-types",
      label: "Location Types",
      href: "/dashboard/types",
      icon: "tabler:category",
      matchPrefix: true,
    });
  }

  return items;
});

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
  localStorage.setItem("isSidebarOpen", isSidebarOpen.value.toString());
}
</script>

<template>
  <div class="bg-base-300 transition-all duration-300 shrink-0" :class="{ 'w-64': isSidebarOpen, 'w-16': !isSidebarOpen }">
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
        v-for="item in mainItems"
        :key="item.id"
        :show-label="isSidebarOpen"
        :label="item.label"
        :icon="item.icon"
        :href="item.href"
        :icon-color="item.iconColor"
        :match-prefix="item.matchPrefix"
      />
      <div v-if="sidebarStore.loading || sidebarStore.sidebarSubItems.length" class="divider" />
      <div v-if="sidebarStore.loading && !sidebarStore.sidebarSubItems.length" class="px-4">
        <div class="skeleton h-4 w-full" />
      </div>
      <div v-if="sidebarStore.sidebarSubItems.length" class="flex flex-col">
        <SidebarButton
          v-for="item in sidebarStore.sidebarSubItems"
          :key="item.id"
          :show-label="isSidebarOpen"
          :label="item.label"
          :icon="item.icon"
          :to="item.to"
          :icon-color="item.mapPoint ? getPointColors(item.mapPoint.kind, isPointSelected(item.mapPoint, mapStore.activePoint)).text : undefined"
          :pin-colors="item.pin && item.mapPoint ? getPointColors(item.mapPoint.kind, isPointSelected(item.mapPoint, mapStore.activePoint)) : undefined"
          :pin-icon="item.mapPoint?.icon"
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
