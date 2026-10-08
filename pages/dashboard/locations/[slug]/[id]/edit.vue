<script lang="ts" setup>
import type { InsertLocationLog } from "~/lib/db/schema";

const route = useRoute();
const locationsStore = useLocationsStore();
const outboxStore = useOutboxStore();
const { trips } = storeToRefs(useTripsStore());

const {
  currentLocationLog: locationLog,
  currentLocationLogStatus: status,
} = storeToRefs(locationsStore);

async function onSubmit(values: InsertLocationLog) {
  await outboxStore.mutate({
    kind: "log:update",
    method: "PUT",
    url: `/api/locations/${route.params.slug}/${route.params.id}`,
    body: values,
    label: `Edit log “${values.name}”`,
    target: { id: Number(route.params.id) },
    preview: { ...values, tripId: values.tripId ?? null, trip: tripPreview(findById(trips.value, values.tripId)) },
  });
}

function submitComplete() {
  navigateTo({
    name: "dashboard-locations-slug-id",
    params: {
      slug: route.params.slug,
      id: route.params.id,
    },
  });
}

useSeoMeta({
  title: () => `Edit ${locationLog.value?.name ?? "log"}`,
  description: "Edit the details of this visit.",
});
</script>

<template>
  <div>
    <AppBreadcrumbs />
    <h1 class="text-2xl font-semibold mb-4">
      Edit Location Log
    </h1>
    <LocationLogForm
      v-if="status !== 'pending' && locationLog"
      :on-submit="onSubmit"
      :on-submit-complete="submitComplete"
      :initial-values="{
        name: locationLog.name,
        description: locationLog.description,
        startedAt: locationLog.startedAt,
        endedAt: locationLog.endedAt,
        tripId: locationLog.tripId,
      }"
      select-trip
      submit-label="Update"
      submit-icon="tabler:calendar-up"
    />
  </div>
</template>
