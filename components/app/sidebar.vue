<script lang="ts" setup>
const { mainItems, signOutItem } = useNavItems();
</script>

<template>
  <!-- Stack above the page column (z-10) so the tooltips aren't covered by it. Phones use AppDock instead. -->
  <div class="hidden md:flex flex-col bg-base-300 w-16 shrink-0 relative z-20">
    <div class="flex flex-col flex-1">
      <SidebarButton
        v-for="item in mainItems"
        :key="item.id"
        :item="item"
      />
    </div>
    <SidebarButton :item="signOutItem" />
  </div>
</template>
