<script lang="ts" setup>
import type { ZodSchema } from "zod";

import { InsertLocationLog, InsertTripLocationLog } from "~/lib/db/schema";

type LocationLogFormValues = InsertLocationLog & {
  locationId?: number;
};

const props = defineProps<{
  initialValues?: LocationLogFormValues;
  onSubmit: (log: LocationLogFormValues) => Promise<any>;
  onSubmitComplete: () => void;
  submitLabel: string;
  submitIcon: string;
  // Pick which location the log is for (used when adding a log from a trip).
  selectLocation?: boolean;
  // Pick which trip the log belongs to (used when adding or editing a log from a location).
  selectTrip?: boolean;
}>();

const values = props.initialValues || {
  name: "",
  description: "",
  startedAt: Date.now() - (24 * 60 * 60 * 1000),
  endedAt: Date.now(),
};

const schema: ZodSchema = props.selectLocation ? InsertTripLocationLog : InsertLocationLog;

const { locations } = storeToRefs(useLocationsStore());
const { trips } = storeToRefs(useTripsStore());

const locationOptions = computed(() => locations.value?.map(location => ({
  value: location.id,
  label: location.name,
})) ?? []);

const tripOptions = computed(() => trips.value?.map(trip => ({
  value: trip.id,
  label: trip.name,
})) ?? []);
</script>

<template>
  <BaseForm
    v-slot="{ errors, loading }"
    :initial-values="values"
    :schema
    :on-submit
    :on-submit-complete
    :submit-label
    :submit-icon
  >
    <AppSelectFormField
      v-if="selectLocation"
      label="Location"
      name="locationId"
      empty-label="Select a location…"
      :options="locationOptions"
      :error="(errors as Record<string, string | undefined>).locationId"
      :disabled="loading"
    />
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
      :value="values.startedAt"
      :error="errors.startedAt"
      :disabled="loading"
    />
    <AppDateFormField
      label="Ended At"
      name="endedAt"
      :value="values.endedAt"
      :error="errors.endedAt"
      :disabled="loading"
    />
    <AppSelectFormField
      v-if="selectTrip"
      label="Trip"
      name="tripId"
      empty-label="Not part of a trip"
      :options="tripOptions"
      :error="errors.tripId"
      :disabled="loading"
    />
  </BaseForm>
</template>
