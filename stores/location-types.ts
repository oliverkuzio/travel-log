export const useLocationTypesStore = defineStore("useLocationTypesStore", () => {
  const {
    data: locationTypes,
    status: locationTypesStatus,
    refresh: refreshLocationTypes,
  } = useFetch("/api/types", {
    key: "location-types",
    lazy: true,
    immediate: false,
  });

  const nameFilter = ref("");
  const filteredLocationTypes = computed(() =>
    locationTypes.value?.filter(locationType => matchesNameFilter(locationType.name, nameFilter.value)),
  );

  return {
    locationTypes,
    locationTypesStatus,
    refreshLocationTypes,
    nameFilter,
    filteredLocationTypes,
  };
});
