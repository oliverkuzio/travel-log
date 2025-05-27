<script lang="ts" setup>
import { CENTER_MAP } from "~/lib/constants";
import { InsertLocationLog } from "~/lib/db/schema";

const props = defineProps<{
  initialValues?: InsertLocationLog;
  onSubmit: (location: InsertLocationLog) => Promise<any>;
  onSubmitComplete: () => void;
  submitLabel: string;
  submitIcon: string;
}>();
</script>

<template>
  <LocationBaseForm
    v-slot="{ errors, loading }"
    :initial-values="props.initialValues || {
      name: '',
      description: '',
      startedAt: Date.now() - (24 * 60 * 60 * 1000),
      endedAt: Date.now(),
      long: (CENTER_MAP as [number, number])[0],
      lat: (CENTER_MAP as [number, number])[1],
    }"
    :schema="InsertLocationLog"
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
    <AppFormField
      label="Started At"
      name="startedAt"
      :error="errors.startedAt"
      :disabled="loading"
    />
    <AppFormField
      label="Ended At"
      name="endedAt"
      :error="errors.endedAt"
      :disabled="loading"
    />
  </LocationBaseForm>
</template>
