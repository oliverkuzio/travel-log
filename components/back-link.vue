<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router";

defineProps<{
  to: RouteLocationRaw;
  label?: string | null;
}>();
</script>

<template>
  <NuxtLink :to class="link link-hover text-sm flex items-center gap-1 mb-2 opacity-70">
    <Icon name="tabler:arrow-left" size="16" />
    {{ label }}
  </NuxtLink>
</template>
