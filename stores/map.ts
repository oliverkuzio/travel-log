import type { LngLatBounds, Map as MaplibreMap } from "maplibre-gl";

import type { CardPoint, MapPoint } from "~/lib/types";

import { CENTER_MAP, ROUTE_CASING_COLOR } from "~/lib/constants";

export const ROUTE_ARROW_IMAGE = "route-arrow";

/**
 * Draws the chevron shown along trip routes to point the way they were travelled.
 */
function addRouteArrowImage(map: MaplibreMap) {
  const pixelRatio = 2;
  const size = 12 * pixelRatio;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.strokeStyle = ROUTE_CASING_COLOR;
  context.lineWidth = 2.5 * pixelRatio;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(size * 0.35, size * 0.2);
  context.lineTo(size * 0.7, size * 0.5);
  context.lineTo(size * 0.35, size * 0.8);
  context.stroke();

  map.addImage(ROUTE_ARROW_IMAGE, context.getImageData(0, 0, size, size), { pixelRatio });
}

export const useMapStore = defineStore("useMapStore", () => {
  const mapPoints = ref<MapPoint[]>([]);
  const selectedPoint = ref<CardPoint | null>(null);
  // The point for the record currently being viewed, which stays highlighted when not hovering.
  const lockedPoint = ref<CardPoint | null>(null);
  const activePoint = computed(() => selectedPoint.value ?? lockedPoint.value);
  const addedPoint = ref<MapPoint & { centerMap?: boolean; zoom?: number } | null>(null);
  // The current trip's route as one line per leg, or null when not viewing a trip.
  const route = ref<GeoJSON.FeatureCollection<GeoJSON.LineString> | null>(null);
  // How much of the map's left and bottom edges the side pane covers. It isn't reactive, so moving the pane
  // doesn't refit the map.
  let insets = { left: 0, bottom: 0 };

  async function init(defaultZoom = 3) {
    const { useMap } = await import("@indoorequal/vue-maplibre-gl");
    const { LngLatBounds } = await import("maplibre-gl");

    const map = useMap();

    let bounds: LngLatBounds | null = null;
    const padding = 64;

    // Switching between light and dark styles drops added images, so add the arrow whenever it's missing.
    watch(() => map.map, (newMap) => {
      newMap?.on("styleimagemissing", (event) => {
        if (event.id === ROUTE_ARROW_IMAGE && !newMap.hasImage(ROUTE_ARROW_IMAGE)) {
          addRouteArrowImage(newMap);
        }
      });
    }, {
      immediate: true,
    });

    effect(() => {
      const firstPoint = mapPoints.value[0];
      if (!firstPoint) {
        map.map?.flyTo({
          center: CENTER_MAP,
          zoom: defaultZoom,
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
        padding: {
          top: padding,
          right: padding,
          bottom: padding + insets.bottom,
          left: padding + insets.left,
        },
        maxZoom: 12,
      });
    });

    watch(addedPoint, (newValue, oldValue) => {
      if ((newValue && !oldValue) || newValue?.centerMap) {
        map.map?.flyTo({
          center: [newValue.long, newValue.lat],
          speed: 0.8,
          zoom: newValue.zoom || 6,
        });
      }
    }, {
      immediate: true,
    });
  }

  function setInsets(value: typeof insets) {
    insets = value;
  }

  /**
   * Clears everything shown on the map, for pages that don't populate it.
   */
  function reset() {
    mapPoints.value = [];
    selectedPoint.value = null;
    lockedPoint.value = null;
    addedPoint.value = null;
    route.value = null;
  }

  return {
    init,
    reset,
    setInsets,
    mapPoints,
    addedPoint,
    selectedPoint,
    lockedPoint,
    activePoint,
    route,
  };
});
