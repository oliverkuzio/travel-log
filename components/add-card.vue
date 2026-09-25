<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router";

import type { MapPointKind } from "~/lib/types";

const props = defineProps<{
  label: string;
  icon: string;
  to: RouteLocationRaw;
  kind: MapPointKind;
  compact?: boolean;
}>();

const colors = computed(() => getPointColors(props.kind));
</script>

<template>
  <NuxtLink
    class="card card-sm border-2 border-dashed bg-base-100/50 shrink-0 hover:bg-base-100 hover:cursor-pointer transition-colors"
    :class="colors.border"
    :to="props.to"
  >
    <div class="card-body flex-row items-center gap-2" :class="{ 'py-2 px-3': compact }">
      <Icon
        :name="props.icon"
        :size="compact ? '18' : '22'"
        :class="colors.text"
      />
      <span :class="compact ? 'text-sm font-medium' : 'text-lg'">{{ props.label }}</span>
    </div>
  </NuxtLink>
</template>
