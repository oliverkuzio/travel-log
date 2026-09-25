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

  return {
    locationTypes,
    locationTypesStatus,
    refreshLocationTypes,
  };
});
