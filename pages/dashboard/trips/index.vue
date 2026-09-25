<script lang="ts" setup>
const tripsStore = useTripsStore();
const { trips, tripsStatus: status } = storeToRefs(tripsStore);
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl mb-4">
      Your trips
    </h1>
    <div class="flex flex-col flex-nowrap gap-4 align-items-stretch">
      <AddCard
        label="Add new trip"
        icon="tabler:map-plus"
        to="/dashboard/trips/add"
        kind="trip"
      />
      <div v-if="status === 'pending' && !trips">
        <LoadingSpinner />
      </div>
      <p v-else-if="!trips?.length" class="text-sm italic">
        Add a trip to get started.
      </p>
      <MapPointCard
        v-for="trip in trips"
        :key="trip.id"
        :map-point="createMapPointFromTrip(trip)"
      >
        <template #top>
          <p class="text-xs opacity-50">
            {{ formatDate(trip.startedAt) }}
            <span v-if="trip.startedAt !== trip.endedAt">
              -
              {{ formatDate(trip.endedAt) }}
            </span>
          </p>
        </template>
        <template #bottom>
          <p class="text-xs opacity-70">
            {{ getTripLocations(trip).length }}
            {{ getTripLocations(trip).length === 1 ? "location" : "locations" }}
          </p>
        </template>
      </MapPointCard>
    </div>
  </div>
</template>
