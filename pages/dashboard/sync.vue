<script lang="ts" setup>
import type { OutboxEntry } from "~/lib/outbox";

const authStore = useAuthStore();
const outboxStore = useOutboxStore();
const { entries, syncing, failedCount, needsSignIn } = storeToRefs(outboxStore);
const isOnline = useOnline();
const { formatDateRange } = useDateFormat();

const discarding = ref<OutboxEntry | null>(null);
const discardDependents = computed(() => discarding.value ? outboxStore.dependentsOf(discarding.value) : []);
const discardDescription = computed(() => {
  const dependents = discardDependents.value.length;

  return dependents
    ? `This change will be lost, along with ${dependents} later change(s) that depend on it. Do you really want to do this?`
    : "This change will be lost. Do you really want to do this?";
});

onMounted(() => outboxStore.ready());

async function confirmDiscard() {
  if (discarding.value) {
    await outboxStore.discard(discarding.value);
  }

  discarding.value = null;
}

useSeoMeta({
  title: "Unsynced changes",
  description: "Changes saved on this device that haven't reached the server yet.",
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-semibold mb-4">
      Unsynced changes
    </h1>
    <ClientOnly>
      <p v-if="!entries.length" class="text-sm italic">
        Everything is synced.
      </p>
      <template v-else>
        <AppAlert
          v-if="needsSignIn"
          class="alert-warning"
          icon="alert-triangle-filled"
          message="Your session has expired. Sign in again to sync these changes."
        />
        <AppAlert
          v-else-if="!isOnline"
          class="alert-info"
          icon="info-circle-filled"
          message="You're offline. These changes will sync when you're back online."
        />
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-if="needsSignIn"
            class="btn btn-sm btn-primary"
            @click="authStore.signIn()"
          >
            <Icon name="tabler:brand-github" size="18" />
            Sign in
          </button>
          <button
            v-else
            class="btn btn-sm btn-primary"
            :disabled="!isOnline || syncing"
            @click="outboxStore.sync()"
          >
            <span v-if="syncing" class="loading loading-spinner loading-xs" />
            <Icon
              v-else
              name="tabler:refresh"
              size="18"
            />
            Sync now
          </button>
          <button
            v-if="failedCount"
            class="btn btn-sm btn-outline"
            :disabled="!isOnline || syncing"
            @click="outboxStore.retryFailed()"
          >
            <Icon name="tabler:reload" size="18" />
            Retry failed
          </button>
        </div>
        <p class="text-sm mb-2">
          Changes sync in the order they were made.
        </p>
        <ul class="list bg-base-200 rounded-box">
          <li
            v-for="entry in entries"
            :key="entry.id"
            class="list-row items-center"
          >
            <Icon
              :name="entry.status === 'failed' ? 'tabler:cloud-x' : 'tabler:cloud-upload'"
              size="22"
              :class="entry.status === 'failed' ? 'text-error' : 'text-warning'"
            />
            <div>
              <p>{{ entry.label }}</p>
              <p class="text-xs opacity-70">
                {{ formatDateRange(entry.createdAt, entry.createdAt, true) }}
              </p>
              <p v-if="entry.error" class="text-xs text-error">
                {{ entry.error }}
              </p>
            </div>
            <button
              class="btn btn-sm btn-ghost text-error"
              :disabled="syncing"
              @click="discarding = entry"
            >
              Discard
            </button>
          </li>
        </ul>
      </template>
    </ClientOnly>
    <AppDialog
      title="Discard this change?"
      :description="discardDescription"
      confirm-label="Yes, discard it."
      confirm-class="btn-error"
      :is-open="!!discarding"
      @on-closed="discarding = null"
      @on-confirmed="confirmDiscard"
    />
  </div>
</template>
