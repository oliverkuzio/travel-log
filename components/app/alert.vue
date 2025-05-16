<script setup lang="ts">
const props = defineProps<{
  type: "default" | "info" | "success" | "warning" | "error";
  message?: string;
  hideIcon?: boolean;
}>();

const icons = {
  default: "info-circle-filled",
  info: "info-circle-filled",
  success: "circle-check-filled",
  warning: "alert",
  error: "circle-x-filled",
};

const alertClass = `alert-${props.type}`;
const alertIcon = icons[props.type];
</script>

<template>
  <div
    role="alert"
    class="alert my-6"
    :class="alertClass"
  >
    <Icon
      v-if="!hideIcon"
      :name="`tabler:${alertIcon}`"
      size="24"
    />
    <span>{{ props.message ?? 'An unknown error occurred.' }}</span>
  </div>
</template>
