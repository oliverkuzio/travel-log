<script lang="ts" setup>
import type { FetchError } from "ofetch";

import type { NominatimResult } from "~/lib/types";

import { SearchSchema } from "~/lib/zod-schemas";

const emit = defineEmits<{
  resultSelected: [result: NominatimResult];
}>();

const form = useTemplateRef("form");
const searchResults = ref<NominatimResult[]>([]);
const loading = ref(false);
const submitted = ref(false);
const errorMessage = ref("");

async function onSubmit(query: Record<string, string>) {
  try {
    searchResults.value = [];
    loading.value = true;
    submitted.value = true;
    errorMessage.value = "";
    const results = await $fetch("/api/search", {
      query,
    });

    searchResults.value = results;
  }
  catch (e) {
    const error = e as FetchError;
    errorMessage.value = getFetchErrorMessage(error);
  }

  loading.value = false;
};

function setLocation(result: NominatimResult) {
  emit("resultSelected", result);
  searchResults.value = [];
  loading.value = true;
  submitted.value = true;
  errorMessage.value = "";

  if (form.value) {
    form.value.resetForm();
  }
}
</script>

<template>
  <div>
    <div class="text-xs italic flex justify-end gap-1 mb-2">
      <span>Search results provided by</span><a
        class="link"
        href="https://nominatim.openstreetmap.org/ui/search.html"
        target="_blank"
        rel="noopener nofollow"
      >Nominatim</a>
    </div>
    <Form
      ref="form"
      v-slot="{ errors }"
      class="join flex w-full"
      :initial-values="{ q: '' }"
      :validation-schema="toTypedSchema(SearchSchema)"
      @submit="onSubmit"
    >
      <div class="grow-1">
        <label
          class="input join-item w-full"
          :class="{
            'input-error': errors.q,
          }"
        >
          <Icon name="tabler:search" />
          <Field
            type="text"
            name="q"
            :disabled="loading"
            placeholder="Search for a location..."
          />
        </label>
        <p v-if="errors.q" class="validator-hint visible text-error">
          {{ errors.q }}
        </p>
      </div>
      <button class="btn btn-neutral join-item" :disabled="loading">
        Search
      </button>
    </Form>
    <AppAlert
      v-if="!loading && errorMessage"
      class="alert-error"
      icon="circle-x-filled"
      :message="errorMessage"
    />
    <AppAlert
      v-if="!loading && submitted && !searchResults.length"
      class="alert-info"
      icon="info-circle-filled"
      message="No locations matched your search."
    />
    <ul v-if="!loading && searchResults.length > 0" class="list bg-base-200 rounded-b shadow-md overflow-auto max-h-72">
      <li
        v-for="result in searchResults"
        :key="result.place_id"
        class="list-row items-center"
      >
        <div class="list-col-grow">
          <h4>
            {{ result.display_name }}
          </h4>
        </div>
        <div class="w-32">
          <button class="btn btn-sm btn-accent" @click="setLocation(result)">
            Set location
            <Icon name="tabler:map-pin-share" size="20" />
          </button>
        </div>
      </li>
    </ul>
    <div v-if="loading" class="flex justify-center p-4">
      <div class="loading loading-lg" />
    </div>
  </div>
</template>
