<script lang="ts" setup>
import type { FetchError } from "ofetch";

import type { SelectLocationType } from "~/lib/db/schema";
import type { HeadingMenuItem } from "~/lib/types";

definePageMeta({
  middleware: "admin",
});

const locationTypesStore = useLocationTypesStore();
const { locationTypes, filteredLocationTypes, nameFilter, locationTypesStatus: status } = storeToRefs(locationTypesStore);
const { $csrfFetch } = useNuxtApp();

const locationTypeNames = computed(() => locationTypes.value?.map(locationType => locationType.name) ?? []);

const actions: HeadingMenuItem[] = [{
  label: "Add type",
  icon: "tabler:category-plus",
  to: "/dashboard/types/add",
}];

const deleting = ref<SelectLocationType | null>(null);
const deleteError = ref("");

async function confirmDelete() {
  if (!deleting.value) {
    return;
  }

  try {
    deleteError.value = "";
    await $csrfFetch(`/api/types/${deleting.value.slug}`, {
      method: "DELETE",
    });
    await locationTypesStore.refreshLocationTypes();
  }
  catch (e) {
    deleteError.value = getFetchErrorMessage(e as FetchError);
  }

  deleting.value = null;
}

useSeoMeta({
  title: "Location types",
  description: "Manage the types used to categorise locations.",
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-semibold mb-4">
      Location types
    </h1>
    <AppAlert
      v-if="deleteError"
      class="alert-error"
      icon="circle-x-filled"
      :message="deleteError"
    />
    <EntityActions :items="actions" kind="location" />
    <div class="flex flex-col flex-nowrap gap-2">
      <div v-if="status === 'pending' && !locationTypes">
        <LoadingSpinner />
      </div>
      <template v-else-if="locationTypes?.length">
        <NameFilter v-model="nameFilter" :names="locationTypeNames" />
        <p v-if="!filteredLocationTypes?.length" class="text-sm italic">
          No location types match your filter.
        </p>
      </template>
      <div
        v-for="locationType in filteredLocationTypes"
        :key="locationType.id"
        class="card card-sm card-border bg-base-100 border-base-300"
      >
        <div class="card-body py-2 px-3 flex-row items-center gap-2">
          <Icon
            :name="locationType.icon"
            size="20"
            class="shrink-0"
            :class="getPointColors('location').text"
          />
          <span class="flex-1 text-sm font-medium truncate">{{ locationType.name }}</span>
          <NuxtLink
            :to="{ name: 'dashboard-types-slug-edit', params: { slug: locationType.slug } }"
            class="btn btn-ghost btn-xs"
            aria-label="Edit"
          >
            <Icon name="tabler:pencil" size="16" />
          </NuxtLink>
          <button
            class="btn btn-ghost btn-xs text-error"
            aria-label="Delete"
            @click="deleting = locationType"
          >
            <Icon name="tabler:trash" size="16" />
          </button>
        </div>
      </div>
    </div>
    <AppDialog
      title="Are you sure?"
      :description="`Deleting '${deleting?.name}' will remove it from every location that uses it. This cannot be undone.`"
      confirm-label="Yes, delete this type."
      confirm-class="btn-error"
      :is-open="!!deleting"
      @on-closed="deleting = null"
      @on-confirmed="confirmDelete"
    />
  </div>
</template>
