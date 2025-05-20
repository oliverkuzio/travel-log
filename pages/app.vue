<script lang="ts" setup>
import { EDIT_PAGES } from "~/lib/constants";

const route = useRoute();
</script>

<template>
  <div class="flex-1 flex">
    <AppSidebar />
    <div class="flex-1 overflow-auto">
      <div
        class="flex size-full"
        :class="{
          'flex-col': !EDIT_PAGES.has(route.name?.toString() || ''),
        }"
      >
        <NuxtPage />
        <AppMap />
      </div>
    </div>
  </div>
</template>
