<script lang="ts" setup>
const props = defineProps<{
  names: string[];
  placeholder?: string;
}>();

const filter = defineModel<string>({ required: true });

const MAX_SUGGESTIONS = 8;

const listboxId = useId();
const showSuggestions = ref(false);
const highlightedIndex = ref(-1);

const suggestions = computed(() => {
  const query = filter.value.trim().toLowerCase();

  if (!query) {
    return [];
  }

  const matches = [...new Set(props.names)].filter(name => name.toLowerCase().includes(query) && name.toLowerCase() !== query);

  // Names starting with the query are the most likely completions, so list them first.
  return matches
    .sort((a, b) => Number(!a.toLowerCase().startsWith(query)) - Number(!b.toLowerCase().startsWith(query)))
    .slice(0, MAX_SUGGESTIONS);
});

function onInput() {
  showSuggestions.value = true;
  highlightedIndex.value = -1;
}

function selectSuggestion(name: string) {
  filter.value = name;
  showSuggestions.value = false;
  highlightedIndex.value = -1;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    showSuggestions.value = false;
    return;
  }

  if (!suggestions.value.length) {
    return;
  }

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    showSuggestions.value = true;
    const step = event.key === "ArrowDown" ? 1 : -1;
    const count = suggestions.value.length;
    highlightedIndex.value = (highlightedIndex.value + step + count) % count;
  }
  else if (event.key === "Enter" && showSuggestions.value && highlightedIndex.value >= 0) {
    event.preventDefault();
    selectSuggestion(suggestions.value[highlightedIndex.value]!);
  }
}
</script>

<template>
  <div class="relative">
    <label class="input input-sm w-full">
      <Icon name="tabler:search" />
      <input
        v-model="filter"
        type="search"
        :placeholder="props.placeholder ?? 'Filter by name...'"
        autocomplete="off"
        role="combobox"
        aria-label="Filter by name"
        aria-autocomplete="list"
        :aria-controls="listboxId"
        :aria-expanded="showSuggestions && suggestions.length > 0"
        @input="onInput"
        @focus="showSuggestions = true"
        @blur="showSuggestions = false"
        @keydown="onKeydown"
      >
    </label>
    <ul
      v-if="showSuggestions && suggestions.length"
      :id="listboxId"
      role="listbox"
      class="menu menu-sm absolute z-20 mt-1 w-full bg-base-100 rounded-box border border-base-300 shadow-md"
    >
      <li
        v-for="(suggestion, index) in suggestions"
        :key="suggestion"
        role="option"
        :aria-selected="index === highlightedIndex"
      >
        <!-- mousedown fires before the input's blur, which would otherwise close the list first. -->
        <button
          type="button"
          :class="{ 'menu-active': index === highlightedIndex }"
          @mousedown.prevent="selectSuggestion(suggestion)"
        >
          {{ suggestion }}
        </button>
      </li>
    </ul>
  </div>
</template>
