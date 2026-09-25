<script lang="ts" setup>
import type { HeadingMenuItem } from "~/lib/types";

const props = defineProps<{
  title: string;
  items: HeadingMenuItem[];
}>();

function onItemClick(item: HeadingMenuItem) {
  // Blur the menu so the daisyUI dropdown closes.
  (document.activeElement as HTMLElement | null)?.blur();
  item.onClick?.();
}
</script>

<template>
  <h1 class="text-2xl font-semibold mb-4 flex items-start gap-4">
    <slot name="icon" />
    <span class="flex-1">{{ props.title }}</span>
    <div class="dropdown dropdown-bottom dropdown-end">
      <div
        tabindex="0"
        role="button"
        class="btn m-1 btn-sm btn-accent p-0"
        aria-label="Actions"
      >
        <Icon name="tabler:dots-vertical" size="20" />
      </div>
      <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm font-normal text-base">
        <li
          v-for="item in props.items"
          :key="item.label"
          :class="{ 'text-error': item.danger }"
        >
          <NuxtLink :to="item.to" @click="onItemClick(item)">
            <Icon :name="item.icon" size="20" />
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </h1>
</template>
