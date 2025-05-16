<script setup lang="ts">
import type { FetchError } from "ofetch";

import { toTypedSchema } from "@vee-validate/zod";

import type { NominatimResult } from "~/lib/types";

import { CENTER_MAP } from "~/lib/constants";
import { InsertLocation } from "~/lib/db/schema";

const { $csrfFetch } = useNuxtApp();
const router = useRouter();
const mapStore = useMapStore();

const loading = ref(false);
const submitted = ref(false);
const submitError = ref("");

const { handleSubmit, errors, meta, setErrors, setFieldValue } = useForm({
  validationSchema: toTypedSchema(InsertLocation),
  initialValues: {
    name: "",
    description: "",
    long: (CENTER_MAP as [number, number])[0],
    lat: (CENTER_MAP as [number, number])[1],
  },
});

const onSubmit = handleSubmit(async (values) => {
  try {
    submitError.value = "";
    loading.value = true;

    await $csrfFetch("/api/locations", {
      method: "post",
      body: values,
    });

    submitted.value = true;
    navigateTo("/app");
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
    long: (CENTER_MAP as [number, number])[0],
    lat: (CENTER_MAP as [number, number])[1],
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

  return true;
});
</script>

<template>
  <div class="container max-w-md mx-auto p-4">
    <div class="mb-4">
      <h1 class="text-2xl font-bold mb-6">
        Add Location
      </h1>
      <p class="text-sm my-6">
        A location is a place you have traveled or will travel to. It can be a
        city, country, or any other geographical area. You can add specific
        vists to this location via the location log.
      </p>
    </div>
    <div
      v-if="submitError"
      role="alert"
      class="alert alert-error my-6"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{{ submitError }}</span>
    </div>
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
          class="btn btn-outline"
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
          Add
          <span v-if="loading">
            <LoadingSpinner />
          </span>
          <Icon
            v-else
            name="tabler:circle-plus-filled"
            size="24"
          />
        </button>
      </div>
    </form>

    <div class="divider" />

    <PlaceSearch @result-selected="searchResultSelected" />
  </div>
</template>
