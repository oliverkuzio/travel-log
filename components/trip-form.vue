<script lang="ts" setup>
import { CENTER_MAP } from "~/lib/constants";
import { InsertTrip } from "~/lib/db/schema";

import CoordPicker from "./coord-picker.vue";

const props = defineProps<{
  initialValues?: InsertTrip;
  onSubmit: (location: InsertTrip) => Promise<any>;
  onSubmitComplete: () => void;
  submitLabel: string;
  submitIcon: string;
  zoom?: number;
}>();

const initialValues = {
  name: "",
  description: "",
  startedAt: Date.now() - (24 * 60 * 60 * 1000),
  endedAt: Date.now(),
  long: (CENTER_MAP as [number, number])[0],
  lat: (CENTER_MAP as [number, number])[1],
};
</script>

<template>
  <BaseForm
    v-slot="{ errors, loading }"
    :initial-values="props.initialValues || initialValues"
    :schema="InsertTrip"
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
    <AppDateFormField
      label="Started At"
      name="startedAt"
      :value="initialValues.startedAt"
      :error="errors.startedAt"
      :disabled="loading"
    />
    <AppDateFormField
      label="Ended At"
      name="endedAt"
      :value="initialValues.endedAt"
      :error="errors.endedAt"
      :disabled="loading"
    />
    <CoordPicker
      :initial-values="initialValues"
      :errors="errors"
      :loading="loading"
      :zoom="14"
    />
  </BaseForm>
</template>
