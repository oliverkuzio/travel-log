<script lang="ts" setup>
import type { InsertLocationType } from "~/lib/db/schema";

definePageMeta({
  middleware: "admin",
});

const { $csrfFetch } = useNuxtApp();

async function onSubmit(values: InsertLocationType) {
  await $csrfFetch("/api/types", {
    method: "post",
    body: values,
  });
}

function onSubmitComplete() {
  navigateTo("/dashboard/types");
}

useSeoMeta({
  title: "Add location type",
  description: "Add a type for categorising locations.",
});
</script>

<template>
  <div class="p-4">
    <BackLink to="/dashboard/types" label="Location types" />
    <h1 class="text-2xl font-semibold mb-4">
      Add location type
    </h1>
    <LocationTypeForm
      :on-submit
      :on-submit-complete
      submit-label="Add"
      submit-icon="tabler:category-plus"
    />
  </div>
</template>
