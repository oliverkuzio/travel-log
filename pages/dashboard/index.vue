<script setup lang="ts">
const isSidebarOpen = ref(true);

onMounted(() => {
  const storedSidebarState = localStorage.getItem("sidebarOpen");

  if (storedSidebarState) {
    isSidebarOpen.value = JSON.parse(storedSidebarState);
  }
});

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
  localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen.value));
}
</script>

<template>
  <div class="flex-1 flex">
    <div class="bg-base-100 transition-all duration-300" :class="{ 'w-64': isSidebarOpen, 'w-16': !isSidebarOpen }">
      <div class="flex p-4 hover:cursor-pointer hover:bg-base-200" :class="{ ' justify-end': isSidebarOpen, ' justify-center': !isSidebarOpen }" @click="toggleSidebar">
        <Icon v-if="isSidebarOpen" name="tabler:chevron-left" size="24" />
        <Icon v-else name="tabler:chevron-right" size="24" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex flex-col">
          <SidebarButton
            href="/locations"
            label="Locations"
            icon="tabler:map"
            :show-label="isSidebarOpen"
          />
          <SidebarButton
            href="/locations/add"
            label="Add location"
            icon="tabler:circle-plus-filled"
            :show-label="isSidebarOpen"
          />
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
  </div>
</template>
