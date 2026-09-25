<script lang="ts" setup>
import type { CardPoint } from "~/lib/types";

const props = defineProps<{
  mapPoint: CardPoint;
  compact?: boolean;
}>();

const mapStore = useMapStore();

const selected = computed(() => isPointSelected(props.mapPoint, mapStore.activePoint));
const colors = computed(() => getPointColors(props.mapPoint.kind, selected.value));
</script>

<template>
  <NuxtLink
    class="card card-sm card-border bg-base-100 shrink-0 hover:cursor-pointer border-l-4 transition-colors"
    :to="mapPoint.to"
    :class="[colors.border, { 'border-base-300': !selected }]"
    @mouseenter="mapStore.selectedPoint = mapPoint"
    @mouseleave="mapStore.selectedPoint = null"
  >
    <div class="card-body" :class="{ 'py-2 px-3': compact }">
      <slot name="top" />
      <h2
        class="flex items-center gap-2"
        :class="compact ? 'text-sm font-medium' : 'text-xl mb-1'"
      >
        <Icon
          :name="mapPoint.icon || DEFAULT_LOCATION_ICON"
          :size="compact ? '18' : '22'"
          class="shrink-0"
          :class="colors.text"
        />
        <span class="truncate">{{ mapPoint.name }}</span>
      </h2>
      <p v-if="!compact && mapPoint.description">
        {{ mapPoint.description }}
      </p>
      <slot name="bottom" />
    </div>
  </NuxtLink>
</template>
