<script lang="ts" setup>
import type { InsertLocation } from "~/lib/db/schema";
import type { CoverImageChange } from "~/lib/types";

const route = useRoute();
const locationsStore = useLocationsStore();
const { $csrfFetch } = useNuxtApp();

const {
  currentLocation: location,
  currentLocationStatus: status,
} = storeToRefs(locationsStore);

async function onSubmit(values: InsertLocation, coverImage?: CoverImageChange) {
  await $csrfFetch(`/api/locations/${route.params.slug}`, {
    method: "put",
    body: coverImageRequestBody(values, coverImage),
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
  title: () => `Edit ${location.value?.name ?? "location"}`,
  description: "Edit the details of this location.",
});
</script>

<template>
  <div>
    <BackLink
      :to="{ name: 'dashboard-locations-slug', params: { slug: route.params.slug } }"
      :label="location?.name"
    />
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
      submit-icon="tabler:map-pin-up"
    />
  </div>
</template>
