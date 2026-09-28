<script lang="ts" setup>
import type { FetchError } from "ofetch";

import type { HeadingMenuItem } from "~/lib/types";

const route = useRoute();
const { formatDateRange } = useDateFormat();
const locationStore = useLocationsStore();
const {
  currentLocation: location,
  currentLocationError: error,
  currentLocationStatus: status,
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

const menuItems = computed<HeadingMenuItem[]>(() => [{
  label: "Edit Location",
  icon: "tabler:map-pin-cog",
  to: { name: "dashboard-locations-slug-edit", params: { slug: route.params.slug } },
}, {
  label: "Add Log",
  icon: "tabler:calendar-plus",
  to: { name: "dashboard-locations-slug-add", params: { slug: route.params.slug } },
}, {
  label: "Delete Location",
  icon: "tabler:map-pin-x",
  danger: true,
  onClick: () => isOpen.value = true,
}]);

async function confirmDelete() {
  try {
    isOpen.value = false;
    deleteError.value = "";
    isDeleting.value = true;

    await $fetch(`/api/locations/${route.params.slug}`, {
      method: "DELETE",
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
    <BackLink
      v-if="route.name === 'dashboard-locations-slug'"
      to="/dashboard/locations"
      label="Locations"
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
    <div v-if="route.name === 'dashboard-locations-slug' && location && !loading">
      <PageHeadingMenu :title="location.name" :items="menuItems">
        <template #icon>
          <Icon
            :name="location.type?.icon || DEFAULT_LOCATION_ICON"
            size="28"
            class="shrink-0 mt-1"
            :class="getPointColors('location', true).text"
          />
        </template>
      </PageHeadingMenu>
      <p v-if="location.type" class="badge badge-neutral badge-sm mb-2">
        {{ location.type.name }}
      </p>
      <p class="text-sm mb-4">
        {{ location.description }}
      </p>
      <p v-if="location.address" class="flex items-center gap-1 text-sm mb-4">
        <Icon
          name="tabler:map-pin"
          size="16"
          class="shrink-0"
        />
        {{ location.address }}
      </p>
      <a
        v-if="googleMapsHref"
        class="btn btn-outline btn-sm mb-4"
        :href="googleMapsHref"
        target="_blank"
        rel="noopener noreferrer"
      >
        View on Google Maps
        <Icon name="tabler:external-link" size="20" />
      </a>
      <div v-if="!location.logs.length" class="flex flex-col gap-4">
        <p class="text-sm italic">
          Add a location log to get started.
        </p>
        <NuxtLink
          class="btn btn-primary"
          :to="{
            name: 'dashboard-locations-slug-add',
            params: { slug: route.params.slug },
          }"
        >
          Add Location Log
          <Icon name="tabler:calendar-plus" size="24" />
        </NuxtLink>
      </div>
    </div>
    <div v-if="route.name === 'dashboard-locations-slug' && !loading && location?.logs.length" class="flex flex-col flex-nowrap gap-4 align-items-stretch">
      <MapPointCard
        v-for="log in location.logs"
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
