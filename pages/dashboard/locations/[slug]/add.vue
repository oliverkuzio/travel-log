<script lang="ts" setup>
import type { InsertLocationLog } from "~/lib/db/schema";

import { CENTER_MAP } from "~/lib/constants";

const route = useRoute();
const { $csrfFetch } = useNuxtApp();

const { currentLocation } = useLocationsStore();

async function onSubmit(values: InsertLocationLog) {
  await $csrfFetch(`/api/locations/${route.params.slug}/add`, {
    method: "post",
    body: values,
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
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-4">
      Add Log
    </h1>
    <LocationLogForm
      :on-submit="onSubmit"
      :on-submit-complete="onSubmitComplete"
      submit-label="Add Location Log"
      submit-icon="tabler:calendar-plus"
      :initial-values="{
        name: '',
        description: '',
        startedAt: Date.now() - (24 * 60 * 60 * 1000),
        endedAt: Date.now(),
        long: currentLocation?.long || (CENTER_MAP as [number, number])[0],
        lat: currentLocation?.lat || (CENTER_MAP as [number, number])[1],
      }"
    />
  </div>
</template>
