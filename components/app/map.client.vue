<script setup lang="ts">
const colorMode = useColorMode();
const style = computed(() => `/styles/${colorMode.value}.json`);
const center = [0, 0];
const zoom = 2;
</script>

<template>
  <MglMap
    :map-style="style"
    :center="center"
    :zoom="zoom"
  >
    <MglNavigationControl />
  </MglMap>
</template>
