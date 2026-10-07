import type { SelectTripWithLogs } from "~/lib/db/schema";
import type { SortOrder } from "~/lib/types";

export const useTripsStore = defineStore("useTripsStore", () => {
  const route = useRoute();

  const {
    data: trips,
    status: tripsStatus,
    refresh: refreshTrips,
  } = useFetch("/api/trips", {
    key: "trips",
    lazy: true,
    immediate: false,
  });

  const nameFilter = ref("");
  const sortOrder = ref<SortOrder>("desc");
  const filteredTrips = computed(() => {
    const matching = trips.value?.filter(trip => matchesNameFilter(trip.name, nameFilter.value));

    return matching && sortByDate(matching, sortOrder.value);
  });

  const tripUrlWithSlug = computed(() => `/api/trips/${route.params.slug}`);

  const {
    data: currentTrip,
    status: currentTripStatus,
    error: currentTripError,
    refresh: refreshCurrentTrip,
  } = useFetch<SelectTripWithLogs>(tripUrlWithSlug, {
    key: "current-trip",
    lazy: true,
    immediate: false,
    watch: false,
  });

  const currentTripLogsSortOrder = ref<SortOrder>("asc");
  const sortedCurrentTripLogs = computed(() =>
    currentTrip.value ? sortByDate(currentTrip.value.logs, currentTripLogsSortOrder.value) : [],
  );

  return {
    trips,
    tripsStatus,
    refreshTrips,
    nameFilter,
    sortOrder,
    filteredTrips,
    currentTrip,
    currentTripStatus,
    currentTripError,
    refreshCurrentTrip,
    currentTripLogsSortOrder,
    sortedCurrentTripLogs,
  };
});
