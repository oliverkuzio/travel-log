<script lang="ts" setup>
import { CENTER_MAP } from "~/lib/constants";
import { InsertLocation } from "~/lib/db/schema";

const props = defineProps<{
  initialValues?: InsertLocation;
  onSubmit: (location: InsertLocation) => Promise<any>;
  onSubmitComplete: () => void;
  submitLabel: string;
  submitIcon: string;
  zoom?: number;
}>();
</script>

<template>
  <LocationBaseForm
    v-slot="{ errors, loading }"
    :zoom="props.zoom || 6"
    :initial-values="props.initialValues || {
      name: '',
      description: '',
      long: (CENTER_MAP as [number, number])[0],
      lat: (CENTER_MAP as [number, number])[1],
    }"
    :schema="InsertLocation"
    :on-submit
    :on-submit-complete
    :submit-label
    :submit-icon
  >
    <AppFormField
      label="Name"
      name="name"
      :error="errors.name"
      :disabled="loading"
    />
    <AppFormField
      type="textarea"
      label="Description"
      name="description"
      :error="errors.description"
      :disabled="loading"
    />
  </LocationBaseForm>
</template>
