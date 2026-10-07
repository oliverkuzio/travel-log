<script lang="ts" setup>
import type { SelectLocationLogImage } from "~/lib/db/schema";

defineProps<{
  images: SelectLocationLogImage[];
  expandable?: boolean;
}>();

const emit = defineEmits<{
  select: [index: number];
}>();

useRuntimeConfig();
</script>

<template>
  <div class="flex flex-col mt-2 gap-2 overflow-auto">
    <div
      v-for="(image, index) in images"
      :key="image.id"
      class="card card-compact h-auto w-full shrink-0 flex items-center justify-center bg-base-300"
    >
      <div class="card-body p-2 size-full">
        <button
          v-if="expandable"
          type="button"
          class="size-full cursor-zoom-in"
          :aria-label="`View image ${index + 1} in gallery`"
          @click="emit('select', index)"
        >
          <img class="size-full object-cover rounded-sm" :src="`/api/images/${image.key}`">
        </button>
        <img
          v-else
          class="size-full object-cover rounded-sm"
          :src="`/api/images/${image.key}`"
        >
        <slot :image />
      </div>
    </div>
  </div>
</template>
