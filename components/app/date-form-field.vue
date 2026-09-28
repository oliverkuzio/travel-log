<script lang="ts" setup>
const props = defineProps<{
  name: string;
  label: string;
  value: number;
  error?: string;
  disabled?: boolean;
  // Include the time of day, using a datetime-local input.
  withTime?: boolean;
}>();

const { handleBlur, value: inputValue, handleChange } = useField<number>(props.name, {
  initialValue: props.value,
});

function formatDateISO(value: number) {
  return new Date(value).toISOString().split("T")[0];
}

// datetime-local values are in the user's local time zone, so format with local (not UTC) parts.
function formatDateTimeLocal(value: number) {
  return `${toDateInputValue(value)}T${formatTime(value)}`;
}

function dateChanged(event: Event) {
  const target = event.target as HTMLInputElement;

  handleChange(new Date(target.value).getTime());
}
</script>

<template>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">
      {{ props.label }}
    </legend>
    <input
      :class="{
        'input-error': props.error,
      }"
      class="input w-full"
      :name="props.name"
      :type="props.withTime ? 'datetime-local' : 'date'"
      :disabled="disabled"
      :value="props.withTime ? formatDateTimeLocal(inputValue) : formatDateISO(inputValue)"
      @blur="handleBlur"
      @change="dateChanged"
    >
    <p v-if="props.error" class="validator-hint visible text-error">
      {{ props.error }}
    </p>
  </fieldset>
</template>
