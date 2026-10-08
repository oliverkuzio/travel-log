<script lang="ts" setup>
const { trips } = storeToRefs(useTripsStore());
const { locations } = storeToRefs(useLocationsStore());

const mappedTrips = computed(() => trips.value?.filter(trip => getTripCoords(trip)).length ?? 0);

useSeoMeta({
  title: "Dashboard",
  description: "An overview of your trips and locations.",
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-semibold mb-4">
      Dashboard
    </h1>
    <p class="text-sm mb-4">
      All of your trips and locations are shown on the map. Trips are placed at the centre of the
      locations they visit.
    </p>
    <div class="flex flex-col gap-4">
      <NuxtLink to="/dashboard/trips" class="card card-sm card-border bg-base-100 border-l-4 border-secondary">
        <div class="card-body flex-row items-center gap-3">
          <Icon
            :name="TRIP_ICON"
            size="32"
            class="text-secondary"
          />
          <div class="flex-1 flex items-baseline justify-between gap-2">
            <h2 class="text-lg">
              {{ trips?.length ?? 0 }} {{ trips?.length === 1 ? "trip" : "trips" }}
            </h2>
            <p class="text-xs opacity-70">
              {{ mappedTrips }} on the map
            </p>
          </div>
        </div>
      </NuxtLink>
      <NuxtLink
        to="/dashboard/locations"
        class="card card-sm card-border bg-base-100 border-l-4"
        :class="getPointColors('location').border"
      >
        <div class="card-body flex-row items-center gap-3">
          <Icon
            name="tabler:map-pins"
            size="32"
            :class="getPointColors('location').text"
          />
          <h2 class="text-lg">
            {{ locations?.length ?? 0 }} {{ locations?.length === 1 ? "location" : "locations" }}
          </h2>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
