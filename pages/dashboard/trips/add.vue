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
        Add trip
      </h1>
      <p class="text-sm mb-4">
        A trip is a place you have traveled or are planning to travel to. It can
        be a city, country, or any other, wider geographical area. You can add
        specific locations you have visited or will visit on your trips via the
        log, or via the
        <NuxtLink
          to="/dashboard/locations"
        >
          locations page
        </NuxtLink>.
      </p>
    </div>
    <TripForm
      :on-submit
      :on-submit-complete
      submit-label="Add"
      submit-icon="tabler:map-plus"
    />
  </div>
</template>
