<script lang="ts" setup>
import { FetchError } from "ofetch";

import type { SelectLocationLogImage } from "~/lib/db/schema";

const image = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

const route = useRoute();
const { $csrfFetch } = useNuxtApp();
const locationStore = useLocationsStore();
const {
  currentLocationLog: locationLog,
  currentLocationLogError: error,
  currentLocationLogStatus: status,
} = storeToRefs(locationStore);

const isUploading = ref(false);
const uploadError = ref("");

const loading = computed(() => status.value === "pending");
const errorMessage = computed(() => error.value?.statusMessage);
const imageInput = useTemplateRef("imageInput");

const isOpen = ref(false);
const isDeleting = ref(false);
const deleteError = ref("");
const deletingImage = ref<SelectLocationLogImage | null>(null);

function selectImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];

  if (file) {
    image.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
}

async function uploadImage() {
  if (!image.value || !previewUrl.value)
    return;

  isUploading.value = true;
  uploadError.value = "";

  const previewImage = new Image();

  previewImage.addEventListener("load", async () => {
    const width = Math.min(1000, previewImage.width);
    const resized = await createImageBitmap(previewImage, {
      resizeWidth: width,
    });

    const canvas = new OffscreenCanvas(width, resized.height);
    canvas.getContext("bitmaprenderer")?.transferFromImageBitmap(resized);

    const blob = await canvas.convertToBlob({
      type: "image/jpeg",
      quality: 0.9,
    });

    try {
      const formData = new FormData();
      formData.append("file", blob, "image.jpg");

      await $csrfFetch(`/api/locations/${route.params.slug}/${route.params.id}/image`, {
        method: "POST",
        body: formData,
      });

      await locationStore.refreshCurrentLocationLog();
      image.value = null;
      previewUrl.value = null;
      if (imageInput.value) {
        imageInput.value.value = "";
      }
    }
    catch (e) {
      if (e instanceof FetchError) {
        uploadError.value = (e as FetchError).statusMessage || "Unkown error";
      }
      else if (e instanceof Error) {
        uploadError.value = (e as Error).message;
      }
      else {
        uploadError.value = "Unkown error";
      }
    }

    isUploading.value = false;
  });

  previewImage.src = previewUrl.value;
}

function deleteImage(image: SelectLocationLogImage) {
  deletingImage.value = image;
  isOpen.value = true;
}

function onDialogClose() {
  deletingImage.value = null;
  isOpen.value = false;
}

async function confirmDelete() {
  if (!deletingImage.value) {
    return;
  }

  try {
    isDeleting.value = true;
    deleteError.value = "";

    await $fetch(`/api/locations/${route.params.slug}/${route.params.id}/image/${deletingImage?.value.id}`, {
      method: "DELETE",
    });
    await locationStore.refreshCurrentLocationLog();
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = getFetchErrorMessage(error);
  }

  deletingImage.value = null;
  isDeleting.value = false;
  isOpen.value = false;
}

useSeoMeta({
  title: () => locationLog.value ? `Images for ${locationLog.value.name}` : "Images",
  description: "Add and remove photos for this visit.",
});
</script>

<template>
  <div>
    <BackLink
      :to="{ name: 'dashboard-locations-slug-id', params: { slug: route.params.slug, id: route.params.id } }"
      :label="locationLog?.name"
    />
    <div v-if="loading">
      <div class="loading" />
    </div>
    <AppAlert
      v-if="errorMessage && !loading"
      class="alert-error"
      icon="circle-x-filled"
      :message="errorMessage"
    />
    <div v-if="route.name === 'dashboard-locations-slug-id-images' && locationLog && !loading">
      <h2 class="text-xl mb-2">
        Manage <b>{{ locationLog?.name }}</b> images
      </h2>
      <div class="flex gap-2 flex-col w-64">
        <div class="bg-gray-500 h-48 w-full flex justify-center items-center relative rounded-sm">
          <p v-if="!previewUrl" class="text-center text-white">
            Select an image
          </p>
          <img
            v-else
            :src="previewUrl"
            alt="Upload preview"
            class="h-full object-cover"
          >
          <div v-if="isUploading || uploadError" class="size-full absolute flex justify-center items-center bg-black opacity-50">
            <div v-if="isUploading" class="loading loading-lg" />
            <div v-else-if="uploadError" class="error">
              {{ uploadError }}
            </div>
          </div>
        </div>
        <input
          ref="imageInput"
          type="file"
          class="file-input"
          :disabled="isUploading"
          @change="selectImage"
        >
        <button
          class="btn btn-primary"
          :disabled="!image || isUploading"
          @click="uploadImage"
        >
          Upload
          <Icon name="tabler:photo-plus" size="24" />
        </button>
        <ImageList :images="locationLog?.images || []">
          <template #default="{ image: item }">
            <button
              :disabled="deletingImage === item && isDeleting"
              class="btn btn-error btn-sm w-full"
              @click="deleteImage(item)"
            >
              Delete
              <div v-if="deletingImage === item && isDeleting" class="loading loading-xs" />
              <Icon
                v-else
                name="tabler:photo-x"
                size="18"
              />
            </button>
          </template>
        </ImageList>
      </div>
    </div>
    <AppDialog
      title="Are you sure?"
      description="Deleting this image cannot be undone. Do you really want to do this?"
      confirm-label="Yes, delete this image."
      confirm-class="btn-error"
      :is-open="isOpen"
      @on-closed="onDialogClose"
      @on-confirmed="confirmDelete"
    />
  </div>
</template>
