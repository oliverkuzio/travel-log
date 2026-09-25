<script lang="ts" setup>
import type { SelectOption } from "~/lib/types";

const props = defineProps<{
  name: string;
  label: string;
  options: SelectOption[];
  emptyLabel?: string;
  error?: string;
  disabled?: boolean;
}>();

const { value, handleChange, handleBlur } = useField<number | null | undefined>(() => props.name);

function onChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  handleChange(target.value === "" ? null : Number(target.value));
}
</script>

<template>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">
      {{ props.label }}
    </legend>
    <div class="flex items-center gap-2">
      <slot name="prefix" :value="value" />
      <select
        class="select w-full"
        :class="{ 'select-error': props.error }"
        :name="props.name"
        :disabled="props.disabled"
        :value="value ?? ''"
        @change="onChange"
        @blur="handleBlur"
      >
        <option v-if="props.emptyLabel !== undefined" value="">
          {{ props.emptyLabel }}
        </option>
        <option
          v-for="option in props.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
    <p v-if="props.error" class="validator-hint visible text-error">
      {{ props.error }}
    </p>
  </fieldset>
</template>
