export const useLocationImportStore = defineStore("useLocationImportStore", () => {
  const {
    data: imports,
    status: importsStatus,
    refresh: refreshImports,
  } = useFetch("/api/location-imports", {
    key: "location-imports",
    lazy: true,
    immediate: false,
  });

  const readyImports = computed(() => imports.value?.filter(item => item.status === "ready") ?? []);
  const lookupImports = computed(() => imports.value?.filter(item => item.status === "lookup") ?? []);

  // Ids of the ready items ticked in the review checklist, which are also shown on the map.
  const selectedIds = ref(new Set<number>());

  // Tick newly staged items by default, and forget ones that are no longer staged.
  const knownIds = new Set<number>();

  watch(readyImports, (items) => {
    const selected = new Set<number>();

    items.forEach((item) => {
      if (!knownIds.has(item.id) || selectedIds.value.has(item.id)) {
        selected.add(item.id);
      }
      knownIds.add(item.id);
    });

    selectedIds.value = selected;
  });

  return {
    imports,
    importsStatus,
    refreshImports,
    readyImports,
    lookupImports,
    selectedIds,
  };
});
