<script lang="ts" setup>
import type { HeadingMenuItem } from "~/lib/types";

const locationsStore = useLocationsStore();
const { locations, filteredLocations, locationsStatus: status } = storeToRefs(locationsStore);
const { imports } = storeToRefs(useLocationImportStore());

const actions = computed<HeadingMenuItem[]>(() => [{
  label: "Add location",
  icon: "tabler:map-pin-plus",
  to: "/dashboard/locations/add",
}, {
  label: imports.value?.length ? `Continue import (${imports.value.length})` : "Import from Google",
  icon: "tabler:file-import",
  to: "/dashboard/locations/import",
}]);

useSeoMeta({
  title: "Locations",
  description: "The establishments, landmarks and other places you have visited.",
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-semibold mb-4">
      Locations
    </h1>
    <EntityActions
      :items="actions"
      kind="location"
      align-start
    />
    <div class="flex flex-col flex-nowrap gap-2 align-items-stretch">
      <h2 class="text-xl font-semibold">
        Your locations
      </h2>
      <div v-if="status === 'pending' && !locations">
        <LoadingSpinner />
      </div>
      <p v-else-if="!locations?.length" class="text-sm italic">
        Add a location to get started.
      </p>
      <template v-else>
        <LocationFilters />
        <p v-if="!filteredLocations?.length" class="text-sm italic">
          No locations match your filters.
        </p>
      </template>
      <MapPointCard
        v-for="location in filteredLocations"
        :key="location.id"
        :map-point="createMapPointFromLocation(location)"
        compact
      />
    </div>
  </div>
</template>
