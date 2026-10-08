<script lang="ts" setup>
import type { HeadingMenuItem, MapPointKind } from "~/lib/types";

const props = defineProps<{
  items: HeadingMenuItem[];
  kind?: MapPointKind;
  alignStart?: boolean;
}>();

const NuxtLink = resolveComponent("NuxtLink");
const colors = computed(() => props.kind ? getPointColors(props.kind) : null);
</script>

<template>
  <div class="flex flex-wrap gap-4 mb-4" :class="props.alignStart ? 'justify-start' : 'justify-around'">
    <component
      :is="item.to ? NuxtLink : 'button'"
      v-for="item in props.items"
      :key="item.label"
      :to="item.to"
      :type="item.to ? undefined : 'button'"
      class="group flex flex-col items-center gap-1 w-16 text-center"
      @click="item.onClick?.()"
    >
      <span
        class="btn btn-circle btn-soft"
        :class="item.danger ? 'btn-error' : (colors?.btn ?? 'btn-accent')"
      >
        <Icon :name="item.icon" size="22" />
      </span>
      <span class="text-xs leading-tight" :class="{ 'text-error': item.danger }">
        {{ item.label }}
      </span>
    </component>
  </div>
</template>
