import type { CardPoint, MapPoint, SidebarItem } from "~/lib/types";

import {
  CURRENT_LOCATION_LOG_PAGES,
  CURRENT_LOCATION_PAGES,
  CURRENT_TRIP_PAGES,
  DASHBOARD_PAGES,
  EDIT_PAGES,
  LOCATION_TYPE_PAGES,
  LOCATIONS_LIST_PAGES,
  TRIP_SELECT_PAGES,
  TRIPS_LIST_PAGES,
} from "~/lib/constants";

/**
 * Owns the dashboard's shared state for the current route: which data is loaded, which points
 * are shown on the map, and which items are listed in the sidebar below the main navigation.
 */
export default async function useDashboardView() {
  const route = useRoute();
  const sidebarStore = useSidebarStore();
  const mapStore = useMapStore();
  const locationsStore = useLocationsStore();
  const tripsStore = useTripsStore();
  const locationTypesStore = useLocationTypesStore();

  const {
    locations,
    locationsStatus,
    currentLocation,
    currentLocationStatus,
    currentLocationLogStatus,
  } = storeToRefs(locationsStore);
  const { trips, tripsStatus, currentTrip, currentTripStatus } = storeToRefs(tripsStore);

  const routeName = computed(() => route.name?.toString() || "");

  function loadRouteData() {
    const name = routeName.value;
    const requests: Promise<void>[] = [];

    if (DASHBOARD_PAGES.has(name) || TRIPS_LIST_PAGES.has(name) || TRIP_SELECT_PAGES.has(name)) {
      requests.push(tripsStore.refreshTrips());
    }

    if (
      DASHBOARD_PAGES.has(name)
      || LOCATIONS_LIST_PAGES.has(name)
      || LOCATION_TYPE_PAGES.has(name)
      || name === "dashboard-trips-slug-add"
    ) {
      requests.push(locationsStore.refreshLocations());
    }

    if (CURRENT_TRIP_PAGES.has(name)) {
      requests.push(tripsStore.refreshCurrentTrip());
    }

    if (CURRENT_LOCATION_PAGES.has(name) || CURRENT_LOCATION_LOG_PAGES.has(name)) {
      requests.push(locationsStore.refreshCurrentLocation());
    }

    if (CURRENT_LOCATION_LOG_PAGES.has(name)) {
      requests.push(locationsStore.refreshCurrentLocationLog());
    }

    if (LOCATION_TYPE_PAGES.has(name) || name === "dashboard-locations-add" || name === "dashboard-locations-slug-edit") {
      requests.push(locationTypesStore.refreshLocationTypes());
    }

    return Promise.all(requests);
  }

  await loadRouteData();

  // Refetch whenever the route changes, so lists and records are fresh after adding, editing or deleting.
  watch(() => route.fullPath, () => {
    mapStore.selectedPoint = null;
    loadRouteData();
  });

  function locationItems() {
    const mapPoints: MapPoint[] = [];
    const sidebarItems: SidebarItem[] = [];

    locations.value?.forEach((location) => {
      const mapPoint = createMapPointFromLocation(location);

      sidebarItems.push({
        id: `location-${location.id}`,
        label: location.name,
        icon: mapPoint.icon || DEFAULT_LOCATION_ICON,
        pin: true,
        to: mapPoint.to,
        mapPoint,
      });
      mapPoints.push(mapPoint);
    });

    return { mapPoints, sidebarItems };
  }

  function tripItems() {
    const mapPoints: MapPoint[] = [];
    const sidebarItems: SidebarItem[] = [];

    trips.value?.forEach((trip) => {
      const point: CardPoint = createMapPointFromTrip(trip);

      sidebarItems.push({
        id: `trip-${trip.id}`,
        label: trip.name,
        icon: TRIP_ICON,
        pin: true,
        to: point.to,
        mapPoint: point,
      });

      if (hasCoords(point)) {
        mapPoints.push(point);
      }
    });

    return { mapPoints, sidebarItems };
  }

  effect(() => {
    const name = routeName.value;
    let mapPoints: MapPoint[] = [];
    let sidebarItems: SidebarItem[] = [];
    let lockedPoint: CardPoint | null = null;
    let loading = false;

    if (DASHBOARD_PAGES.has(name)) {
      mapPoints = [...locationItems().mapPoints, ...tripItems().mapPoints];
      loading = tripsStatus.value === "pending" || locationsStatus.value === "pending";
    }
    else if (TRIPS_LIST_PAGES.has(name)) {
      ({ mapPoints, sidebarItems } = tripItems());
      loading = tripsStatus.value === "pending";
    }
    else if (LOCATIONS_LIST_PAGES.has(name) || LOCATION_TYPE_PAGES.has(name)) {
      ({ mapPoints, sidebarItems } = locationItems());
      loading = locationsStatus.value === "pending";

      if (LOCATION_TYPE_PAGES.has(name)) {
        sidebarItems = [];
      }
    }
    else if (CURRENT_TRIP_PAGES.has(name)) {
      loading = currentTripStatus.value === "pending";

      if (currentTrip.value) {
        mapPoints = getTripLocations(currentTrip.value).map(createMapPointFromLocation);
        sidebarItems = currentTrip.value.logs.map((log) => {
          const mapPoint = createMapPointFromLocationLog(log, log.location);

          return {
            id: `location-log-${log.id}`,
            label: log.name,
            icon: mapPoint.icon || DEFAULT_LOCATION_ICON,
            pin: true,
            to: mapPoint.to,
            mapPoint,
          };
        });
      }
    }
    else if (CURRENT_LOCATION_PAGES.has(name) || CURRENT_LOCATION_LOG_PAGES.has(name)) {
      loading = currentLocationStatus.value === "pending" || currentLocationLogStatus.value === "pending";

      if (currentLocation.value) {
        const mapPoint = createMapPointFromLocation(currentLocation.value);

        // While editing, the draggable (accent) marker stands in for the location.
        mapPoints = EDIT_PAGES.has(name) ? [] : [mapPoint];
        lockedPoint = mapPoint;

        if (CURRENT_LOCATION_PAGES.has(name)) {
          sidebarItems = currentLocation.value.logs.map((log) => {
            const logPoint = createMapPointFromLocationLog(log, currentLocation.value!);

            return {
              id: `location-log-${log.id}`,
              label: log.name,
              icon: "tabler:calendar",
              to: logPoint.to,
              mapPoint: logPoint,
            };
          });
        }
      }
    }

    sidebarStore.loading = loading;

    // Keep showing the previous points while refetching, so the map doesn't jump around.
    if (!loading) {
      sidebarStore.sidebarSubItems = sidebarItems;
      mapStore.mapPoints = mapPoints;
      mapStore.lockedPoint = lockedPoint;
    }
  });
}
