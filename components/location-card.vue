<script lang="ts" setup>
import type { MapPoint } from "~/lib/types";

defineProps<{
  mapPoint: MapPoint;
}>();

const mapStore = useMapStore();
</script>

<template>
  <NuxtLink
    class="card card-sm card-border bg-base-100 border-base-300 shrink-0 hover:cursor-pointer"
    :to="mapPoint.to"
    :class="{
      'border-base-content': isPointSelected(mapPoint, mapStore.selectedPoint),
    }"
    @mouseenter="mapStore.selectedPoint = mapPoint"
    @mouseleave="mapStore.selectedPoint = null"
  >
    <div class="card-body">
      <slot name="top" />
      <h2 class="text-xl mb-1">
        {{ mapPoint.name }}
      </h2>
      <p>{{ mapPoint.description }}</p>
    </div>
  </NuxtLink>
</template>
