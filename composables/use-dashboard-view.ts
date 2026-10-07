import type { CardPoint, MapPoint } from "~/lib/types";

import {
  CURRENT_LOCATION_LOG_PAGES,
  CURRENT_LOCATION_PAGES,
  CURRENT_TRIP_PAGES,
  DASHBOARD_PAGES,
  EDIT_PAGES,
  LOCATION_IMPORT_PAGES,
  LOCATION_TYPE_PAGES,
  LOCATIONS_LIST_PAGES,
  TRIP_SELECT_PAGES,
  TRIPS_LIST_PAGES,
} from "~/lib/constants";

/**
 * Owns the dashboard's shared state for the current route: which data is loaded and which points
 * are shown on the map.
 */
export default async function useDashboardView() {
  const route = useRoute();
  const mapStore = useMapStore();
  const locationsStore = useLocationsStore();
  const tripsStore = useTripsStore();
  const locationTypesStore = useLocationTypesStore();
  const locationImportStore = useLocationImportStore();

  const {
    locations,
    locationsStatus,
    filteredLocations,
    currentLocation,
    currentLocationStatus,
    currentLocationLogStatus,
  } = storeToRefs(locationsStore);
  const { trips, tripsStatus, filteredTrips, currentTrip, currentTripStatus, filteredCurrentTripLogs } = storeToRefs(tripsStore);
  const { readyImports, importsStatus, selectedIds } = storeToRefs(locationImportStore);

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

    // The locations list shows how many imported places are still waiting to be added.
    if (LOCATION_IMPORT_PAGES.has(name) || name === "dashboard-locations") {
      requests.push(locationImportStore.refreshImports());
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

  function locationPoints(source = locations.value) {
    return source?.map(createMapPointFromLocation) ?? [];
  }

  function tripPoints(source = trips.value) {
    return source?.map(createMapPointFromTrip).filter(hasCoords) ?? [];
  }

  effect(() => {
    const name = routeName.value;
    let mapPoints: MapPoint[] = [];
    let lockedPoint: CardPoint | null = null;
    let route: GeoJSON.FeatureCollection<GeoJSON.LineString> | null = null;
    let loading = false;

    if (DASHBOARD_PAGES.has(name)) {
      mapPoints = [...locationPoints(), ...tripPoints()];
      loading = tripsStatus.value === "pending" || locationsStatus.value === "pending";
    }
    else if (TRIPS_LIST_PAGES.has(name)) {
      mapPoints = tripPoints(filteredTrips.value);
      loading = tripsStatus.value === "pending";
    }
    else if (LOCATIONS_LIST_PAGES.has(name) || LOCATION_TYPE_PAGES.has(name)) {
      // Only the locations list has filters, so the map matches what it shows.
      mapPoints = locationPoints(LOCATIONS_LIST_PAGES.has(name) ? filteredLocations.value : locations.value);
      loading = locationsStatus.value === "pending";
    }
    else if (LOCATION_IMPORT_PAGES.has(name)) {
      // Preview the places ticked for import; they aren't locations yet, so they don't link anywhere.
      mapPoints = readyImports.value
        .filter(item => selectedIds.value.has(item.id) && item.lat !== null && item.long !== null)
        .map(item => ({
          id: item.id,
          kind: "location",
          name: item.name ?? "",
          description: item.address,
          lat: item.lat!,
          long: item.long!,
        }));
      loading = importsStatus.value === "pending";
    }
    else if (CURRENT_TRIP_PAGES.has(name)) {
      loading = currentTripStatus.value === "pending";

      if (currentTrip.value) {
        // Match the logs shown, which may be filtered to a single day.
        mapPoints = getTripLocations({ logs: filteredCurrentTripLogs.value }).map(createMapPointFromLocation);
        route = getTripRoute(filteredCurrentTripLogs.value);
      }
    }
    else if (CURRENT_LOCATION_PAGES.has(name) || CURRENT_LOCATION_LOG_PAGES.has(name)) {
      loading = currentLocationStatus.value === "pending" || currentLocationLogStatus.value === "pending";

      if (currentLocation.value) {
        const mapPoint = createMapPointFromLocation(currentLocation.value);

        // While editing, the draggable (accent) marker stands in for the location.
        mapPoints = EDIT_PAGES.has(name) ? [] : [mapPoint];
        lockedPoint = mapPoint;
      }
    }

    // Keep showing the previous points while refetching, so the map doesn't jump around.
    if (!loading) {
      mapStore.mapPoints = mapPoints;
      mapStore.lockedPoint = lockedPoint;
      mapStore.route = route;
    }
  });
}
