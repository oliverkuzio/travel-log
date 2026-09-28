import type { SelectLocationLogWithImages, SelectLocationType, SelectLocationWithLogs } from "~/lib/db/schema";

export const useLocationsStore = defineStore("useLocationsStore", () => {
  const route = useRoute();

  const {
    data: locations,
    status: locationsStatus,
    refresh: refreshLocations,
  } = useFetch("/api/locations", {
    key: "locations",
    lazy: true,
    immediate: false,
  });

  const nameFilter = ref("");
  const typeIdsFilter = ref<number[]>([]);

  // The distinct types used by the user's locations, which are the only ones worth filtering by.
  const locationTypesInUse = computed(() => {
    const types = new Map<number, SelectLocationType>();

    locations.value?.forEach((location) => {
      if (location.type) {
        types.set(location.type.id, location.type);
      }
    });

    return [...types.values()].sort((a, b) => a.name.localeCompare(b.name));
  });

  const filteredLocations = computed(() => {
    const typeIds = new Set(typeIdsFilter.value);

    return locations.value?.filter(location =>
      matchesNameFilter(location.name, nameFilter.value)
      && (!typeIds.size || (location.typeId !== null && typeIds.has(location.typeId))),
    );
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

  return {
    locations,
    locationsStatus,
    refreshLocations,
    nameFilter,
    typeIdsFilter,
    locationTypesInUse,
    filteredLocations,
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
