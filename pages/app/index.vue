<script setup lang="ts">
const locationsStore = useLocationStore();
const mapStore = useMapStore();
const { locations, status } = storeToRefs(locationsStore);

onMounted(() => {
  locationsStore.refresh();
});
</script>

<template>
  <div class="p-4 min-h-64">
    <h2 class="text-2xl">
      Locations
    </h2>
    <div v-if="status === 'pending'">
      <LoadingSpinner />
    </div>
    <div v-if="status !== 'pending' && locations && locations.length > 0" class="flex flex-nowrap mt-4 overflow-x-auto gap-4 align-items-stretch">
      <NuxtLink
        v-for="location in locations"
        :key="location.id"
        :to="{ name: 'app-locations-slug', params: { slug: location.slug } }"
        class="card card-compact bg-base-200 shrink-0 grow-0 border-2 mb-2 basis-[40vw] md:basis-[25vw] lg:basis-[20vw] xl:basis-[15vw] hover:cursor-pointer"
        :class="{
          'border-primary': isPointSelected(location, mapStore.selectedPoint),
          'border-transparent': !isPointSelected(location, mapStore.selectedPoint),
        }"
        @mouseenter="mapStore.selectedPoint = createMapPointFromLocation(location)"
        @mouseleave="mapStore.selectedPoint = null"
      >
        <div class="card-body">
          <h2 class="card-title">
            {{ location.name }}
          </h2>
          <p>
            {{ location.description }}
          </p>
        </div>
      </NuxtLink>
    </div>
    <div v-if="status !== 'pending' && (!locations || locations.length === 0)" class="flex flex-col gap-2">
      <p>Add a location to get started.</p>
      <NuxtLink to="/app/locations/add" class="btn btn-primary w-40">
        Add Location
        <Icon name="tabler:circle-plus-filled" size="24" />
      </NuxtLink>
    </div>
  </div>
</template>
