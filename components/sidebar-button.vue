<script lang="ts" setup>
import type { SidebarItem } from "~/lib/types";

const props = defineProps<{
  item: SidebarItem;
}>();

const { isActive } = useNavItems();
</script>

<template>
  <div class="tooltip tooltip-right w-full" :data-tip="props.item.label">
    <NuxtLink
      :to="props.item.href"
      :class="{ 'bg-base-200': isActive(props.item) }"
      class="flex w-full justify-center p-2 py-5 hover:bg-base-200/60 hover:cursor-pointer transition-colors"
    >
      <Icon
        :name="props.item.icon"
        size="24"
        :class="props.item.iconColor"
      />
    </NuxtLink>
  </div>
</template>
