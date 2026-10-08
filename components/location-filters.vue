<script lang="ts" setup>
const locationsStore = useLocationsStore();
const { locations, nameFilter, typeIdsFilter, locationTypesInUse } = storeToRefs(locationsStore);

const locationNames = computed(() => locations.value?.map(location => location.name) ?? []);

const selectedTypes = computed(() => locationTypesInUse.value.filter(type => typeIdsFilter.value.includes(type.id)));
const availableTypes = computed(() => locationTypesInUse.value.filter(type => !typeIdsFilter.value.includes(type.id)));

function addType(event: Event) {
  const target = event.target as HTMLSelectElement;

  if (target.value) {
    typeIdsFilter.value = [...typeIdsFilter.value, Number(target.value)];
  }

  target.value = "";
}

function removeType(id: number) {
  typeIdsFilter.value = typeIdsFilter.value.filter(typeId => typeId !== id);
}

function clearFilters() {
  nameFilter.value = "";
  typeIdsFilter.value = [];
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <NameFilter
        v-model="nameFilter"
        :names="locationNames"
        class="flex-2 min-w-0"
      />
      <select
        v-if="locationTypesInUse.length"
        class="select select-sm flex-1 min-w-0"
        aria-label="Filter by type"
        :disabled="!availableTypes.length"
        @change="addType"
      >
        <option value="">
          {{ availableTypes.length ? "Filter by type..." : "All types selected" }}
        </option>
        <option
          v-for="type in availableTypes"
          :key="type.id"
          :value="type.id"
        >
          {{ type.name }}
        </option>
      </select>
    </div>
    <div v-if="selectedTypes.length" class="flex flex-wrap items-center gap-1">
      <span
        v-for="type in selectedTypes"
        :key="type.id"
        class="badge badge-sm badge-primary gap-1 pr-1"
      >
        <Icon :name="type.icon" size="12" />
        {{ type.name }}
        <button
          type="button"
          class="btn btn-ghost btn-circle btn-xs size-4 min-h-0"
          :aria-label="`Remove ${type.name} filter`"
          @click="removeType(type.id)"
        >
          <Icon name="tabler:x" size="12" />
        </button>
      </span>
    </div>
    <button
      v-if="nameFilter || typeIdsFilter.length"
      type="button"
      class="btn btn-link btn-xs self-end px-0"
      @click="clearFilters"
    >
      Clear filters
    </button>
  </div>
</template>
