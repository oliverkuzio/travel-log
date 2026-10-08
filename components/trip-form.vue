<script lang="ts" setup>
import { z } from "zod";

import type { InsertTrip } from "~/lib/db/schema";
import type { CoverImageChange } from "~/lib/types";

import { InsertTripFields } from "~/lib/db/schema";
import { refineDates } from "~/lib/zod-schemas";

const props = defineProps<{
  initialValues?: InsertTrip & { coverImageKey?: string | null };
  onSubmit: (trip: InsertTrip, coverImage?: CoverImageChange) => Promise<any>;
  onSubmitComplete: () => void;
  submitLabel: string;
  submitIcon: string;
}>();

const values = props.initialValues || {
  name: "",
  description: "",
  startedAt: Date.now() - (24 * 60 * 60 * 1000),
  endedAt: Date.now(),
};

// The cover photo is part of the form so changing it marks the form dirty, but it's sent separately.
const schema = InsertTripFields.extend({
  coverImage: z.custom<CoverImageChange>().optional(),
}).superRefine(refineDates);

function onSubmit({ coverImage, ...trip }: z.infer<typeof schema>) {
  return props.onSubmit(trip, coverImage);
}
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
    <AppFormField
      label="Name"
      name="name"
      :error="errors.name"
      :disabled="loading"
    />
    <AppFormField
      type="textarea"
      label="Description (optional)"
      name="description"
      :error="errors.description"
      :disabled="loading"
    />
    <CoverImageField
      :current-key="values.coverImageKey"
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
  </BaseForm>
</template>
