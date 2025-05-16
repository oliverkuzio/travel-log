<script setup lang="ts">
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

    <div
      v-if="!loading && errorMessage"
      role="alert"
      class="alert alert-error"
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
      <span>{{ errorMessage }}</span>
    </div>

    <div
      v-if="!loading && submitted && !searchResults.length"
      role="alert"
      class="alert"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="stroke-info h-6 w-6 shrink-0"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>No locations matched your search.</span>
    </div>

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
