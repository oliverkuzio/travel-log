<script lang="ts" setup>
import type { InsertLocationType, SelectLocationType } from "~/lib/db/schema";

definePageMeta({
  middleware: "admin",
});

const route = useRoute();
const { $csrfFetch } = useNuxtApp();

const { data: locationType, status } = await useFetch<SelectLocationType>(`/api/types/${route.params.slug}`, {
  key: `location-type-${route.params.slug}`,
});

async function onSubmit(values: InsertLocationType) {
  await $csrfFetch(`/api/types/${route.params.slug}`, {
    method: "put",
    body: values,
  });
}

function onSubmitComplete() {
  navigateTo("/dashboard/types");
}

useSeoMeta({
  title: () => `Edit ${locationType.value?.name ?? "location type"}`,
  description: "Edit this location type.",
});
</script>

<template>
  <div class="p-4">
    <AppBreadcrumbs />
    <h1 class="text-2xl font-semibold mb-4">
      Edit location type
    </h1>
    <LocationTypeForm
      v-if="status !== 'pending' && locationType"
      :on-submit
      :on-submit-complete
      :initial-values="{
        name: locationType.name,
        description: locationType.description,
        icon: locationType.icon,
      }"
      submit-label="Update"
      submit-icon="tabler:device-floppy"
    />
  </div>
</template>
