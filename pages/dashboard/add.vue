<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";

import { InsertLocation } from "~/lib/db/schema";

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(InsertLocation),
});

effect(() => {
});

const onSubmit = handleSubmit(() => {
  return false;
});
</script>

<template>
  <div class="container max-w-md mx-auto py-4">
    <div class="mb-4">
      <h1 class="text-xl">
        Add Location
      </h1>
      <p class="text-sm mb-0">
        A location is a place you have traveled or will travel to. It can be a
        city, country, or any other geographical area. You can add specific
        vists to this location via the location log.
      </p>
    </div>
    <form class="flex flex-col gap-2" @submit.prevent="onSubmit">
      <AppFormField
        label="Name"
        name="name"
        :error="errors.name"
      />
      <AppFormField
        type="textarea"
        label="Description"
        name="description"
        :error="errors.description"
      />
      <AppFormField
        type="number"
        label="Latitude"
        name="lat"
        :error="errors.lat"
      />
      <AppFormField
        type="number"
        label="Latitude"
        name="long"
        :error="errors.long"
      />

      <div class="flex justify-end gap-2">
        <button type="reset" class="btn btn-outline">
          <Icon name="tabler:arrow-left" size="24" />
          Cancel
        </button>
        <button type="submit" class="btn btn-primary">
          Add
          <Icon name="tabler:circle-plus-filled" size="24" />
        </button>
      </div>
    </form>
  </div>
</template>
