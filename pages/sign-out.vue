<script lang="ts" setup>
const authStore = useAuthStore();

onMounted(() => {
  authStore.signOut();
});
</script>

<template>
  <div class="card bg-base-200 container mt-4 min-h-62 text-center mx-auto flex flex-col justify-center items-center hap-4">
    <span class="loading loading-spinner loading-xl" />
  </div>
</template>
