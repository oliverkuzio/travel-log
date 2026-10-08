<script lang="ts" setup>
await useDashboardView();
</script>

<template>
  <!-- Leave room for the fixed dock on phones. -->
  <div class="flex-1 flex items-stretch pb-16 md:pb-0">
    <AppSidebar />
    <div class="flex-1 flex items-stretch bg-base-200 relative">
      <NuxtPage class="w-96 shrink-0 max-h-screen overflow-y-scroll z-10" />
      <div class="flex-1">
        <AppMap />
      </div>
    </div>
    <AppDock />
  </div>
</template>
