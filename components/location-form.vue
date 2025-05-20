<script lang="ts" setup>
import type { FetchError } from "ofetch";

import { toTypedSchema } from "@vee-validate/zod";

import type { NominatimResult } from "~/lib/types";

import { CENTER_MAP } from "~/lib/constants";
import { InsertLocation } from "~/lib/db/schema";

const props = defineProps<{
  initialValues?: InsertLocation | null;
  submitLabel: string;
  submitIcon: string;
  onSubmit: (location: InsertLocation) => Promise<any>;
  onSubmitComplete: () => void;
}>();

const router = useRouter();
const mapStore = useMapStore();

const loading = ref(false);
const submitted = ref(false);
const submitError = ref("");

// TODO: Add ability to re-centre map when co-ordinates manually changed
const { handleSubmit, errors, meta, setErrors, setFieldValue } = useForm({
  validationSchema: toTypedSchema(InsertLocation),
  initialValues: {
    name: props.initialValues?.name || "",
    description: props.initialValues?.description || "",
    long: props.initialValues?.long || (CENTER_MAP as [number, number])[0],
    lat: props.initialValues?.lat || (CENTER_MAP as [number, number])[1],
  },
});

const onSubmit = handleSubmit(async (values: InsertLocation) => {
  try {
    submitError.value = "";
    loading.value = true;
    await props.onSubmit(values);
    submitted.value = true;
    props.onSubmitComplete();
  }
  catch (e) {
    const error = e as FetchError;
    if (error.data?.data) {
      setErrors(error.data?.data);
    }
    submitError.value = getFetchErrorMessage(error);
  }
  loading.value = false;
});

function searchResultSelected(result: NominatimResult) {
  setFieldValue("name", result.display_name);
  if (mapStore.addedPoint) {
    mapStore.addedPoint = {
      id: 0,
      name: "New Point",
      description: "",
      long: Number(result.lon),
      lat: Number(result.lat),
      centerMap: true,
    };
  }
}

effect(() => {
  if (mapStore.addedPoint) {
    setFieldValue("long", mapStore.addedPoint.long);
    setFieldValue("lat", mapStore.addedPoint.lat);
  }
});

onMounted(() => {
  mapStore.addedPoint = {
    id: 0,
    name: "New Point",
    description: "",
    long: props.initialValues?.long || (CENTER_MAP as [number, number])[0],
    lat: props.initialValues?.lat || (CENTER_MAP as [number, number])[1],
  };
});

onBeforeRouteLeave(() => {
  if (!submitted.value && meta.value.dirty) {
    // eslint-disable-next-line no-alert
    const confirm = window.confirm("Are you sure want to leave? All unsaved changes will be lost.");

    if (!confirm) {
      return false;
    }
  }

  mapStore.addedPoint = null;
  return true;
});
</script>

<template>
  <div>
    <AppAlert
      v-if="submitError"
      class="alert-error"
      icon="circle-x-filled"
      :message="submitError"
    />
    <form class="flex flex-col gap-2" @submit.prevent="onSubmit">
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
          label="Latitude"
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
          Drag the
          <Icon
            name="tabler:map-pin-filled"
            size="12"
            class="text-accent"
          />
          marker on the map,
        </li>
        <li>
          Double-click the map, or
        </li>
        <li>
          Search for a location below.
        </li>
      </ul>

      <div class="flex justify-end gap-2">
        <button
          :disabled="loading"
          type="reset"
          class="btn btn-outline btn-error"
          @click="router.back()"
        >
          <Icon name="tabler:arrow-left" size="24" />
          Cancel
        </button>
        <button
          :disabled="loading"
          type="submit"
          class="btn btn-primary"
        >
          {{ props.submitLabel }}
          <span v-if="loading">
            <LoadingSpinner />
          </span>
          <Icon
            v-else
            :name="props.submitIcon"
            size="24"
          />
        </button>
      </div>
    </form>
    <div class="divider" />
    <PlaceSearch @result-selected="searchResultSelected" />
  </div>
</template>
