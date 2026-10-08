<script lang="ts" setup>
const isOnline = useOnline();
</script>

<template>
  <div
    v-if="!isOnline"
    role="status"
    class="bg-warning text-warning-content text-sm px-4 py-1 flex items-center justify-center gap-2"
  >
    <Icon name="tabler:wifi-off" size="16" />
    <span>You're offline. Showing what was last saved on this device.</span>
  </div>
</template>
