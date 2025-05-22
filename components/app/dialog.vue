<script lang="ts" setup>
const props = defineProps<{
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass: "btn-primary" | "btn-secondary" | "btn-accent" | "btn-warning" | "btn-error";
}>();

const emit = defineEmits<{
  onClosed: [];
  onConfirmed: [];
}>();

const dialog = useTemplateRef("dialog");

function onClose() {
  emit("onClosed");
}

onMounted(() => {
  dialog.value?.addEventListener("close", onClose);
});

onUnmounted(() => {
  dialog.value?.removeEventListener("close", onClose);
});
</script>

<template>
  <dialog
    ref="dialog"
    class="modal"
    :open="props.isOpen"
  >
    <div class="modal-box">
      <h3 class="text-lg font-semibold">
        {{ title }}
      </h3>
      <p class="py-4">
        {{ description }}
      </p>
      <div class="flex justify-end gap-4">
        <button class="btn btn-outline" @click="onClose">
          Cancel
        </button>
        <button
          class="btn"
          :class="confirmClass"
          @click="emit('onConfirmed')"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>Cancel</button>
    </form>
  </dialog>
</template>
