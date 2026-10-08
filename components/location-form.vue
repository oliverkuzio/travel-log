<script lang="ts" setup>
import { z } from "zod";

import type { CoverImageChange } from "~/lib/types";

import { CENTER_MAP } from "~/lib/constants";
import { InsertLocation } from "~/lib/db/schema";

const props = defineProps<{
  initialValues?: InsertLocation & { coverImageKey?: string | null };
  onSubmit: (location: InsertLocation, coverImage?: CoverImageChange) => Promise<any>;
  onSubmitComplete: () => void;
  submitLabel: string;
  submitIcon: string;
  zoom?: number;
}>();

const values = props.initialValues || {
  name: "",
  description: "",
  address: null,
  googleMapsUrl: null,
  typeId: null,
  long: (CENTER_MAP as [number, number])[0],
  lat: (CENTER_MAP as [number, number])[1],
};

// The cover photo is part of the form so changing it marks the form dirty, but it's sent separately.
const schema = InsertLocation.extend({
  coverImage: z.custom<CoverImageChange>().optional(),
});

function onSubmit({ coverImage, ...location }: z.infer<typeof schema>) {
  return props.onSubmit(location, coverImage);
}

const { locationTypes } = storeToRefs(useLocationTypesStore());

const typeOptions = computed(() => locationTypes.value?.map(type => ({
  value: type.id,
  label: type.name,
})) ?? []);

function findTypeIcon(typeId: unknown) {
  return locationTypes.value?.find(type => type.id === typeId)?.icon;
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
    <AppFormField
      label="Address (optional)"
      name="address"
      :error="errors.address"
      :disabled="loading"
    />
    <AppFormField
      label="Google Maps URL (optional)"
      name="googleMapsUrl"
      :error="errors.googleMapsUrl"
      :disabled="loading"
    />
    <AppSelectFormField
      label="Type (optional)"
      name="typeId"
      empty-label="No type"
      :options="typeOptions"
      :error="errors.typeId"
      :disabled="loading"
    >
      <template #prefix="{ value }">
        <Icon
          :name="findTypeIcon(value) || DEFAULT_LOCATION_ICON"
          size="24"
          class="shrink-0"
          :class="getPointColors('location').text"
        />
      </template>
    </AppSelectFormField>
    <CoordPicker
      :initial-values="values"
      :errors="errors"
      :loading="loading"
      :zoom="props.zoom || 6"
      :get-icon="formValues => findTypeIcon(formValues.typeId)"
    />
  </BaseForm>
</template>
