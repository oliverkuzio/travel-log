<script lang="ts" setup>
import type { InsertLocation } from "~/lib/db/schema";

const route = useRoute();
const locationsStore = useLocationsStore();
const { $csrfFetch } = useNuxtApp();

const {
  currentLocation: location,
  currentLocationStatus: status,
} = storeToRefs(locationsStore);

async function onSubmit(values: InsertLocation) {
  await $csrfFetch(`/api/locations/${route.params.slug}`, {
    method: "put",
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
      Edit Location
    </h1>
    <LocationForm
      v-if="status !== 'pending' && location"
      :on-submit
      :on-submit-complete
      :initial-values="location"
      :zoom="11"
      submit-label="Update"
      submit-icon="tabler:map-pin-cog"
    />
  </div>
</template>
