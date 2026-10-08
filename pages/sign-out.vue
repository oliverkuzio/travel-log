<script lang="ts" setup>
const authStore = useAuthStore();
const outboxStore = useOutboxStore();

onMounted(async () => {
  await outboxStore.ready();

  // eslint-disable-next-line no-alert
  if (outboxStore.entries.length && !window.confirm(
    `You have ${outboxStore.entries.length} change(s) that haven't been synced yet. Signing out will discard them. Sign out anyway?`,
  )) {
    return navigateTo("/dashboard/sync", { replace: true });
  }

  authStore.signOut();
});

useSeoMeta({
  title: "Sign out",
  description: "Signing you out of Travel Log.",
});
</script>

<template>
  <div class="card bg-base-200 container mt-4 min-h-62 text-center mx-auto flex flex-col justify-center items-center hap-4">
    <span class="loading loading-spinner loading-xl" />
  </div>
</template>
