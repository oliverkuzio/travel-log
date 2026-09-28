<script lang="ts" setup>
const tripsStore = useTripsStore();
const { trips, filteredTrips, nameFilter, tripsStatus: status } = storeToRefs(tripsStore);

const { formatDateRange } = useDateFormat();
const tripNames = computed(() => trips.value?.map(trip => trip.name) ?? []);
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
      <template v-else>
        <NameFilter v-model="nameFilter" :names="tripNames" />
        <p v-if="!filteredTrips?.length" class="text-sm italic">
          No trips match your filter.
        </p>
      </template>
      <MapPointCard
        v-for="trip in filteredTrips"
        :key="trip.id"
        :map-point="createMapPointFromTrip(trip)"
      >
        <template #top>
          <p class="text-xs opacity-50">
            {{ formatDateRange(trip.startedAt, trip.endedAt) }}
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
