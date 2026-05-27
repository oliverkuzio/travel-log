<script lang="ts" setup>
import type { SelectLocationLogImage } from "~/lib/db/schema";

defineProps<{
  images: SelectLocationLogImage[];
}>();

useRuntimeConfig();
</script>

<template>
  <div class="flex flex-col mt-2 gap-2 overflow-auto">
    <div
      v-for="image in images"
      :key="image.id"
      class="card card-compact h-48 w-64 shrink-0 flex items-center justify-center bg-base-300"
    >
      <div class="card-body p-2 size-full">
        <img class="size-full object-cover rounded-sm" :src="`${$config.public.s3BucketUrl}/${image.key}`">
        <slot :image />
      </div>
    </div>
  </div>
</template>
