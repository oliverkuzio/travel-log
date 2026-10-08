<script lang="ts" setup>
const { $pwa } = useNuxtApp();
const isUpdating = ref(false);

async function reload() {
  isUpdating.value = true;
  await $pwa?.updateServiceWorker(true);
}
</script>

<template>
  <ClientOnly>
    <div
      v-if="$pwa?.needRefresh"
      class="toast toast-center toast-bottom z-40 mb-20 md:mb-0"
    >
      <div role="alert" class="alert alert-info">
        <Icon name="tabler:refresh" size="24" />
        <span>A new version of Travel Log is available.</span>
        <div class="flex gap-2">
          <button class="btn btn-sm btn-ghost" @click="$pwa.cancelPrompt()">
            Later
          </button>
          <button
            class="btn btn-sm"
            :disabled="isUpdating"
            @click="reload"
          >
            <span v-if="isUpdating" class="loading loading-spinner loading-xs" />
            Reload
          </button>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
