<script lang="ts" setup>
import type { MglEvent } from "@indoorequal/vue-maplibre-gl";
import type { LngLat } from "maplibre-gl";

import type { CardPoint } from "~/lib/types";

import { CENTER_MAP, ROUTE_CASING_COLOR, ROUTE_COLOR } from "~/lib/constants";
import { ROUTE_ARROW_IMAGE } from "~/stores/map";

const { zoom = 3, controls = true } = defineProps<{
  zoom?: number;
  controls?: boolean;
}>();

const mapStore = useMapStore();
const colorMode = useColorMode();
const style = computed(() => `/api/styles/${colorMode.value}`);
// Only the first style is passed to the map. Later switches are made below, because the default diff would
// drop the trip route's source and layers without firing the "style.load" event that re-adds them.
const initialStyle = style.value;
const { formatDateRange } = useDateFormat();

function formatPointDates(dates: NonNullable<CardPoint["dates"]>) {
  return formatDateRange(dates.startedAt, dates.endedAt, dates.withTime);
}

function updateAddedPoint(location: LngLat) {
  if (mapStore.addedPoint) {
    mapStore.addedPoint.lat = location.lat;
    mapStore.addedPoint.long = location.lng;
  }
}

function onDoubleClick(mglEvent: MglEvent<"dblclick">) {
  if (mapStore.addedPoint) {
    mapStore.addedPoint.lat = mglEvent.event.lngLat.lat;
    mapStore.addedPoint.long = mglEvent.event.lngLat.lng;
  }
}

onMounted(() => {
  mapStore.init(zoom);
});

watch(style, async (newStyle) => {
  const { useMap } = await import("@indoorequal/vue-maplibre-gl");
  useMap().map?.setStyle(newStyle, { diff: false });
});
</script>

<template>
  <MglMap
    :map-style="initialStyle"
    :center="CENTER_MAP"
    :zoom="zoom"
    @map:dblclick="onDoubleClick($event)"
  >
    <MglNavigationControl v-if="controls" />
    <MglGeoJsonSource
      v-if="mapStore.route"
      source-id="trip-route"
      :data="mapStore.route"
    >
      <MglLineLayer
        layer-id="trip-route-casing"
        :layout="{ 'line-join': 'round', 'line-cap': 'round' }"
        :paint="{ 'line-color': ROUTE_CASING_COLOR, 'line-width': 6, 'line-opacity': 0.6 }"
      />
      <MglLineLayer
        layer-id="trip-route-line"
        :layout="{ 'line-join': 'round', 'line-cap': 'round' }"
        :paint="{ 'line-color': ROUTE_COLOR, 'line-width': 4 }"
      />
      <MglSymbolLayer
        layer-id="trip-route-arrows"
        :layout="{
          'symbol-placement': 'line',
          'symbol-spacing': 80,
          'icon-image': ROUTE_ARROW_IMAGE,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'icon-rotation-alignment': 'map',
        }"
      />
    </MglGeoJsonSource>
    <MglMarker
      v-if="mapStore.addedPoint"
      :coordinates="[mapStore.addedPoint.long, mapStore.addedPoint.lat]"
      draggable
      class-name="z-50"
      @update:coordinates="updateAddedPoint($event)"
    >
      <template #marker>
        <div
          class="tooltip tooltip-top tooltip-open hover:cursor-pointer"
          :class="getPointColors('location', true).tooltip"
          data-tip="Drag to desired location."
        >
          <MapPin
            :colors="getPointColors('location', true)"
            :icon="mapStore.addedPoint.icon"
            :size="48"
          />
        </div>
      </template>
    </MglMarker>
    <MglMarker
      v-for="point in mapStore.mapPoints"
      :key="`${point.kind}-${point.id}`"
      :coordinates="[point.long, point.lat]"
      :class-name="isPointSelected(point, mapStore.activePoint) ? 'z-40' : undefined"
    >
      <template #marker>
        <div
          class="tooltip tooltip-top hover:cursor-pointer"
          :class="[
            getPointColors(point.kind, isPointSelected(point, mapStore.activePoint)).tooltip,
            { 'tooltip-open': isPointSelected(point, mapStore.activePoint) },
          ]"
          @mouseenter="mapStore.selectedPoint = point"
          @mouseleave="mapStore.selectedPoint = null"
        >
          <div class="tooltip-content">
            <div>{{ point.name }}</div>
            <div v-if="point.dates" class="text-xs opacity-80">
              {{ formatPointDates(point.dates) }}
            </div>
          </div>
          <MapPin
            :colors="getPointColors(point.kind, isPointSelected(point, mapStore.activePoint))"
            :icon="point.icon"
          />
        </div>
      </template>
      <MglPopup>
        <h3 class="text-base font-semibold me-3 mb-3 flex items-center gap-2">
          <Icon
            v-if="point.icon"
            :name="point.icon"
            size="20"
            :class="getPointColors(point.kind).text"
          />
          {{ point.name }}
        </h3>
        <p v-if="point.dates" class="text-xs opacity-60 -mt-2 mb-3">
          {{ formatPointDates(point.dates) }}
        </p>
        <p v-if="point.description" class="mb-4">
          {{ point.description }}
        </p>
        <div class="flex justify-end">
          <NuxtLink
            v-if="point.to"
            :to="point.to"
            class="btn btn-sm"
            :class="getPointColors(point.kind).btn"
          >
            {{ point.toLabel }}
          </NuxtLink>
        </div>
      </MglPopup>
    </MglMarker>
  </MglMap>
</template>
