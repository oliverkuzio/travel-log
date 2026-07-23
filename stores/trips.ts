import type { SelectTrip } from "~/lib/db/schema";
import type { MapPoint, SidebarItem } from "~/lib/types";

import { CURRENT_PAGES } from "~/lib/constants";

export const useTripsStore = defineStore("useLocationSotre", () => {
  const route = useRoute();

  const {
    data: trips,
    status: tripsStatus,
    refresh: refreshTrips,
  } = useFetch("/api/trips", {
    key: "trips",
    lazy: true,
  });

  const tripUrlWithSlug = computed(() => `/api/trips/${route.params.slug}`);

  const {
    data: currentTrip,
    status: currentTripStatus,
    // error: currentTripError,
    refresh: refreshCurrentTrip,
  } = useFetch<SelectTrip>(tripUrlWithSlug, {
    key: "current-trip",
    lazy: true,
    immediate: false,
    watch: false,
  });

  const sidebarStore = useSidebarStore();
  const mapStore = useMapStore();

  effect(() => {
    if (trips.value && !CURRENT_PAGES.has(route.name?.toString() || "")) {
      const mapPoints: MapPoint[] = [];
      const sidebarItems: SidebarItem[] = [];

      trips.value.forEach((trip) => {
        const mapPoint = createMapPointFromTrip(trip);

        sidebarItems.push({
          id: `trip-${trip.id}`,
          label: trip.name,
          icon: "tabler:map",
          to: { name: "dashboard-trips-slug", params: { slug: trip.slug } },
          mapPoint,
        });

        mapPoints.push(mapPoint);
      });

      sidebarStore.sidebarSubItems = sidebarItems;
      mapStore.mapPoints = mapPoints;
    }
  });

  return {
    trips,
    tripsStatus,
    refreshTrips,
    currentTrip,
    currentTripStatus,
    refreshCurrentTrip,
  };
});
