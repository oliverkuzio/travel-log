<script lang="ts" setup>
import type { InsertLocationLog } from "~/lib/db/schema";

const route = useRoute();
const locationsStore = useLocationsStore();
const { $csrfFetch } = useNuxtApp();

const {
  currentLocationLog: locationLog,
  currentLocationLogStatus: status,
} = storeToRefs(locationsStore);

async function onSubmit(values: InsertLocationLog) {
  await $csrfFetch(`/api/locations/${route.params.slug}/${route.params.id}`, {
    method: "put",
    body: values,
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
</script>

<template>
  <div>
    <BackLink
      :to="{ name: 'dashboard-locations-slug-id', params: { slug: route.params.slug, id: route.params.id } }"
      :label="locationLog?.name"
    />
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
