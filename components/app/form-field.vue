<script setup lang="ts">
const props = defineProps<{
  type?: "text" | "textarea" | "number";
  name: string;
  label: string;
  error?: string;
  disabled?: boolean;
}>();
</script>

<template>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">
      {{ props.label }}
    </legend>
    <Field
      :as="props.type && props.type !== 'text' && props.type !== 'number' ? props.type : 'input'"
      class="input w-full"
      :class="{
        'input-error': props.error,
        'input': !props.type || props.type === 'text' || props.type === 'number',
        'textarea': props.type === 'textarea',
      }"
      :name="props.name"
      :type="props.type"
      :disabled="disabled"
    />
    <p v-if="props.error" class="validator-hint visible text-error">
      {{ props.error }}
    </p>
  </fieldset>
</template>
