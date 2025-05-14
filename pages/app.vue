<script setup lang="ts">
const route = useRoute();
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
