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

// The card for the hovered point, whether hovered on the map or in the side pane.
const popupPoint = computed(() => mapStore.mapPoints.find(point => isPointSelected(point, mapStore.selectedPoint)));

// Leaving a pin waits briefly before clearing, so the pointer can move onto its card.
const HOVER_LEAVE_DELAY = 150;
let leaveTimeout: ReturnType<typeof setTimeout> | undefined;

function onPointEnter(point: CardPoint) {
  clearTimeout(leaveTimeout);
  mapStore.selectedPoint = point;
}

function onPointLeave() {
  clearTimeout(leaveTimeout);
  const point = mapStore.selectedPoint;
  leaveTimeout = setTimeout(() => {
    if (mapStore.selectedPoint === point) {
      mapStore.selectedPoint = null;
    }
  }, HOVER_LEAVE_DELAY);
}

function onPointClick(point: CardPoint) {
  if (point.to) {
    clearTimeout(leaveTimeout);
    mapStore.selectedPoint = null;
    navigateTo(point.to);
  }
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
          class="hover:cursor-pointer"
          @mouseenter="onPointEnter(point)"
          @mouseleave="onPointLeave"
          @click="onPointClick(point)"
        >
          <MapPin
            :colors="getPointColors(point.kind, isPointSelected(point, mapStore.activePoint))"
            :icon="point.icon"
          />
        </div>
      </template>
    </MglMarker>
    <MglPopup
      v-if="popupPoint"
      :key="`${popupPoint.kind}-${popupPoint.id}`"
      :coordinates="[popupPoint.long, popupPoint.lat]"
      :close-button="false"
      :close-on-click="false"
      :focus-after-open="false"
      :offset="20"
      max-width="none"
      class-name="map-point-popup"
    >
      <MapPointPopup
        :point="popupPoint"
        @mouseenter="onPointEnter(popupPoint)"
        @mouseleave="onPointLeave"
      />
    </MglPopup>
  </MglMap>
</template>
