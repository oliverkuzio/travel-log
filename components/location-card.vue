<script lang="ts" setup>
import type { MapPoint } from "~/lib/types";

defineProps<{
  mapPoint: MapPoint;
}>();

const mapStore = useMapStore();
</script>

<template>
  <NuxtLink
    class="card card-compact bg-base-200 border-2 shrink-0 hover:cursor-pointer"
    :to="mapPoint.to"
    :class="{
      'border-accent': isPointSelected(mapPoint, mapStore.selectedPoint),
      'border-transparent': !isPointSelected(mapPoint, mapStore.selectedPoint),
    }"
    @mouseenter="mapStore.selectedPoint = mapPoint"
    @mouseleave="mapStore.selectedPoint = null"
  >
    <div class="card-body">
      <slot name="top" />
      <h2 class="text-lg font-semibold mb-2">
        {{ mapPoint.name }}
      </h2>
      <p>{{ mapPoint.description }}</p>
    </div>
  </NuxtLink>
</template>
