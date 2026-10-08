<script lang="ts" setup>
import type { InsertTrip, SelectTrip } from "~/lib/db/schema";
import type { CoverImageChange } from "~/lib/types";

const outboxStore = useOutboxStore();
const created = ref<SelectTrip | null>(null);

async function onSubmit(values: InsertTrip, coverImage?: CoverImageChange) {
  const { data } = await outboxStore.mutate<SelectTrip>({
    kind: "trip:create",
    method: "POST",
    url: "/api/trips",
    body: coverImageRequestBody(values, coverImage),
    label: `Add trip “${values.name}”`,
    creates: true,
    preview: { ...values, coverImageKey: null, logs: [] },
  });

  created.value = data;
}

function onSubmitComplete() {
  navigateTo(created.value
    ? { name: "dashboard-trips-slug", params: { slug: created.value.slug } }
    : "/dashboard/trips");
}

useSeoMeta({
  title: "Add trip",
  description: "Add a trip to group your visits to locations.",
});
</script>

<template>
  <div class="p-4">
    <AppBreadcrumbs />
    <div class="mb-4">
      <h1 class="text-2xl font-semibold mb-4">
        Add trip
      </h1>
      <p class="text-sm mb-4">
        A trip is a journey you have taken or are planning to take. Once it's
        created, add location logs to it for each place you visit.
      </p>
      <p class="text-sm mb-4">
        A trip appears on the map at the centre of the locations it visits. You can add
        new places to visit via the
        <NuxtLink to="/dashboard/locations" class="link">
          locations page.
        </NuxtLink>
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
