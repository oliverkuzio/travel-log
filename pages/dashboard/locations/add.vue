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
  <div class="container max-w-md mx-auto p-4">
    <div class="mb-4">
      <h1 class="text-2xl font-bold mb-6">
        Add Location
      </h1>
      <p class="text-sm my-6">
        A location is a place you have traveled or will travel to. It can be a
        city, country, or any other geographical area. You can add specific
        vists to this location via the location log.
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
