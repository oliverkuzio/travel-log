<script lang="ts" setup>
const props = defineProps<{
  label: string;
  icon: string;
  href: string;
  showLabel: boolean;
  iconColor?: string;
  // Also treat nested routes (e.g. /dashboard/trips/my-trip for /dashboard/trips) as active.
  matchPrefix?: boolean;
}>();

const route = useRoute();

const isActive = computed(() => {
  return route.path === props.href
    || (props.matchPrefix && route.path.startsWith(`${props.href}/`));
});
</script>

<template>
  <div>
    <div
      class="tooltip-right"
      :data-tip="showLabel ? undefined : props.label"
      :class="{ tooltip: !showLabel }"
    >
      <NuxtLink
        :to="props.href"
        :class="{ 'bg-base-200': isActive, 'justify-center': !showLabel, 'justify-start': showLabel }"
        class="flex gap-2 p-2 text-sm hover:bg-base-200/60 hover:cursor-pointer flex-nowrap transition-colors"
      >
        <Icon
          :name="props.icon"
          size="24"
          :class="iconColor"
        />
        <Transition name="grow">
          <span v-if="showLabel" class="truncate">{{ props.label }}</span>
        </Transition>
      </NuxtLink>
    </div>
    <!-- <div v-if="showDivider" class="divider" /> -->
  </div>
</template>

<style scoped>
.grow-enter-active {
  animation: grow 0.2s;
}
.grow-leave-active {
  animation: grow 0.2s reverse;
}
@keyframes grow {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
</style>
