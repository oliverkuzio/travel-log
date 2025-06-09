<script lang="ts" setup>
// TODO: Fix asyncFetch error when starting app from this route
import type { FetchError } from "ofetch";

const route = useRoute();
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

onMounted(() => {
  locationStore.refreshLocations();
  locationStore.refreshCurrentLocation();
});

function openDialog() {
  isOpen.value = true;
  (document.activeElement as HTMLAnchorElement).blur();
}

async function confirmDelete() {
  try {
    isOpen.value = false;
    deleteError.value = "";
    isDeleting.value = true;
    await $fetch(`/api/locations/${route.params.slug}`, {
      method: "DELETE",
    });
    navigateTo("/dashboard");
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = getFetchErrorMessage(error);
  }
  isDeleting.value = false;
}

onBeforeRouteUpdate((to) => {
  if (to.name === "dashboard-locations-slug") {
    locationStore.refreshCurrentLocation();
  }
});
</script>

<template>
  <div class="p-4">
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
      <h1 class="text-2xl font-semibold mb-4 flex items-start gap-4">
        {{ location.name }}
        <div class="dropdown dropdown-bottom dropdown-end">
          <div
            tabindex="0"
            role="button"
            class="btn m-1 btn-sm btn-ghost p-0"
          >
            <Icon name="tabler:dots-vertical" size="20" />
          </div>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm font-normal">
            <li>
              <NuxtLink
                :to="{
                  name: 'dashboard-locations-slug-edit',
                  params: { slug: route.params.slug },
                }"
              >
                <Icon name="tabler:map-pin-cog" size="20" />
                Edit Location
              </NuxtLink>
            </li>
            <li class="text-error">
              <NuxtLink @click="openDialog">
                <Icon name="tabler:map-pin-x" size="20" />
                Delete Location
              </NuxtLink>
            </li>
          </ul>
        </div>
      </h1>
      <p class="text-sm mb-4">
        {{ location.description }}
      </p>
      <div v-if="!location.locationLogs.length" class="flex flex-col gap-4">
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
    <div v-if="route.name === 'dashboard-locations-slug' && !loading && location?.locationLogs.length" class="flex flex-col flex-nowrap gap-4 align-items-stretch">
      <LocationCard
        v-for="log in location.locationLogs"
        :key="log.id"
        :map-point="createMapPointFromLocationLog(log)"
      >
        <template #top>
          <p class="text-sm italic text-gray-500">
            {{ formatDate(log.startedAt) }}
            <span v-if="log.startedAt !== log.endedAt">
              -
              {{ formatDate(log.endedAt) }}
            </span>
          </p>
        </template>
      </LocationCard>
    </div>
    <div v-if="route.name !== 'dashboard-locations-slug'">
      <NuxtPage />
    </div>
    <AppDialog
      title="Are you sure?"
      description="Deleting this location will also delete all of the associated logs. This cannot be undone. Do you really want to do this?"
      confirm-label="Yes, delete this location!"
      confirm-class="btn-error"
      :is-open="isOpen"
      @on-closed="isOpen = false"
      @on-confirmed="confirmDelete"
    />
  </div>
</template>
