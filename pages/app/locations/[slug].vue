<script lang="ts" setup>
import type { FetchError } from "ofetch";

const route = useRoute();
const locationsStore = useLocationsStore();
const {
  currentLocation: location,
  currentLocationError: error,
  currentLocationStatus: status,
} = storeToRefs(locationsStore);

const isOpen = ref(false);
const deleteError = ref("");
const isDeleting = ref(false);

const loading = computed(() => status.value === "pending" || isDeleting.value);
const errorMessage = computed(() => error.value?.statusMessage || deleteError.value);

onMounted(() => {
  locationsStore.refreshCurrentLocation();
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

    navigateTo("/app");
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = getFetchErrorMessage(error);
  }
  isDeleting.value = false;
}

onBeforeRouteUpdate((to) => {
  if (to.name === "app-locations-slug") {
    locationsStore.refreshCurrentLocation();
  }
});
</script>

<template>
  <div class="p-4 min-h-64">
    <div v-if="loading">
      <div class="loading" />
    </div>
    <div v-if="errorMessage && !loading">
      <h2 class="text-2xl">
        Error
      </h2>
      <AppAlert
        class="alert-error"
        icon="circle-x-filled"
        :message="errorMessage"
      />
    </div>
    <div v-if="route.name === 'app-locations-slug' && location && !loading">
      <h2 class="text-2xl">
        {{ location.name }}
        <div class="dropdown dropdown-botton">
          <button class="btn btn-sm p-0">
            <Icon name="tabler:dots-vertical" size="24" />
          </button>
          <ul tabindex="0" class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
            <li>
              <NuxtLink
                :to="{
                  name: 'app-locations-slug-edit',
                  params: { slug: route.params.slug },
                }"
              >
                <Icon name="tabler:map-pin-cog" size="24" />
                Edit Location
              </NuxtLink>
            </li>
            <li class="text-error">
              <NuxtLink @click="openDialog">
                <Icon name="tabler:map-pin-x" size="24" />
                Delete Location
              </NuxtLink>
            </li>
          </ul>
        </div>
      </h2>
      <p class="text-sm">
        {{ location.description }}
      </p>
      <div v-if="!location.locationLogs.length">
        <p class="text-sm mt-4">
          Add a location log to get started.
        </p>
      </div>
      <NuxtLink to="/app/locations/add" class="btn btn-primary mt-4">
        Add Location Log
        <Icon name="tabler:map-pin-plus" size="24" />
      </NuxtLink>
    </div>
    <div v-if="route.name !== 'app-locations-slug'">
      <NuxtPage />
    </div>
    <AppDialog
      title="Are you sure?"
      description="Deleting this location will also delete all of the associated logs. This cannot be undone. Do you really want to do this?"
      confirm-label="Yes, delete this location"
      confirm-class="btn-error"
      :is-open="isOpen"
      @on-closed="isOpen = false"
      @on-confirmed="confirmDelete"
    />
  </div>
</template>
