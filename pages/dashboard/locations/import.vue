<script lang="ts" setup>
import type { FetchError } from "ofetch";

import { MAX_TAKEOUT_FILE_SIZE } from "~/lib/google-takeout";

type UploadResult = {
  staged: number;
  duplicates: number;
  invalid: number;
};

type AcceptResult = {
  added: number;
  skipped: { name: string; reason: string }[];
};

const { $csrfFetch } = useNuxtApp();
const importStore = useLocationImportStore();
const { imports, importsStatus, readyImports, lookupImports, selectedIds } = storeToRefs(importStore);

const fileInput = useTemplateRef("fileInput");
const loading = ref(false);
const errorMessage = ref("");
const uploadResult = ref<UploadResult | null>(null);
const acceptResult = ref<AcceptResult | null>(null);
const reviewing = ref(false);
const expandedLookupId = ref<number | null>(null);

const maxFileSizeMb = MAX_TAKEOUT_FILE_SIZE / 1024 / 1024;

async function run(request: () => Promise<void>) {
  try {
    loading.value = true;
    errorMessage.value = "";
    await request();
  }
  catch (e) {
    errorMessage.value = getFetchErrorMessage(e as FetchError);
  }
  await importStore.refreshImports();
  loading.value = false;
}

function upload() {
  const file = fileInput.value?.files?.[0];

  uploadResult.value = null;
  acceptResult.value = null;

  if (!file) {
    errorMessage.value = "Choose a file to upload.";
    return;
  }

  // The server enforces these too; checking here avoids a pointless upload.
  if (!file.name.toLowerCase().endsWith(".json")) {
    errorMessage.value = "File must be a .json file.";
    return;
  }

  if (file.size > MAX_TAKEOUT_FILE_SIZE) {
    errorMessage.value = `File must be smaller than ${maxFileSizeMb}MB.`;
    return;
  }

  return run(async () => {
    const body = new FormData();
    body.append("file", file);

    uploadResult.value = await $csrfFetch<UploadResult>("/api/location-imports", {
      method: "post",
      body,
    });

    if (fileInput.value) {
      fileInput.value.value = "";
    }
  });
}

function accept(body: { all: true } | { ids: number[] }) {
  uploadResult.value = null;

  return run(async () => {
    acceptResult.value = await $csrfFetch<AcceptResult>("/api/location-imports/accept", {
      method: "post",
      body,
    });
    reviewing.value = false;
  });
}

function toggleSelected(id: number) {
  const selected = new Set(selectedIds.value);

  if (!selected.delete(id)) {
    selected.add(id);
  }

  selectedIds.value = selected;
}

function selectAll(selected: boolean) {
  selectedIds.value = new Set(selected ? readyImports.value.map(item => item.id) : []);
}

function discard() {
  // eslint-disable-next-line no-alert
  if (!window.confirm("Discard all places waiting to be imported?")) {
    return;
  }

  uploadResult.value = null;
  acceptResult.value = null;

  return run(async () => {
    await $csrfFetch("/api/location-imports", { method: "delete" });
  });
}

function lookupDone() {
  expandedLookupId.value = null;
  importStore.refreshImports();
}

useSeoMeta({
  title: "Import from Google Maps",
  description: "Import your saved places from Google Maps using a Google Takeout export.",
});
</script>

<template>
  <div class="p-4">
    <BackLink to="/dashboard/locations" label="Locations" />
    <h1 class="text-2xl font-semibold mb-4">
      Import from Google Maps
    </h1>

    <section class="mb-6">
      <p class="text-sm mb-2">
        Export your saved places from Google Maps using Google Takeout:
      </p>
      <ol class="list-decimal pl-5 text-sm flex flex-col gap-1 mb-4">
        <li>
          Go to
          <a
            href="https://takeout.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="link"
          >takeout.google.com</a>
          and sign in.
        </li>
        <li>Click <strong>Deselect all</strong>, then tick <strong>Maps (your places)</strong>.</li>
        <li>Click <strong>Next step</strong>, choose <strong>Export once</strong> and <strong>.zip</strong>, then <strong>Create export</strong>.</li>
        <li>When Google emails you, download the export and unzip it.</li>
        <li>
          Upload the file at
          <code class="text-xs">Takeout/Maps (your places)/Saved Places.json</code>
          below.
        </li>
      </ol>

      <div class="join w-full">
        <input
          ref="fileInput"
          type="file"
          accept=".json,application/json"
          class="file-input join-item w-full"
          :disabled="loading"
        >
        <button
          class="btn btn-primary join-item"
          :disabled="loading"
          @click="upload"
        >
          Upload
          <Icon name="tabler:upload" size="20" />
        </button>
      </div>
      <p class="text-xs italic mt-1">
        Only the place names, addresses, co-ordinates and Google Maps links are kept. Max {{ maxFileSizeMb }}MB.
      </p>
    </section>

    <AppAlert
      v-if="errorMessage"
      class="alert-error"
      icon="circle-x-filled"
      :message="errorMessage"
    />
    <AppAlert
      v-if="uploadResult"
      class="alert-success"
      icon="circle-check-filled"
      :message="`Found ${uploadResult.staged} new places. ${uploadResult.duplicates} were already added or waiting to be imported${uploadResult.invalid ? `, and ${uploadResult.invalid} couldn't be read` : ''}.`"
    />
    <div v-if="acceptResult">
      <AppAlert
        class="alert-success"
        icon="circle-check-filled"
        :message="`Added ${acceptResult.added} locations.`"
      />
      <div v-if="acceptResult.skipped.length" class="alert alert-warning flex flex-col items-stretch text-left mb-6">
        <span>These places were skipped:</span>
        <ul class="list-disc pl-5 text-sm">
          <li v-for="(skipped, i) in acceptResult.skipped" :key="i">
            {{ skipped.name }}: {{ skipped.reason }}
          </li>
        </ul>
      </div>
    </div>

    <div v-if="importsStatus === 'pending' && !imports" class="flex justify-center">
      <LoadingSpinner />
    </div>

    <section v-if="readyImports.length" class="mb-6">
      <h2 class="text-lg font-semibold mb-2">
        Ready to import ({{ readyImports.length }})
      </h2>
      <p class="text-sm mb-2">
        These places have everything needed to add them as locations.
      </p>
      <div v-if="!reviewing" class="flex gap-2 justify-end">
        <button
          class="btn btn-outline"
          :disabled="loading"
          @click="reviewing = true"
        >
          Review
          <Icon name="tabler:list-check" size="20" />
        </button>
        <button
          class="btn btn-primary"
          :disabled="loading"
          @click="accept({ all: true })"
        >
          Import all
          <Icon name="tabler:map-pin-plus" size="20" />
        </button>
      </div>
      <template v-else>
        <div class="flex gap-2 text-sm mb-2">
          <button class="link" @click="selectAll(true)">
            Select all
          </button>
          <button class="link" @click="selectAll(false)">
            Select none
          </button>
          <span class="ml-auto">{{ selectedIds.size }} selected</span>
        </div>
        <ul class="list bg-base-100 rounded-box max-h-96 overflow-y-auto mb-2">
          <li
            v-for="item in readyImports"
            :key="item.id"
            class="list-row items-center py-2"
          >
            <input
              :id="`import-${item.id}`"
              type="checkbox"
              class="checkbox checkbox-sm"
              :checked="selectedIds.has(item.id)"
              :disabled="loading"
              @change="toggleSelected(item.id)"
            >
            <div class="list-col-grow flex flex-col items-start gap-1">
              <label :for="`import-${item.id}`" class="cursor-pointer">
                <div class="text-sm">{{ item.name }}</div>
                <div v-if="item.address" class="text-xs opacity-60">{{ item.address }}</div>
              </label>
              <a
                :href="item.googleMapsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="link link-hover text-xs flex items-center gap-1"
              >
                <Icon name="tabler:brand-google-maps" size="14" />
                View in Google Maps
              </a>
            </div>
          </li>
        </ul>
        <div class="flex gap-2 justify-end">
          <button
            class="btn btn-outline"
            :disabled="loading"
            @click="reviewing = false"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary"
            :disabled="loading || !selectedIds.size"
            @click="accept({ ids: [...selectedIds] })"
          >
            Import selected
            <LoadingSpinner v-if="loading" />
            <Icon
              v-else
              name="tabler:map-pin-plus"
              size="20"
            />
          </button>
        </div>
      </template>
    </section>

    <section v-if="lookupImports.length" class="mb-6">
      <h2 class="text-lg font-semibold mb-2">
        Needs a location ({{ lookupImports.length }})
      </h2>
      <p class="text-sm mb-2">
        Google either didn't include co-ordinates for these places, or it has
        the co-ordinates but not the place name.
      </p>
      <p class="text-sm mb-4">
        Look each one up to choose where
        the location is, what the location is called, or skip it. You can come back
        to these later.
      </p>
      <ul class="flex flex-col gap-2">
        <LocationImportLookup
          v-for="item in lookupImports"
          :key="item.id"
          :item
          :expanded="expandedLookupId === item.id"
          @toggle="expandedLookupId = expandedLookupId === item.id ? null : item.id"
          @done="lookupDone"
        />
      </ul>
    </section>

    <div v-if="imports?.length" class="flex justify-end">
      <button
        class="btn btn-sm btn-outline btn-error"
        :disabled="loading"
        @click="discard"
      >
        Discard import
        <Icon name="tabler:trash" size="16" />
      </button>
    </div>
  </div>
</template>
