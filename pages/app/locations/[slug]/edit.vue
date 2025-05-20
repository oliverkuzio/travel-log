<script lang="ts" setup>
import type { InsertLocation } from "~/lib/db/schema";

const route = useRoute();
const locationStore = useLocationStore();
const { $csrfFetch } = useNuxtApp();

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
  <div class="container max-w-md mx-auto p-4">
    <div class="mb-4">
      <h1 class="text-2xl font-bold mb-6">
        {{ locationStore.currentLocation ? `Edit ${locationStore.currentLocation.name}` : 'Edit Location' }}
      </h1>
    </div>
    <LocationForm
      v-if="locationStore.currentLocationStatus !== 'pending'"
      :on-submit
      :on-submit-complete
      :initial-values="locationStore.currentLocation"
      submit-label="Update"
      submit-icon="tabler:map-pin-cog"
    />
  </div>
</template>
