import type { LngLatBounds } from "maplibre-gl";

import type { MapPoint } from "~/lib/types";

import { CENTER_MAP } from "~/lib/constants";

export const useMapStore = defineStore("useMapStore", () => {
  const mapPoints = ref<MapPoint[]>([]);
  const selectedPoint = ref<MapPoint | null>(null);
  const shouldFlyTo = ref(true);

  function selectPoint(point: MapPoint | null) {
    shouldFlyTo.value = false;
    selectedPoint.value = point;
  }

  async function init() {
    const { useMap } = await import("@indoorequal/vue-maplibre-gl");
    const { LngLatBounds } = await import("maplibre-gl");

    const map = useMap();

    let bounds: LngLatBounds | null = null;
    const padding = 64;

    effect(() => {
      const firstPoint = mapPoints.value[0];
      if (!firstPoint) {
        map.map?.flyTo({
          center: CENTER_MAP,
          zoom: 3,
        });
        return;
      }

      bounds = mapPoints.value.reduce((bounds, point) => {
        return bounds.extend([point.long, point.lat]);
      }, new LngLatBounds(
        [firstPoint.long, firstPoint.lat],
        [firstPoint.long, firstPoint.lat],
      ));

      map.map?.fitBounds(bounds, {
        padding,
        maxZoom: 10,
      });
    });

    effect(() => {
      if (selectedPoint.value) {
        if (shouldFlyTo.value) {
          map.map?.flyTo({
            center: [selectedPoint.value.long, selectedPoint.value.lat],
            speed: 0.8,
          });
        }

        shouldFlyTo.value = true;
      }
      else if (bounds) {
        map.map?.fitBounds(bounds, {
          padding,
          maxZoom: 10,
        });
      }
    });
  }

  return {
    init,
    selectPoint,
    mapPoints,
    selectedPoint,
  };
});
