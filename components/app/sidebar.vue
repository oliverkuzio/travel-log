<script lang="ts" setup>
const isSidebarOpen = ref(true);
const route = useRoute();
const sidebarStore = useSidebarStore();
const locationsStore = useLocationStore();
const mapStore = useMapStore();

onMounted(() => {
  isSidebarOpen.value = localStorage.getItem("sidebarOpen") === "true";

  if (route.path !== "/dashboard") {
    locationsStore.refreshLocations();
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
        <div v-if="route.path.startsWith('/app/locations') && locationsStore.currentLocationStatus === 'pending'" class="gap-4">
          <div class="skeleton h-4 w-full" />
        </div>
        <div v-if="sidebarStore.loading || sidebarStore.sidebarSubItems.length" class="divider" />
        <div v-if="sidebarStore.loading" class="gap-4">
          <div class="skeleton h-4 w-full" />
        </div>
        <div v-if="!sidebarStore.loading && sidebarStore.sidebarSubItems.length > 0" class="flex flex-col gap-4">
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
