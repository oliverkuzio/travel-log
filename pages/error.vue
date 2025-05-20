<script lang="ts" setup>
const route = useRoute();
const error = route.query.error?.toString() || "An unknown error occurred. Please try again later.";
</script>

<template>
  <div class="card bg-base-300 container mt-4 min-h-62 text-center mx-auto flex flex-col justify-center items-center hap-4">
    <AppAlert type="error" :message="error" />
    <NuxtLink to="/" class="btn btn-primary mt-4">
      <Icon name="tabler:arrow-left" size="24" />
      Go back to home
    </NuxtLink>
  </div>
</template>
