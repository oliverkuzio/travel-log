<script lang="ts" setup>
const locationsStore = useLocationsStore();
const { locations, filteredLocations, locationsStatus: status } = storeToRefs(locationsStore);
const { imports } = storeToRefs(useLocationImportStore());

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
    <div class="flex flex-col flex-nowrap gap-2 align-items-stretch">
      <AddCard
        label="Add new location"
        icon="tabler:map-pin-plus"
        to="/dashboard/locations/add"
        kind="location"
        compact
      />
      <AddCard
        :label="imports?.length
          ? `Continue Google Maps import (${imports.length} remaining)`
          : 'Import locations from Google Maps'"
        icon="tabler:file-import"
        to="/dashboard/locations/import"
        kind="location"
        compact
      />
      <h2 class="text-xl font-semibold mt-4">
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
