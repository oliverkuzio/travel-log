<script lang="ts" setup>
import type { MapPoint } from "~/lib/types";

const props = defineProps<{
  point: MapPoint;
}>();

const { formatDateRange } = useDateFormat();

const colors = computed(() => getPointColors(props.point.kind));

const visits = computed(() => {
  const count = props.point.visitCount;

  if (count === undefined) {
    return null;
  }

  return props.point.kind === "trip"
    ? `Visited ${count} ${count === 1 ? "location" : "locations"}`
    : `Visited ${count} ${count === 1 ? "time" : "times"}`;
});
</script>

<template>
  <div class="w-60">
    <img
      v-if="point.coverImageKey"
      :src="`/api/images/${point.coverImageKey}`"
      :alt="`Cover photo of ${point.name}`"
      class="w-full h-32 object-cover"
    >
    <div class="p-3">
      <div class="flex items-start gap-2">
        <h3 class="flex-1 text-base font-semibold flex items-center gap-2 min-w-0">
          <Icon
            :name="point.icon || DEFAULT_LOCATION_ICON"
            size="20"
            class="shrink-0"
            :class="colors.text"
          />
          <span class="truncate">{{ point.name }}</span>
        </h3>
        <NuxtLink
          v-if="point.to"
          :to="point.to"
          class="btn btn-sm btn-circle shrink-0"
          :class="colors.btn"
          aria-label="View"
          title="View"
        >
          <Icon name="tabler:eye" size="18" />
        </NuxtLink>
      </div>
      <p v-if="point.typeName" class="badge badge-neutral badge-sm mt-1">
        {{ point.typeName }}
      </p>
      <p v-if="point.dates" class="text-xs opacity-60 mt-1">
        {{ formatDateRange(point.dates.startedAt, point.dates.endedAt, point.dates.withTime) }}
      </p>
      <p v-if="visits" class="text-xs opacity-60 mt-1">
        {{ visits }}
      </p>
      <p v-if="point.description" class="text-sm mt-2 line-clamp-3">
        {{ point.description }}
      </p>
    </div>
  </div>
</template>
