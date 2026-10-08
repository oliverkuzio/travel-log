import type { SelectTripWithLogs } from "~/lib/db/schema";
import type { SortOrder } from "~/lib/types";

export const useTripsStore = defineStore("useTripsStore", () => {
  const route = useRoute();
  // Shows changes made offline that haven't been synced yet.
  const { fetchWithOutbox } = useOutboxStore();

  const {
    data: trips,
    status: tripsStatus,
    refresh: refreshTrips,
  } = useFetch("/api/trips", {
    key: "trips",
    lazy: true,
    immediate: false,
    $fetch: fetchWithOutbox as unknown as typeof $fetch,
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
    $fetch: fetchWithOutbox as unknown as typeof $fetch,
    watch: false,
  });

  const currentTripLogsSortOrder = ref<SortOrder>("asc");
  // A local YYYY-MM-DD day, or an empty string for all dates.
  const currentTripLogsDateFilter = ref("");

  // Every day covered by the current trip's logs, in the same order as the logs.
  const currentTripLogDates = computed(() => {
    const keys = new Set(currentTrip.value?.logs.flatMap(log => getDateKeysInRange(log.startedAt, log.endedAt)));
    const sorted = [...keys].sort();

    return currentTripLogsSortOrder.value === "asc" ? sorted : sorted.reverse();
  });

  const filteredCurrentTripLogs = computed(() => {
    const day = currentTripLogsDateFilter.value;
    const matching = currentTrip.value?.logs.filter(log => !day || isDateKeyInRange(day, log.startedAt, log.endedAt)) ?? [];

    return sortByDate(matching, currentTripLogsSortOrder.value);
  });

  // Drop a selected day that no log covers any more, e.g. after switching trips or editing a log.
  watch(currentTripLogDates, (dates) => {
    if (currentTripLogsDateFilter.value && !dates.includes(currentTripLogsDateFilter.value)) {
      currentTripLogsDateFilter.value = "";
    }
  });

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
    currentTripLogsDateFilter,
    currentTripLogDates,
    filteredCurrentTripLogs,
  };
});
