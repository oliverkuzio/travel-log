<script lang="ts" setup>
const authStore = useAuthStore();
const mapStore = useMapStore();

// The map store outlives the dashboard, so clear any points it left behind.
mapStore.reset();

useSeoMeta({
  description: "Keep track of your travels and adventures. Add locations, photos and notes to create a digital journal of your experiences.",
});
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="fixed inset-0">
      <AppMap :zoom="1.5" :controls="false" />
    </div>
    <div class="hero bg-base-100/90 flex-1 relative">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <img
            src="/logo.png"
            alt=""
            class="mx-auto mb-4 size-32"
          >
          <h1 class="text-5xl font-bold">
            Travel Log
          </h1>
          <p class="py-6">
            Keep track of your travels and adventures. Add locations, photos and notes to create a digital journal of your experiences.
          </p>
          <AuthButton v-if="!authStore.user" />
          <NuxtLink
            v-else
            to="/dashboard"
            class="btn btn-primary"
          >
            Go to Dashboard
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
