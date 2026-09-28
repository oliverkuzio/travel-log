<script lang="ts" setup>
const locationsStore = useLocationsStore();
const { locations, filteredLocations, locationsStatus: status } = storeToRefs(locationsStore);
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl mb-4">
      Your locations
    </h1>
    <div class="flex flex-col flex-nowrap gap-2 align-items-stretch">
      <AddCard
        label="Add new location"
        icon="tabler:map-pin-plus"
        to="/dashboard/locations/add"
        kind="location"
        compact
      />
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
