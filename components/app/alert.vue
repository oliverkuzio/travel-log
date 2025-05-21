<script lang="ts" setup>
const props = defineProps<{
  class?: "alert-info" | "alert-success" | "alert-warning" | "alert-error";
  icon?: "info-circle-filled" | "circle-check-filled" | "alert-triangle-filled" | "circle-x-filled";
  message?: string;
}>();
</script>

<template>
  <div
    role="alert"
    class="alert my-6"
    :class="props.class ?? ''"
  >
    <Icon
      v-if="icon"
      :name="`tabler:${icon}`"
      size="24"
    />
    <span>{{ props.message ?? 'An unknown error occurred.' }}</span>
  </div>
</template>
