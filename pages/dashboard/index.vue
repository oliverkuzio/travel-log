<script lang="ts" setup>
const locationsStore = useLocationsStore();
const { locations, locationsStatus: status } = storeToRefs(locationsStore);

onMounted(() => {
  locationsStore.refreshLocations();
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl mb-4">
      Locations
    </h1>
    <div v-if="status === 'pending'">
      <LoadingSpinner />
    </div>
    <div v-else-if="locations && locations.length > 0">
      <div class="flex flex-col flex-nowrap gap-4 align-items-stretch">
        <LocationCard
          v-for="location in locations"
          :key="location.id"
          :map-point="createMapPointFromLocation(location)"
        />
      </div>
    </div>
    <div v-else class="flex flex-col gap-4">
      <p>Add a location to get started.</p>
      <NuxtLink to="/dashboard/locations/add" class="btn btn-primary w-40">
        Add Location
        <Icon name="tabler:map-pin-plus" size="24" />
      </NuxtLink>
    </div>
  </div>
</template>
