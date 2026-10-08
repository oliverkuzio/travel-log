<script lang="ts" setup>
import type { FetchError } from "ofetch";

import type { HeadingMenuItem } from "~/lib/types";

const route = useRoute();
const { formatDateRange } = useDateFormat();
const locationStore = useLocationsStore();
const outboxStore = useOutboxStore();
const {
  currentLocation: location,
  currentLocationError: error,
  currentLocationStatus: status,
  currentLocationLogsSortOrder: sortOrder,
  sortedCurrentLocationLogs: sortedLogs,
} = storeToRefs(locationStore);

const isOpen = ref(false);
const deleteError = ref("");
const isDeleting = ref(false);

const loading = computed(() => status.value === "pending" || isDeleting.value);
const errorMessage = computed(() => error.value?.statusMessage || deleteError.value);

// Keep spaces as "+" and commas literal so the query reads like "Name,+Street,+City".
function encodeMapsQueryPart(value: string) {
  return encodeURIComponent(value).replace(/%20/g, "+").replace(/%2C/g, ",");
}

const googleMapsHref = computed(() => {
  if (!location.value) {
    return null;
  }
  if (location.value.googleMapsUrl) {
    return location.value.googleMapsUrl;
  }
  if (location.value.address) {
    return `https://maps.google.com/?q=${encodeMapsQueryPart(location.value.name)},+${encodeMapsQueryPart(location.value.address)}`;
  }
  return null;
});

const actions = computed<HeadingMenuItem[]>(() => [{
  label: "Edit",
  icon: "tabler:map-pin-cog",
  to: { name: "dashboard-locations-slug-edit", params: { slug: route.params.slug } },
}, {
  label: "Add log",
  icon: "tabler:calendar-plus",
  to: { name: "dashboard-locations-slug-add", params: { slug: route.params.slug } },
}, {
  label: "Delete",
  icon: "tabler:map-pin-x",
  danger: true,
  onClick: () => isOpen.value = true,
}]);

const addressCopied = ref(false);
let addressCopiedTimeout: ReturnType<typeof setTimeout> | undefined;

async function copyAddress() {
  if (!location.value?.address) {
    return;
  }

  await navigator.clipboard.writeText(location.value.address);
  addressCopied.value = true;
  clearTimeout(addressCopiedTimeout);
  addressCopiedTimeout = setTimeout(() => addressCopied.value = false, 2000);
}

async function confirmDelete() {
  try {
    isOpen.value = false;
    deleteError.value = "";
    isDeleting.value = true;

    await outboxStore.mutate({
      kind: "location:delete",
      method: "DELETE",
      url: `/api/locations/${route.params.slug}`,
      label: `Delete location “${location.value?.name}”`,
      target: { slug: String(route.params.slug) },
    });

    await navigateTo("/dashboard/locations");
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = getFetchErrorMessage(error);
  }

  isDeleting.value = false;
}

useSeoMeta({
  title: () => location.value?.name ?? "Location",
  description: () => location.value?.description || `Your visits to ${location.value?.name ?? "this location"}.`,
});
</script>

<template>
  <div class="p-4">
    <AppBreadcrumbs v-if="route.name === 'dashboard-locations-slug'" />
    <div v-if="loading">
      <div class="loading" />
    </div>
    <AppAlert
      v-if="errorMessage && !loading"
      class="alert-error"
      icon="circle-x-filled"
      :message="errorMessage"
    />
    <div v-if="route.name === 'dashboard-locations-slug' && location && !loading">
      <div v-if="location.coverImageKey" class="relative mb-4">
        <img
          :src="`/api/images/${location.coverImageKey}`"
          :alt="`Cover photo of ${location.name}`"
          class="w-full h-48 object-cover rounded-box"
        >
        <p v-if="location.type" class="badge badge-neutral badge-sm absolute top-2 left-2 shadow-sm">
          {{ location.type.name }}
        </p>
      </div>
      <h1 class="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Icon
          :name="location.type?.icon || DEFAULT_LOCATION_ICON"
          size="28"
          class="shrink-0"
          :class="getPointColors('location', true).text"
        />
        {{ location.name }}
        <PendingBadge :record="location" />
      </h1>
      <p v-if="location.type && !location.coverImageKey" class="badge badge-neutral badge-sm mb-4">
        {{ location.type.name }}
      </p>
      <EntityActions :items="actions" kind="location" />
      <div class="divider" />
      <p class="text-sm mb-4">
        {{ location.description }}
      </p>
      <div v-if="location.address || googleMapsHref" class="flex flex-col gap-1 mb-4">
        <div
          v-if="location.address"
          class="tooltip tooltip-bottom w-full"
          :data-tip="addressCopied ? 'Copied!' : 'Copy address'"
        >
          <button
            type="button"
            class="flex items-center gap-2 w-full text-left text-sm rounded-box px-2 py-1 hover:bg-base-100 cursor-pointer transition-colors"
            @click="copyAddress"
          >
            <Icon
              name="tabler:map-pin"
              size="24"
              class="shrink-0"
            />
            {{ location.address }}
          </button>
        </div>
        <div
          v-if="googleMapsHref"
          class="tooltip tooltip-bottom w-full"
          data-tip="View in Google Maps"
        >
          <a
            class="flex items-center gap-2 w-full text-sm rounded-box px-2 py-1 hover:bg-base-100 transition-colors"
            :href="googleMapsHref"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon
              name="tabler:brand-google-maps"
              size="24"
              class="shrink-0"
            />
            View on Google Maps
            <Icon
              name="tabler:external-link"
              size="14"
              class="opacity-60"
            />
          </a>
        </div>
      </div>
      <div class="divider" />
      <p v-if="!location.logs.length" class="text-sm italic">
        Add a location log to get started.
      </p>
    </div>
    <div v-if="route.name === 'dashboard-locations-slug' && !loading && location?.logs.length" class="flex flex-col flex-nowrap gap-4 align-items-stretch">
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="text-xl font-semibold flex-1">
          {{ location.logs.length }} {{ location.logs.length === 1 ? "visit" : "visits" }}
        </h2>
        <SortToggle v-model="sortOrder" />
      </div>
      <MapPointCard
        v-for="log in sortedLogs"
        :key="log.id"
        :map-point="createMapPointFromLocationLog(log, location)"
      >
        <template #top>
          <p class="text-xs opacity-50">
            {{ formatDateRange(log.startedAt, log.endedAt, true) }}
          </p>
        </template>
      </MapPointCard>
    </div>
    <div v-if="route.name !== 'dashboard-locations-slug'">
      <NuxtPage />
    </div>
    <AppDialog
      title="Are you sure?"
      description="Deleting this location will also delete all of the associated logs. This cannot be undone. Do you really want to do this?"
      confirm-label="Yes, delete this location."
      confirm-class="btn-error"
      :is-open="isOpen"
      @on-closed="isOpen = false"
      @on-confirmed="confirmDelete"
    />
  </div>
</template>
