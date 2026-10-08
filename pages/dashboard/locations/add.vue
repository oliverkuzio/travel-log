<script lang="ts" setup>
import type { InsertLocation, SelectLocation } from "~/lib/db/schema";
import type { CoverImageChange } from "~/lib/types";

const { $csrfFetch } = useNuxtApp();
const created = ref<SelectLocation | null>(null);

async function onSubmit(values: InsertLocation, coverImage?: CoverImageChange) {
  created.value = await $csrfFetch<SelectLocation>("/api/locations", {
    method: "post",
    body: coverImageRequestBody(values, coverImage),
  });
}

function onSubmitComplete() {
  navigateTo(created.value
    ? { name: "dashboard-locations-slug", params: { slug: created.value.slug } }
    : "/dashboard/locations");
}

useSeoMeta({
  title: "Add location",
  description: "Add a place you have visited on your trips.",
});
</script>

<template>
  <div class="p-4">
    <AppBreadcrumbs />
    <div class="mb-4">
      <h1 class="text-2xl font-semibold mb-4">
        Add location
      </h1>
      <p class="text-sm mb-4">
        A location is an establishment, landmark or other specific location you
        have visited on your trips.
      </p>
      <p class="text-sm mb-4">
        Once added, you can log visits to this location and group them into
        journeys via the
        <NuxtLink
          to="/dashboard/trips"
          class="link"
        >
          trips page.
        </NuxtLink>
      </p>
    </div>
    <LocationForm
      :on-submit
      :on-submit-complete
      submit-label="Add"
      submit-icon="tabler:map-pin-plus"
    />
  </div>
</template>
