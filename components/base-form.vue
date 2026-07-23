<script lang="ts" setup generic="T">
import type { FetchError } from "ofetch";
import type { ZodSchema } from "zod";

import { toTypedSchema } from "@vee-validate/zod";

const props = defineProps<{
  initialValues: T;
  schema: ZodSchema;
  onSubmit: (location: T) => Promise<any>;
  onSubmitComplete: () => void;
  submitLabel: string;
  submitIcon: string;
}>();

const router = useRouter();

const loading = ref(false);
const submitted = ref(false);
const submitError = ref("");

const { handleSubmit, errors, meta, setErrors } = useForm({
  validationSchema: toTypedSchema(props.schema),
  initialValues: props.initialValues,
});

const onSubmit = handleSubmit(async (values: T) => {
  try {
    submitError.value = "";
    loading.value = true;
    await props.onSubmit(values);
    submitted.value = true;
    props.onSubmitComplete();
  }
  catch (e) {
    const error = e as FetchError;
    if (error.data?.data) {
      setErrors(error.data?.data);
    }
    submitError.value = getFetchErrorMessage(error);
  }
  loading.value = false;
});

onBeforeRouteLeave(() => {
  if (!submitted.value && meta.value.dirty) {
    // eslint-disable-next-line no-alert
    const confirm = window.confirm("Are you sure want to leave? All unsaved changes will be lost.");

    if (!confirm) {
      return false;
    }
  }

  return true;
});
</script>

<template>
  <div>
    <AppAlert
      v-if="submitError"
      class="alert-error"
      icon="circle-x-filled"
      :message="submitError"
    />
    <form class="flex flex-col gap-2" @submit.prevent="onSubmit">
      <slot :errors="errors" :loading />

      <div class="flex justify-end gap-2 mt-4">
        <button
          :disabled="loading"
          type="reset"
          class="btn btn-outline btn-error"
          @click="router.back()"
        >
          <Icon name="tabler:arrow-left" size="24" />
          Cancel
        </button>
        <button
          :disabled="loading"
          type="submit"
          class="btn btn-primary"
        >
          {{ props.submitLabel }}
          <span v-if="loading">
            <LoadingSpinner />
          </span>
          <Icon
            v-else
            :name="props.submitIcon"
            size="24"
          />
        </button>
      </div>
    </form>
  </div>
</template>
