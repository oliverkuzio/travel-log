<script lang="ts" setup>
import type { InsertTrip, SelectTrip } from "~/lib/db/schema";
import type { CoverImageChange } from "~/lib/types";

const route = useRoute();
const tripsStore = useTripsStore();
const { $csrfFetch } = useNuxtApp();

const {
  currentTrip: trip,
  currentTripStatus: status,
} = storeToRefs(tripsStore);

const updated = ref<SelectTrip | null>(null);

async function onSubmit(values: InsertTrip, coverImage?: CoverImageChange) {
  updated.value = await $csrfFetch<SelectTrip>(`/api/trips/${route.params.slug}`, {
    method: "put",
    body: coverImageRequestBody(values, coverImage),
  });
}

function onSubmitComplete() {
  navigateTo({
    name: "dashboard-trips-slug",
    params: {
      slug: updated.value?.slug ?? route.params.slug,
    },
  });
}

useSeoMeta({
  title: () => `Edit ${trip.value?.name ?? "trip"}`,
  description: "Edit the details of this trip.",
});
</script>

<template>
  <div>
    <BackLink
      :to="{ name: 'dashboard-trips-slug', params: { slug: route.params.slug } }"
      :label="trip?.name"
    />
    <h1 class="text-2xl font-semibold mb-4">
      Edit Trip
    </h1>
    <TripForm
      v-if="status !== 'pending' && trip"
      :on-submit
      :on-submit-complete
      :initial-values="{
        name: trip.name,
        description: trip.description,
        startedAt: trip.startedAt,
        endedAt: trip.endedAt,
        coverImageKey: trip.coverImageKey,
      }"
      submit-label="Update"
      submit-icon="tabler:map-check"
    />
  </div>
</template>
