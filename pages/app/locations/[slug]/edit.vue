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
    name: "app-locations-slug",
    params: {
      slug: route.params.slug,
    },
  });
}
</script>

<template>
  <LocationForm
    v-if="status !== 'pending'"
    :on-submit
    :on-submit-complete
    :initial-values="location"
    submit-label="Update"
    submit-icon="tabler:map-pin-cog"
  />
</template>
