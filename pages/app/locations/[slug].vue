<script setup lang="ts">
const route = useRoute();
const mapStore = useMapStore();

const { slug } = route.params;
const { data: location, status, error } = await useFetch(`/api/locations/${slug}`, {
  lazy: true,
});

effect(() => {
  if (location.value) {
    mapStore.mapPoints = [location.value];
  }
});
</script>

<template>
  <div class="p-4 min-h-64">
    <div v-if="status === 'pending'">
      <div class="loading" />
    </div>
    <div v-if="error">
      <h2 class="text-2xl">
        Error
      </h2>
      <AppAlert type="error" :message="error.statusMessage" />
    </div>
    <div v-if="location && status !== 'pending'">
      <h2 class="text-2xl">
        {{ location?.name }}
      </h2>
      <p class="text-sm">
        {{ location.description }}
      </p>
    </div>
  </div>
</template>
