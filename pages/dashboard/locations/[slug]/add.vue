<script lang="ts" setup>
import type { InsertLocationLog } from "~/lib/db/schema";

const route = useRoute();

// const { $csrfFetch } = useNuxtApp();

async function onSubmit(values: InsertLocationLog) {
  // await $csrfFetch("/api/locations", {
  //   method: "post",
  //   body: values,
  // });

  console.log(values);
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
      Add Log
    </h1>
    <LocationLogForm
      :on-submit="onSubmit"
      :on-submit-complete
      submit-label="Add Location Log"
      submit-icon="tabler:calendar-plus"
    />
  </div>
</template>
