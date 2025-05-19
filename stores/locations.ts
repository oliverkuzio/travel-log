import type { SelectLocationWithLogs } from "~/lib/db/schema";
import type { MapPoint } from "~/lib/types";

import { createMapPointFromLocation } from "~/utils/map-points";

const listLocationsInSidebar = new Set([
  "app",
  "app-locations-add",
]);

const listCurrentLocationInSidebar = new Set([
  "app-locations-slug",
  "app-locations-slug-add",
  "app-locations-slug-edit",
]);

export const useLocationStore = defineStore("useLocationStore", () => {
  const route = useRoute();

  const { data: locations, status: locationsStatus, refresh: refreshLocations } = useFetch("/api/locations", {
    lazy: true,
  });

  const locationUrlWithSlug = computed(() => `/api/locations/${route.params.slug}`);

  const {
    data: currentLocation,
    status: currentLocationStatus,
    error: currentLocationError,
    refresh: refreshCurrentLocation,
  } = useFetch <SelectLocationWithLogs>(locationUrlWithSlug, {
    lazy: true,
    immediate: false,
    watch: false,
  });

  const sidebarStore = useSidebarStore();
  const mapStore = useMapStore();

  effect(() => {
    if (locations.value && listLocationsInSidebar.has(route.name?.toString() || "")) {
      const sidebarSubItems: SidebarItem[] = [];
      const mapPoints: MapPoint[] = [];

      locations.value.forEach((location) => {
        const mapPoint = createMapPointFromLocation(location);

        sidebarSubItems.push({
          id: `app-locations-${location.slug}`,
          label: location.name,
          icon: "tabler:map-pin-filled",
          to: { name: "app-locations-slug", params: { slug: location.slug } },
          mapPoint,
        });
        mapPoints.push(mapPoint);
      });

      sidebarStore.sidebarSubItems = sidebarSubItems;
      mapStore.mapPoints = mapPoints;
    }
    else if (currentLocation.value && listCurrentLocationInSidebar.has(route.name?.toString() || "")) {
      sidebarStore.sidebarSubItems = [];
      mapStore.mapPoints = [currentLocation.value];
    }

    sidebarStore.loading = locationsStatus.value === "pending";
  });

  return {
    locations,
    locationsStatus,
    refreshLocations,
    currentLocation,
    currentLocationStatus,
    currentLocationError,
    refreshCurrentLocation,
  };
});
