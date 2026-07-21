<script lang="ts" setup>
import type { InsertLocation } from "~/lib/db/schema";

const { $csrfFetch } = useNuxtApp();

async function onSubmit(values: InsertLocation) {
  await $csrfFetch("/api/locations", {
    method: "post",
    body: values,
  });
}

function onSubmitComplete() {
  navigateTo("/dashboard");
}
</script>

<template>
  <div class="p-4">
    <div class="mb-4">
      <h1 class="text-2xl font-semibold mb-4">
        Add location
      </h1>
      <p class="text-sm mb-4">
        A location is an establishment, landmark or other specific location you
        have visited on your trips. You can add the cities or countries you have
        visited or will visit on your trips via the
        <NuxtLink
          to="/dashboard/trips"
        >
          trips page
        </NuxtLink>.
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
