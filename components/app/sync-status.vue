<script lang="ts" setup>
const outboxStore = useOutboxStore();
const { entries, syncing, failedCount, needsSignIn } = storeToRefs(outboxStore);

const hasProblem = computed(() => failedCount.value > 0 || needsSignIn.value);
const title = computed(() => {
  if (needsSignIn.value) {
    return "Sign in again to sync your changes";
  }

  if (failedCount.value) {
    return `${failedCount.value} change(s) couldn't be synced`;
  }

  return syncing.value ? "Syncing your changes…" : `${entries.value.length} change(s) waiting to sync`;
});
</script>

<template>
  <NuxtLink
    v-if="entries.length"
    to="/dashboard/sync"
    class="btn btn-ghost btn-sm gap-1"
    :class="{ 'text-error': hasProblem }"
    :title="title"
    :aria-label="title"
  >
    <span v-if="syncing" class="loading loading-spinner loading-xs" />
    <Icon
      v-else
      :name="hasProblem ? 'tabler:cloud-x' : 'tabler:cloud-upload'"
      size="20"
    />
    <span class="badge badge-sm" :class="hasProblem ? 'badge-error' : 'badge-warning'">
      {{ entries.length }}
    </span>
  </NuxtLink>
</template>
