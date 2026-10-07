<script lang="ts" setup>
import type { SortOrder } from "~/lib/types";

const order = defineModel<SortOrder>({ required: true });

function toggle() {
  order.value = order.value === "asc" ? "desc" : "asc";
}
</script>

<template>
  <button
    type="button"
    class="btn btn-ghost btn-xs self-end gap-1"
    :aria-label="order === 'asc' ? 'Sorted oldest first, switch to newest first' : 'Sorted newest first, switch to oldest first'"
    @click="toggle"
  >
    <Icon :name="order === 'asc' ? 'tabler:sort-ascending' : 'tabler:sort-descending'" size="16" />
    {{ order === "asc" ? "Oldest first" : "Newest first" }}
  </button>
</template>
