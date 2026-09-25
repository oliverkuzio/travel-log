import type { SelectTripWithLogs } from "~/lib/db/schema";

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

  return {
    trips,
    tripsStatus,
    refreshTrips,
    currentTrip,
    currentTripStatus,
    currentTripError,
    refreshCurrentTrip,
  };
});
