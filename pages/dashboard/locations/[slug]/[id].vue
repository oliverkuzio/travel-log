<script lang="ts" setup>
import type { FetchError } from "ofetch";

import type { HeadingMenuItem } from "~/lib/types";

const route = useRoute();
const { formatDateRange } = useDateFormat();
const locationStore = useLocationsStore();
const {
  currentLocation: location,
  currentLocationLog: locationLog,
  currentLocationLogError: error,
  currentLocationLogStatus: status,
} = storeToRefs(locationStore);

const isOpen = ref(false);
const isDeleting = ref(false);
const isGalleryOpen = ref(false);
const galleryStartIndex = ref(0);
const deleteError = ref("");

// Show images oldest first on the log page; the query returns newest first for the Manage Images page
const images = computed(() => locationLog.value?.images.toReversed() ?? []);

const loading = computed(() => status.value === "pending" || isDeleting.value);
const errorMessage = computed(() => error.value?.statusMessage || deleteError.value);

const actions = computed<HeadingMenuItem[]>(() => [{
  label: "Edit",
  icon: "tabler:calendar-cog",
  to: { name: "dashboard-locations-slug-id-edit", params: { slug: route.params.slug, id: route.params.id } },
}, {
  label: "Images",
  icon: "tabler:photo-cog",
  to: { name: "dashboard-locations-slug-id-images", params: { slug: route.params.slug, id: route.params.id } },
}, {
  label: "Delete",
  icon: "tabler:calendar-x",
  danger: true,
  onClick: () => isOpen.value = true,
}]);

function openGallery(index = 0) {
  galleryStartIndex.value = index;
  isGalleryOpen.value = true;
}

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

useSeoMeta({
  title: () => locationLog.value?.name ?? "Log",
  description: () => locationLog.value?.description || `A visit to ${location.value?.name ?? "this location"}.`,
});
</script>

<template>
  <div>
    <AppBreadcrumbs v-if="route.name === 'dashboard-locations-slug-id'" />
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
      <div v-if="location?.coverImageKey" class="relative mb-4">
        <img
          :src="`/api/images/${location.coverImageKey}`"
          :alt="`Cover photo of ${location.name}`"
          class="w-full h-48 object-cover rounded-box"
        >
        <p class="badge badge-neutral badge-sm absolute top-2 left-2 shadow-sm">
          {{ formatDateRange(locationLog.startedAt, locationLog.endedAt, true) }}
        </p>
      </div>
      <h1 class="text-2xl font-semibold mb-4">
        {{ locationLog.name }}
      </h1>
      <p v-if="!location?.coverImageKey" class="badge badge-neutral badge-sm mb-4">
        {{ formatDateRange(locationLog.startedAt, locationLog.endedAt, true) }}
      </p>
      <EntityActions :items="actions" kind="location" />
      <div class="divider" />
      <p class="text-sm mb-4">
        {{ locationLog.description }}
      </p>
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
      <div class="divider" />
      <p v-if="!locationLog.images.length" class="text-sm italic">
        Add some images to get started.
      </p>
      <button
        v-if="locationLog.images.length"
        type="button"
        class="btn btn-sm btn-secondary"
        @click="openGallery()"
      >
        View Gallery
        <Icon name="tabler:photo-scan" size="18" />
      </button>
      <ImageList
        :images
        expandable
        @select="openGallery"
      />
      <ImageGallery
        :images
        :is-open="isGalleryOpen"
        :start-index="galleryStartIndex"
        @on-closed="isGalleryOpen = false"
      />
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
