<script lang="ts" setup>
import type { CoverImageChange } from "~/lib/types";

const props = defineProps<{
  currentKey?: string | null;
  disabled?: boolean;
}>();

const { value, setValue } = useField<CoverImageChange | undefined>("coverImage");
const imageInput = useTemplateRef("imageInput");

const previewUrl = ref<string | null>(null);
const isResizing = ref(false);
const resizeError = ref("");

const src = computed(() => {
  if (value.value === "remove") {
    return null;
  }

  return previewUrl.value ?? (props.currentKey ? `/api/images/${props.currentKey}` : null);
});

function setPreview(blob: Blob | null) {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }

  previewUrl.value = blob ? URL.createObjectURL(blob) : null;
}

async function selectImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];

  if (!file) {
    return;
  }

  isResizing.value = true;
  resizeError.value = "";

  try {
    const resized = await resizeImage(file);
    setPreview(resized);
    setValue(resized);
  }
  catch {
    resizeError.value = "That file could not be read as an image.";
  }

  isResizing.value = false;
}

function removeImage() {
  setPreview(null);
  setValue(props.currentKey ? "remove" : undefined);

  if (imageInput.value) {
    imageInput.value.value = "";
  }
}

onBeforeUnmount(() => setPreview(null));
</script>

<template>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">
      Cover photo (optional)
    </legend>
    <div class="bg-base-300 h-48 w-full flex justify-center items-center relative rounded-sm overflow-hidden">
      <img
        v-if="src"
        :src
        alt="Cover photo preview"
        class="size-full object-cover"
      >
      <p v-else class="text-sm opacity-60">
        No cover photo
      </p>
      <div v-if="isResizing" class="absolute inset-0 flex justify-center items-center bg-black/50">
        <div class="loading loading-lg" />
      </div>
    </div>
    <div class="flex gap-2">
      <input
        ref="imageInput"
        type="file"
        accept="image/*"
        class="file-input grow"
        :disabled="props.disabled || isResizing"
        @change="selectImage"
      >
      <button
        v-if="src"
        type="button"
        class="btn btn-outline btn-error"
        :disabled="props.disabled || isResizing"
        @click="removeImage"
      >
        Remove
        <Icon name="tabler:photo-x" size="20" />
      </button>
    </div>
    <p v-if="resizeError" class="validator-hint visible text-error">
      {{ resizeError }}
    </p>
  </fieldset>
</template>
