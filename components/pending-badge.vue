<script lang="ts" setup>
import { isPendingRecord } from "~/lib/outbox-overlay";

const props = defineProps<{
  // Any record from the API, possibly with changes made offline.
  record?: unknown;
  pending?: boolean;
}>();
</script>

<template>
  <span
    v-if="props.pending || isPendingRecord(props.record)"
    class="badge badge-warning badge-xs shrink-0 font-normal"
    title="Saved on this device. It will be synced when you're back online."
  >
    <Icon name="tabler:cloud-upload" size="12" />
    Not synced
  </span>
</template>
