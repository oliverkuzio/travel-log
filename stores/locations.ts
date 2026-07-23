import type { SelectLocationLogWithImages, SelectLocationWithLogs } from "~/lib/db/schema";
import type { MapPoint, SidebarItem } from "~/lib/types";

import { CURRENT_LOCATION_LOG_PAGES, CURRENT_LOCATION_PAGES, CURRENT_PAGES } from "~/lib/constants";

export const useLocationsStore = defineStore("useLocationsStore", () => {
  const route = useRoute();

  const {
    data: locations,
    status: locationsStatus,
    refresh: refreshLocations,
  } = useFetch("/api/locations", {
    key: "locations",
    lazy: true,
  });

  const locationUrlWithSlug = computed(() => `/api/locations/${route.params.slug}`);
  const locationLogUrlWithSlugAndId = computed(() => `/api/locations/${route.params.slug}/${route.params.id}`);

  const {
    data: currentLocation,
    status: currentLocationStatus,
    error: currentLocationError,
    refresh: refreshCurrentLocation,
  } = useFetch<SelectLocationWithLogs>(locationUrlWithSlug, {
    key: "current-location",
    lazy: true,
    immediate: false,
    watch: false,
  });

  const {
    data: currentLocationLog,
    status: currentLocationLogStatus,
    error: currentLocationLogError,
    refresh: refreshCurrentLocationLog,
  } = useFetch<SelectLocationLogWithImages>(locationLogUrlWithSlugAndId, {
    key: "current-location-log",
    lazy: true,
    immediate: false,
    watch: false,
  });

  const sidebarStore = useSidebarStore();
  const mapStore = useMapStore();

  effect(() => {
    if (locations.value && !CURRENT_PAGES.has(route.name?.toString() || "")) {
      const mapPoints: MapPoint[] = [];
      const sidebarItems: SidebarItem[] = [];

      locations.value.forEach((location) => {
        const mapPoint = createMapPointFromLocation(location);

        sidebarItems.push({
          id: `location-${location.id}`,
          label: location.name,
          icon: "tabler:map-pin-filled",
          to: { name: "dashboard-locations-slug", params: { slug: location.slug } },
          mapPoint,
        });

        mapPoints.push(mapPoint);
      });

      sidebarStore.sidebarSubItems = sidebarItems;
      mapStore.mapPoints = mapPoints;
    }
    else if (currentLocation.value && CURRENT_LOCATION_PAGES.has(route.name?.toString() || "")) {
      const sidebarItems: SidebarItem[] = [];
      const mapPoint = createMapPointFromLocation(currentLocation.value);

      currentLocation.value.locationLogs.forEach((log) => {
        sidebarItems.push({
          id: `location-log-${log.id}`,
          label: log.name,
          icon: "tabler:map-pin-filled",
          to: { name: "dashboard-locations-slug-id", params: { id: log.id } },
          mapPoint,
        });
      });

      sidebarStore.sidebarSubItems = sidebarItems;
      mapStore.mapPoints = [mapPoint];
    }
    else if (currentLocation.value && CURRENT_LOCATION_LOG_PAGES.has(route.name?.toString() || "")) {
      const mapPoint = createMapPointFromLocation(currentLocation.value);

      sidebarStore.sidebarSubItems = [];
      mapStore.mapPoints = [mapPoint];
    }
    sidebarStore.loading = locationsStatus.value === "pending" || currentLocationStatus.value === "pending";
    if (sidebarStore.loading) {
      mapStore.mapPoints = [];
    }
  });

  return {
    locations,
    locationsStatus,
    refreshLocations,
    currentLocation,
    currentLocationStatus,
    currentLocationError,
    refreshCurrentLocation,
    currentLocationLog,
    currentLocationLogStatus,
    currentLocationLogError,
    refreshCurrentLocationLog,
  };
});
