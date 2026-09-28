<script lang="ts" setup>
import type { FetchError } from "ofetch";

import type { SelectLocationImport } from "~/lib/db/schema";
import type { NominatimResult } from "~/lib/types";

import { splitTakeoutQuery } from "~/lib/google-takeout";

const props = defineProps<{
  item: SelectLocationImport;
  expanded: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
  done: [];
}>();

const { $csrfFetch } = useNuxtApp();

const query = props.item.query ?? "";
const split = splitTakeoutQuery(query);
const name = ref(split.name);
const loading = ref(false);
const errorMessage = ref("");

async function run(request: () => Promise<unknown>) {
  try {
    loading.value = true;
    errorMessage.value = "";
    await request();
    emit("done");
  }
  catch (e) {
    errorMessage.value = getFetchErrorMessage(e as FetchError);
  }
  loading.value = false;
}

function resultSelected(result: NominatimResult) {
  // Prefer the address from Google's query; fall back to the rest of Nominatim's display name.
  const commaIndex = result.display_name.indexOf(",");
  const address = split.address
    ?? (commaIndex === -1 ? null : result.display_name.slice(commaIndex + 1).trim() || null);

  return run(() => $csrfFetch(`/api/location-imports/${props.item.id}/resolve`, {
    method: "post",
    body: {
      name: name.value.trim(),
      address,
      lat: Number(result.lat),
      long: Number(result.lon),
    },
  }));
}

function skip() {
  return run(() => $csrfFetch(`/api/location-imports/${props.item.id}`, {
    method: "delete",
  }));
}
</script>

<template>
  <li class="card card-sm bg-base-100">
    <div class="card-body gap-2">
      <p class="text-sm break-words">
        {{ query }}
      </p>
      <a
        :href="item.googleMapsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="link link-hover text-sm flex items-center gap-1 self-start mb-4"
      >
        <Icon name="tabler:brand-google-maps" size="16" />
        View in Google Maps
      </a>
      <div class="flex gap-2 justify-end">
        <button
          class="btn btn-sm btn-outline btn-error"
          :disabled="loading"
          @click="skip"
        >
          Skip
          <Icon name="tabler:x" size="16" />
        </button>
        <button
          class="btn btn-sm"
          :class="expanded ? 'btn-neutral' : 'btn-accent'"
          :disabled="loading"
          @click="emit('toggle')"
        >
          {{ expanded ? "Close" : "Look up" }}
          <Icon :name="expanded ? 'tabler:chevron-up' : 'tabler:search'" size="16" />
        </button>
      </div>
      <AppAlert
        v-if="errorMessage"
        class="alert-error"
        icon="circle-x-filled"
        :message="errorMessage"
      />
      <template v-if="expanded">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">
            Name
          </legend>
          <input
            v-model="name"
            class="input w-full"
            maxlength="100"
            :disabled="loading"
          >
        </fieldset>
        <div v-if="loading" class="flex justify-center p-2">
          <LoadingSpinner />
        </div>
        <PlaceSearch
          v-else
          :initial-query="query"
          @result-selected="resultSelected"
        />
      </template>
    </div>
  </li>
</template>
