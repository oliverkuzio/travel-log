<script setup lang="ts">
const props = defineProps<{
  type?: "text" | "textarea" | "number";
  name: string;
  label: string;
  error?: string;
}>();
</script>

<template>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">
      {{ props.label }}
    </legend>
    <Field
      :as="type && type !== 'text' && type !== 'number' ? type : 'input'"
      class="input w-full"
      :class="{
        'input-error': props.error,
        'input': !type || type === 'text' || type === 'number',
        'textarea': type === 'textarea',
      }"
      :name="props.name"
      :type="props.type"
    />
    <p v-if="props.error" class="fieldset-label text-error">
      {{ props.error }}
    </p>
  </fieldset>
</template>
