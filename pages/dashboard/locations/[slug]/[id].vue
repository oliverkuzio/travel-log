<script lang="ts" setup>
import type { FetchError } from "ofetch";

import type { HeadingMenuItem } from "~/lib/types";

const route = useRoute();
const locationStore = useLocationsStore();
const {
  currentLocation: location,
  currentLocationLog: locationLog,
  currentLocationLogError: error,
  currentLocationLogStatus: status,
} = storeToRefs(locationStore);

const isOpen = ref(false);
const isDeleting = ref(false);
const deleteError = ref("");

const loading = computed(() => status.value === "pending" || isDeleting.value);
const errorMessage = computed(() => error.value?.statusMessage || deleteError.value);

const menuItems = computed<HeadingMenuItem[]>(() => [{
  label: "Edit Log",
  icon: "tabler:calendar-cog",
  to: { name: "dashboard-locations-slug-id-edit", params: { slug: route.params.slug, id: route.params.id } },
}, {
  label: "Manage Images",
  icon: "tabler:photo-cog",
  to: { name: "dashboard-locations-slug-id-images", params: { slug: route.params.slug, id: route.params.id } },
}, {
  label: "Delete Log",
  icon: "tabler:calendar-x",
  danger: true,
  onClick: () => isOpen.value = true,
}]);

async function confirmDelete() {
  try {
    isOpen.value = false;
    deleteError.value = "";
    isDeleting.value = true;

    await $fetch(`/api/locations/${route.params.slug}/${route.params.id}`, {
      method: "DELETE",
    });

    await navigateTo({
      name: "dashboard-locations-slug",
      params: {
        slug: route.params.slug,
      },
    });
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = getFetchErrorMessage(error);
    isDeleting.value = false;
  }
}
</script>

<template>
  <div>
    <BackLink
      v-if="route.name === 'dashboard-locations-slug-id'"
      :to="{ name: 'dashboard-locations-slug', params: { slug: route.params.slug } }"
      :label="location?.name"
    />
    <div v-if="loading">
      <div class="loading" />
    </div>
    <AppAlert
      v-if="errorMessage && !loading"
      class="alert-error"
      icon="circle-x-filled"
      :message="errorMessage"
    />
    <div v-if="route.name === 'dashboard-locations-slug-id' && locationLog && !loading">
      <p class="text-xs opacity-50">
        {{ formatDate(locationLog.startedAt) }}
        <span v-if="locationLog.startedAt !== locationLog.endedAt">
          -
          {{ formatDate(locationLog.endedAt) }}
        </span>
      </p>
      <PageHeadingMenu :title="locationLog.name" :items="menuItems" />
      <NuxtLink
        v-if="locationLog.trip"
        :to="{ name: 'dashboard-trips-slug', params: { slug: locationLog.trip.slug } }"
        class="card card-sm card-border bg-base-100 border-l-4 border-secondary mb-4 hover:bg-base-200 transition-colors"
      >
        <div class="card-body py-2 px-3 flex-row items-center gap-2">
          <MapPin
            :colors="getPointColors('trip')"
            :icon="TRIP_ICON"
            :size="24"
            class="shrink-0"
          />
          <div class="flex-1 min-w-0">
            <p class="text-xs opacity-60">
              Part of trip
            </p>
            <p class="text-sm font-medium truncate">
              {{ locationLog.trip.name }}
            </p>
          </div>
          <span class="text-xs opacity-70 flex items-center gap-1">
            View trip
            <Icon name="tabler:arrow-right" size="14" />
          </span>
        </div>
      </NuxtLink>
      <p class="text-sm mb-4">
        {{ locationLog.description }}
      </p>
      <div v-if="!locationLog.images.length" class="flex flex-col gap-2 mt-2">
        <p>Add some images get started.</p>
        <NuxtLink :to="{ name: 'dashboard-locations-slug-id-images', params: { slug: route.params.slug, id: route.params.id } }" class="btn btn-primary w-40">
          Add Images
          <Icon name="tabler:photo-cog" size="24" />
        </NuxtLink>
      </div>
      <ImageList :images="locationLog.images" />
    </div>
    <div v-if="route.name !== 'dashboard-locations-slug-id'">
      <NuxtPage />
    </div>
    <AppDialog
      title="Are you sure?"
      description="Deleting this location log cannot be undone. Do you really want to do this?"
      confirm-label="Yes, delete this location log."
      confirm-class="btn-error"
      :is-open="isOpen"
      @on-closed="isOpen = false"
      @on-confirmed="confirmDelete"
    />
  </div>
</template>
