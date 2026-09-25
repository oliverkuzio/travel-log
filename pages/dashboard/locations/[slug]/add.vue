<script lang="ts" setup>
import type { InsertLocationLog } from "~/lib/db/schema";

const route = useRoute();
const { $csrfFetch } = useNuxtApp();
const { currentLocation: location } = storeToRefs(useLocationsStore());

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
    <BackLink
      :to="{ name: 'dashboard-locations-slug', params: { slug: route.params.slug } }"
      :label="location?.name"
    />
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
