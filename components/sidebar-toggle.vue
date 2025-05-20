<script lang="ts" setup>
const props = defineProps<{
  showLabels: boolean;

  // TODO: Replace 'any' with a proper type for the handleToggle function
  handleToggle: any;
}>();
</script>

<template>
  <div
    class="tooltip-right"
    :data-tip="props.showLabels ? undefined : 'Expand'"
    :class="{ tooltip: !props.showLabels }"
  >
    <div
      class="flex p-4 hover:cursor-pointer hover:bg-base-300"
      :class="{ ' justify-end': props.showLabels, ' justify-center': !props.showLabels }"
      @click="props.handleToggle"
    >
      <Icon
        v-if="props.showLabels"
        name="tabler:chevron-left"
        size="24"
      />
      <Icon
        v-else
        name="tabler:chevron-right"
        size="24"
      />
    </div>
  </div>
</template>
