<script lang="ts" setup>
import type { InsertLocationLog } from "~/lib/db/schema";

const route = useRoute();
const outboxStore = useOutboxStore();
const { currentLocation: location } = storeToRefs(useLocationsStore());
const { trips } = storeToRefs(useTripsStore());

async function onSubmit(values: InsertLocationLog) {
  await outboxStore.mutate({
    kind: "log:create",
    method: "POST",
    url: `/api/locations/${route.params.slug}/add`,
    body: values,
    label: `Log a visit to “${location.value?.name}”`,
    creates: true,
    preview: {
      ...values,
      tripId: values.tripId ?? null,
      locationId: location.value?.id,
      location: locationPreview(location.value),
      trip: tripPreview(findById(trips.value, values.tripId)),
      images: [],
    },
  });
}

function onSubmitComplete() {
  navigateTo({
    name: "dashboard-locations-slug",
    params: {
      slug: route.params.slug,
    },
  });
}

useSeoMeta({
  title: () => location.value ? `Add log for ${location.value.name}` : "Add log",
  description: "Log a visit to this location.",
});
</script>

<template>
  <div>
    <AppBreadcrumbs />
    <h1 class="text-2xl font-semibold mb-4">
      Add Log
    </h1>
    <LocationLogForm
      :on-submit
      :on-submit-complete
      submit-label="Add Location Log"
      submit-icon="tabler:calendar-plus"
      select-trip
    />
  </div>
</template>
