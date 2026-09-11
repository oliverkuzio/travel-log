<script lang="ts" setup>
const tripsStore = useTripsStore();
const { trips, tripsStatus: status } = storeToRefs(tripsStore);

onMounted(() => {
  tripsStore.refreshTrips();
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl mb-4">
      Your trips
    </h1>
    <div v-if="status === 'pending'">
      <LoadingSpinner />
    </div>
    <div v-else-if="trips && trips.length > 0">
      <div class="flex flex-col flex-nowrap gap-4 align-items-stretch">
        <LocationCard
          v-for="trip in trips"
          :key="trip.id"
          :map-point="createMapPointFromTrip(trip)"
        />
      </div>
    </div>
    <div v-else class="flex flex-col gap-4">
      <p>Add a trip to get started.</p>
      <NuxtLink to="/dashboard/trips/add" class="btn btn-primary w-40">
        Add Trip
        <Icon name="tabler:map-plus" size="24" />
      </NuxtLink>
    </div>
  </div>
</template>
