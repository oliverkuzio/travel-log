<script lang="ts" setup>
import type { FetchError } from "ofetch";

import type { HeadingMenuItem } from "~/lib/types";

const route = useRoute();
const { formatDateRange } = useDateFormat();
const tripsStore = useTripsStore();
const {
  currentTrip: trip,
  currentTripError: error,
  currentTripStatus: status,
  currentTripLogsSortOrder: sortOrder,
  currentTripLogsDateFilter: dateFilter,
  currentTripLogDates: logDates,
  filteredCurrentTripLogs: filteredLogs,
} = storeToRefs(tripsStore);

const isOpen = ref(false);
const deleteError = ref("");
const isDeleting = ref(false);

const loading = computed(() => status.value === "pending" || isDeleting.value);
const errorMessage = computed(() => error.value?.statusMessage || deleteError.value);
const locationCount = computed(() => trip.value ? getTripLocations(trip.value).length : 0);

const menuItems = computed<HeadingMenuItem[]>(() => [{
  label: "Edit Trip",
  icon: "tabler:map-cog",
  to: { name: "dashboard-trips-slug-edit", params: { slug: route.params.slug } },
}, {
  label: "Add Log",
  icon: "tabler:calendar-plus",
  to: { name: "dashboard-trips-slug-add", params: { slug: route.params.slug } },
}, {
  label: "Delete Trip",
  icon: "tabler:map-x",
  danger: true,
  onClick: () => isOpen.value = true,
}]);

async function confirmDelete() {
  try {
    isOpen.value = false;
    deleteError.value = "";
    isDeleting.value = true;

    await $fetch(`/api/trips/${route.params.slug}`, {
      method: "DELETE",
    });

    await navigateTo("/dashboard/trips");
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = getFetchErrorMessage(error);
  }

  isDeleting.value = false;
}

useSeoMeta({
  title: () => trip.value?.name ?? "Trip",
  description: () => trip.value?.description || `The places you visited on ${trip.value?.name ?? "this trip"}.`,
});
</script>

<template>
  <div class="p-4">
    <BackLink
      v-if="route.name === 'dashboard-trips-slug'"
      to="/dashboard/trips"
      label="Trips"
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
    <div v-if="route.name === 'dashboard-trips-slug' && trip && !loading">
      <p class="text-xs opacity-50">
        {{ formatDateRange(trip.startedAt, trip.endedAt) }}
      </p>
      <PageHeadingMenu :title="trip.name" :items="menuItems">
        <template #icon>
          <Icon
            :name="TRIP_ICON"
            size="28"
            class="text-secondary shrink-0 mt-1"
          />
        </template>
      </PageHeadingMenu>
      <p v-if="trip.description" class="text-sm mb-4">
        {{ trip.description }}
      </p>
      <p class="text-xs opacity-70 mb-4">
        {{ trip.logs.length }} {{ trip.logs.length === 1 ? "log" : "logs" }} across
        {{ locationCount }} {{ locationCount === 1 ? "location" : "locations" }}
      </p>
      <div class="flex flex-col flex-nowrap gap-4 align-items-stretch">
        <AddCard
          label="Add log"
          icon="tabler:calendar-plus"
          :to="{ name: 'dashboard-trips-slug-add', params: { slug: route.params.slug } }"
          kind="trip"
        />
        <div v-if="trip.logs.length" class="flex flex-wrap items-center justify-end gap-2">
          <DateFilter v-model="dateFilter" :dates="logDates" />
          <SortToggle v-model="sortOrder" />
        </div>
        <MapPointCard
          v-for="log in filteredLogs"
          :key="log.id"
          :map-point="createMapPointFromLocationLog(log, log.location)"
        >
          <template #top>
            <p class="text-xs opacity-50">
              {{ formatDateRange(log.startedAt, log.endedAt, true) }}
              · {{ log.location.name }}
            </p>
          </template>
        </MapPointCard>
      </div>
    </div>
    <div v-if="route.name !== 'dashboard-trips-slug'">
      <NuxtPage />
    </div>
    <AppDialog
      title="Are you sure?"
      description="Deleting this trip cannot be undone. Its location logs will be kept, but will no longer be part of a trip. Do you really want to do this?"
      confirm-label="Yes, delete this trip."
      confirm-class="btn-error"
      :is-open="isOpen"
      @on-closed="isOpen = false"
      @on-confirmed="confirmDelete"
    />
  </div>
</template>
