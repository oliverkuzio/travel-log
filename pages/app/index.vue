<script setup lang="ts">
const { data, status } = await useFetch("/api/locations", {
  lazy: true,
});

const sidebarStore = useSidebarStore();

watchEffect(() => {
  if (data.value) {
    sidebarStore.sidebarItems = data.value.map(location => ({
      id: `location-${location.id}`,
      label: location.name,
      icon: "tabler:map-pin-filled",
      href: `/app/locations/${location.slug}`,
    }));
  }

  sidebarStore.loading = status.value === "pending";
});
</script>

<template>
  <div class="p-4">
    <h2 class="text-2xl">
      Locations
    </h2>
    <div v-if="status === 'pending'">
      <LoadingSpinner />
    </div>
    <div v-else-if="data && data.length > 0" class="grid grid-cols-4 mt-4 gap-4 align-items-stretch">
      <article v-for="location in data" :key="location.id" class="card card-compact bg-base-200 flex-1">
        <div class="card-body">
          <h2 class="card-title">
            {{ location.name }}
          </h2>
          <p>
            {{ location.description }}
          </p>
          <p class="text-sm text-muted">
            <i>{{ location.lat }}, {{ location.long }}</i>
          </p>
        </div>
      </article>
    </div>
    <div v-else class="flex flex-col gap-2">
      <p>Add a location to get started.</p>
      <NuxtLink to="/app/locations/add" class="btn btn-primary w-40">
        Add Location
        <Icon name="tabler:circle-plus-filled" size="24" />
      </NuxtLink>
    </div>
  </div>
</template>
