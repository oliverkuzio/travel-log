<script setup lang="ts">
const isSidebarOpen = ref(true);
const route = useRoute();
const sidebarStore = useSidebarStore();
const locationsStore = useLocationStore();

onMounted(() => {
  const storedSidebarState = localStorage.getItem("sidebarOpen");

  if (storedSidebarState) {
    isSidebarOpen.value = JSON.parse(storedSidebarState);
    if (route.path !== "/dashboard") {
      locationsStore.refresh();
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
    <div
      class="tooltip-right"
      :data-tip="isSidebarOpen ? undefined : 'Expand'"
      :class="{ tooltip: !isSidebarOpen }"
    >
      <div
        class="flex p-4 hover:cursor-pointer hover:bg-base-300"
        :class="{ ' justify-end': isSidebarOpen, ' justify-center': !isSidebarOpen }"
        @click="toggleSidebar"
      >
        <Icon
          v-if="isSidebarOpen"
          name="tabler:chevron-left"
          size="24"
        />
        <Icon
          v-else
          name="tabler:chevron-right"
          size="24"
        />
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex flex-col">
        <SidebarButton
          href="/app"
          label="Trips"
          icon="tabler:luggage"
          :show-label="isSidebarOpen"
        />
        <SidebarButton
          href="/app"
          label="Locations"
          icon="tabler:map"
          :show-label="isSidebarOpen"
        />
        <div class="divider" />
        <div v-if="sidebarStore.loading" class="flex flex-col gap-4">
          <div class="skeleton h-4 w-full" />
        </div>
        <div v-if="!sidebarStore.loading && sidebarStore.sidebarItems.length > 0">
          <SidebarButton
            v-for="item in sidebarStore.sidebarItems"
            :key="item.id"
            :href="item.href"
            :label="item.label"
            :icon="item.icon"
            :show-label="isSidebarOpen"
          />
        </div>
        <SidebarButton
          v-if="!sidebarStore.loading"
          href="/app/locations/add"
          label="Add location"
          icon="tabler:circle-plus-filled"
          :show-label="isSidebarOpen"
        />
      </div>
    </div>
    <div class="divider" />
    <SidebarButton
      href="/sign-out"
      label="Sign out"
      icon="tabler:logout-2"
      :show-label="isSidebarOpen"
    />
  </div>
</template>
