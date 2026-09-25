<script lang="ts" setup>
import type { PointColors } from "~/utils/map-points";

const props = withDefaults(defineProps<{
  colors: PointColors;
  icon?: string | null;
  size?: number;
}>(), {
  size: 32,
});

// Matches the circular head of tabler:map-pin-filled, which is centred at (12, 11) in a 24 unit viewbox.
const badgeSize = computed(() => Math.round(props.size * 0.6));
const badgeTop = computed(() => Math.round(props.size * (11 / 24) - badgeSize.value / 2));
const iconSize = computed(() => Math.round(props.size * 0.4));
</script>

<template>
  <div class="relative" :style="{ width: `${size}px`, height: `${size}px` }">
    <Icon
      name="tabler:map-pin-filled"
      :size="`${size}`"
      :class="colors.text"
    />
    <span
      v-if="icon"
      class="absolute left-1/2 -translate-x-1/2 rounded-full flex items-center justify-center"
      :class="[colors.bg, colors.content]"
      :style="{ top: `${badgeTop}px`, width: `${badgeSize}px`, height: `${badgeSize}px` }"
    >
      <Icon :name="icon" :size="`${iconSize}`" />
    </span>
  </div>
</template>
