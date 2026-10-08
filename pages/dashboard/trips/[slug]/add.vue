<script lang="ts" setup>
import type { InsertTripLocationLog } from "~/lib/db/schema";

const route = useRoute();
const outboxStore = useOutboxStore();
const { locations, locationsStatus } = storeToRefs(useLocationsStore());
const { currentTrip: trip } = storeToRefs(useTripsStore());

async function onSubmit(values: Partial<InsertTripLocationLog>) {
  const location = findById(locations.value, values.locationId);

  await outboxStore.mutate({
    kind: "log:create",
    method: "POST",
    url: `/api/trips/${route.params.slug}/logs`,
    body: values,
    label: `Log a visit to “${location?.name ?? values.name}” on “${trip.value?.name}”`,
    creates: true,
    preview: {
      ...values,
      tripId: trip.value?.id,
      location: locationPreview(location),
      trip: tripPreview(trip.value),
      images: [],
    },
  });
}

function onSubmitComplete() {
  navigateTo({
    name: "dashboard-trips-slug",
    params: {
      slug: route.params.slug,
    },
  });
}

useSeoMeta({
  title: () => trip.value ? `Add log to ${trip.value.name}` : "Add log",
  description: "Log a visit to a location as part of this trip.",
});
</script>

<template>
  <div>
    <AppBreadcrumbs />
    <h1 class="text-2xl font-semibold mb-4">
      Add Log
    </h1>
    <div v-if="locationsStatus === 'pending' && !locations">
      <LoadingSpinner />
    </div>
    <div v-else-if="!locations?.length" class="flex flex-col gap-4">
      <p class="text-sm italic">
        A log records a visit to one of your locations. Add a location first.
      </p>
      <NuxtLink to="/dashboard/locations/add" class="btn btn-primary">
        Add Location
        <Icon name="tabler:map-pin-plus" size="24" />
      </NuxtLink>
    </div>
    <LocationLogForm
      v-else
      :on-submit
      :on-submit-complete
      select-location
      submit-label="Add Location Log"
      submit-icon="tabler:calendar-plus"
    />
  </div>
</template>
