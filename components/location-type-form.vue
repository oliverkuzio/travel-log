<script lang="ts" setup>
import { InsertLocationType } from "~/lib/db/schema";
import { IconSchema } from "~/lib/zod-schemas";

const props = defineProps<{
  initialValues?: InsertLocationType;
  onSubmit: (locationType: InsertLocationType) => Promise<any>;
  onSubmitComplete: () => void;
  submitLabel: string;
  submitIcon: string;
}>();

const values = props.initialValues || {
  name: "",
  description: "",
  icon: "tabler:",
};
</script>

<template>
  <BaseForm
    v-slot="{ errors, loading }"
    :initial-values="values"
    :schema="InsertLocationType"
    :on-submit
    :on-submit-complete
    :submit-label
    :submit-icon
  >
    <AppFormField
      label="Name"
      name="name"
      :error="errors.name"
      :disabled="loading"
    />
    <AppFormField
      type="textarea"
      label="Description"
      name="description"
      :error="errors.description"
      :disabled="loading"
    />
    <AppFormField
      label="Icon"
      name="icon"
      :error="errors.icon"
      :disabled="loading"
    />
    <Field v-slot="{ value }" name="icon">
      <div class="flex items-center gap-3 text-sm">
        <MapPin
          :colors="getPointColors('location')"
          :icon="IconSchema.safeParse(value).success ? value : null"
          :size="40"
        />
        <p>
          Use any
          <a
            href="https://tabler.io/icons"
            target="_blank"
            rel="noopener"
            class="link"
          >Tabler icon</a>
          name, prefixed with <code>tabler:</code>, e.g. <code>tabler:beer</code>.
        </p>
      </div>
    </Field>
  </BaseForm>
</template>
