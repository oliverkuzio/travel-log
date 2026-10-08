<script lang="ts" setup>
await useDashboardView();
useOfflinePrefetch();
</script>

<template>
  <div class="flex-1 relative">
    <!-- The map fills the space behind the side pane, leaving room for the fixed dock on phones. -->
    <div class="absolute inset-0 bottom-16 md:bottom-0 overflow-hidden bg-base-200">
      <div class="absolute inset-0">
        <AppMap />
      </div>
      <AppSidePane>
        <NuxtPage />
      </AppSidePane>
    </div>
    <AppDock />
  </div>
</template>
