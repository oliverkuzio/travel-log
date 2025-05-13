<script setup lang="ts">
import { CENTER_MAP } from "~/lib/constants";

const mapStore = useMapStore();
const colorMode = useColorMode();
const style = computed(() => `/styles/${colorMode.value}.json`);
const zoom = 3;

onMounted(() => {
  mapStore.init();
});
</script>

<template>
  <MglMap
    :map-style="style"
    :center="CENTER_MAP"
    :zoom="zoom"
  >
    <MglNavigationControl />
    <MglMarker
      v-for="point in mapStore.mapPoints"
      :key="point.id"
      :coordinates="[point.long, point.lat]"
    >
      <template #marker>
        <div class="tooltip tooltip-top hover:cursor-pointer" :data-tip="point.label">
          <Icon
            name="tabler:map-pin-filled"
            size="32"
            class="text-secondary"
          />
        </div>
      </template>
    </MglMarker>
  </MglMap>
</template>
