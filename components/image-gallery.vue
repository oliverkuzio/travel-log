<script lang="ts" setup>
import type { SelectLocationLogImage } from "~/lib/db/schema";

const props = defineProps<{
  images: SelectLocationLogImage[];
  isOpen: boolean;
  startIndex?: number;
}>();

const emit = defineEmits<{
  onClosed: [];
}>();

const dialog = useTemplateRef("dialog");
const carousel = useTemplateRef("carousel");
const currentIndex = ref(0);

function goTo(index: number, behavior: ScrollBehavior = "smooth") {
  if (!carousel.value || !props.images.length)
    return;
  const total = props.images.length;
  currentIndex.value = (index + total) % total;
  // Scroll the carousel directly rather than using DaisyUI's #slide anchors, which would change the route hash
  carousel.value.scrollTo({ left: carousel.value.clientWidth * currentIndex.value, behavior });
}

function onScroll() {
  if (!carousel.value?.clientWidth)
    return;
  currentIndex.value = Math.round(carousel.value.scrollLeft / carousel.value.clientWidth);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowLeft")
    goTo(currentIndex.value - 1);
  else if (event.key === "ArrowRight")
    goTo(currentIndex.value + 1);
}

function onClose() {
  emit("onClosed");
}

watch(() => props.isOpen, async (isOpen) => {
  if (!dialog.value)
    return;
  if (isOpen) {
    dialog.value.showModal();
    await nextTick();
    goTo(props.startIndex ?? 0, "instant");
  }
  else if (dialog.value.open) {
    dialog.value.close();
  }
});

onMounted(() => {
  dialog.value?.addEventListener("close", onClose);
});

onUnmounted(() => {
  dialog.value?.removeEventListener("close", onClose);
});
</script>

<template>
  <dialog
    ref="dialog"
    class="modal"
    @keydown="onKeydown"
  >
    <div class="modal-box w-11/12 max-w-5xl p-4">
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm opacity-70">
          {{ currentIndex + 1 }} / {{ images.length }}
        </p>
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost" aria-label="Close gallery">
            <Icon name="tabler:x" size="20" />
          </button>
        </form>
      </div>
      <div
        ref="carousel"
        class="carousel w-full rounded-sm bg-base-300"
        @scroll.passive="onScroll"
      >
        <div
          v-for="(image, index) in images"
          :key="image.id"
          class="carousel-item relative w-full justify-center"
        >
          <img
            class="max-h-[75vh] w-full object-contain"
            :src="`/api/images/${image.key}`"
            :alt="`Image ${index + 1} of ${images.length}`"
          >
          <div
            v-if="images.length > 1"
            class="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between"
          >
            <button
              type="button"
              class="btn btn-circle"
              aria-label="Previous image"
              @click="goTo(index - 1)"
            >
              ❮
            </button>
            <button
              type="button"
              class="btn btn-circle"
              aria-label="Next image"
              @click="goTo(index + 1)"
            >
              ❯
            </button>
          </div>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>Close</button>
    </form>
  </dialog>
</template>
