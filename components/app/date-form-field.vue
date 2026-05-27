<script lang="ts" setup>
const props = defineProps<{
  name: string;
  label: string;
  value: number;
  error?: string;
  disabled?: boolean;
}>();

const { handleBlur, value: inputValue, handleChange } = useField<number>(props.name, {
  initialValue: props.value,
});

function formatDateISO(value: number) {
  return new Date(value).toISOString().split("T")[0];
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
      type="date"
      :disabled="disabled"
      :value="formatDateISO(inputValue)"
      @blur="handleBlur"
      @change="dateChanged"
    >
    <p v-if="props.error" class="validator-hint visible text-error">
      {{ props.error }}
    </p>
  </fieldset>
</template>
