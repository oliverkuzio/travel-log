<script lang="ts" setup>
const authStore = useAuthStore();
</script>

<template>
  <div class="hero bg-base-200 min-h-screen">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">
          Travel Log
        </h1>
        <p class="py-6">
          Keep track of your travels and adventures. Add locations, photos and notes to create a digital journal of your experiences.
        </p>
        <AuthButton v-if="!authStore.user" />
        <NuxtLink
          v-else
          to="/app"
          class="btn btn-primary"
        >
          Go to Dashboard
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
