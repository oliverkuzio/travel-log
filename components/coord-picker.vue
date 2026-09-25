<script lang="ts" setup generic="T extends LatLongItem">
import type { LatLongItem, NominatimResult } from "~/lib/types";

import { CENTER_MAP } from "~/lib/constants";

const props = defineProps<{
  initialValues: T;
  errors: Record<string, string | undefined>;
  loading: boolean;
  zoom: number;
  // Resolves the icon to overlay on the draggable pin from the current form values.
  getIcon?: (values: Record<string, unknown>) => string | null | undefined;
}>();

// TODO: Add ability to re-centre map when co-ordinates manually changed
const { setFieldValue, errors, values } = useFormContext();
const mapStore = useMapStore();

function searchResultSelected(result: NominatimResult) {
  setFieldValue("name", result.display_name);

  if (mapStore.addedPoint) {
    mapStore.addedPoint = {
      id: 0,
      kind: "location",
      name: result.display_name,
      description: "",
      long: Number(result.lon),
      lat: Number(result.lat),
      centerMap: true,
    };
  }
}

effect(() => {
  if (mapStore.addedPoint && props.getIcon) {
    mapStore.addedPoint.icon = props.getIcon(values);
  }
});

effect(() => {
  if (mapStore.addedPoint) {
    setFieldValue("long", mapStore.addedPoint.long);
    setFieldValue("lat", mapStore.addedPoint.lat);
  }
});

onMounted(() => {
  mapStore.addedPoint = {
    id: 0,
    kind: "location",
    name: "New Point",
    description: "",
    long: props.initialValues.long || (CENTER_MAP as [number, number])[0],
    lat: props.initialValues.lat || (CENTER_MAP as [number, number])[1],
    zoom: props.zoom,
  };
});

onBeforeRouteLeave(() => {
  mapStore.addedPoint = null;
});
</script>

<template>
  <div class="flex gap-2">
    <AppFormField
      type="number"
      label="Latitude"
      name="lat"
      :error="errors.lat"
      :disabled="loading"
    />
    <AppFormField
      type="number"
      label="Longitude"
      name="long"
      :error="errors.long"
      :disabled="loading"
    />
  </div>
  <p class="text-sm">
    To set the co-ordinates above:
  </p>
  <ul class="list-disc pl-4 text-sm">
    <li>
      Enter them manually,
    </li>
    <li>
      Drag the
      <Icon
        name="tabler:map-pin-filled"
        size="12"
        :class="getPointColors('location', true).text"
      />
      marker on the map,
    </li>
    <li>
      Double-click the map, or
    </li>
    <li>
      Search for a location below:
    </li>
  </ul>
  <PlaceSearch @result-selected="searchResultSelected" />
</template>
