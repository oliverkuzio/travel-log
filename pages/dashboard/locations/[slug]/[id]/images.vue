<script lang="ts" setup>
import { FetchError } from "ofetch";

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

function selectImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];

  if (file) {
    image.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
}

async function getChecksum(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
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

    const checksum = await getChecksum(blob);

    try {
      const { fields, key, url } = await $csrfFetch(`/api/locations/${route.params.slug}/${route.params.id}/sign-image`, {
        method: "POST",
        body: {
          contentLength: blob.size,
          checksum,
        },
      });

      const formData = new FormData();

      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      formData.append("file", blob);

      await $fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          "x-amz-checksum-algorithm": "SHA256",
        },
      });

      await $csrfFetch(`/api/locations/${route.params.slug}/${route.params.id}/image`, {
        method: "POST",
        body: {
          key,
        },
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
</script>

<template>
  <div class="p-4">
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
        <ImageList :images="locationLog?.images || []" />
      </div>
    </div>
  </div>
</template>
