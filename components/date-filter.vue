<script lang="ts" setup>
const props = defineProps<{
  // Local YYYY-MM-DD keys, in display order.
  dates: string[];
}>();

// An empty string means all dates.
const selected = defineModel<string>({ required: true });

const { formatDate } = useDateFormat();
</script>

<template>
  <label class="select select-ghost select-xs w-auto">
    <Icon name="tabler:calendar" size="16" />
    <select v-model="selected" aria-label="Filter by date">
      <option value="">
        All dates
      </option>
      <option
        v-for="date in props.dates"
        :key="date"
        :value="date"
      >
        {{ formatDate(dateKeyToTimestamp(date)) }}
      </option>
    </select>
  </label>
</template>
