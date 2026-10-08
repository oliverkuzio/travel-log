<script lang="ts" setup>
// Phones pull the pane between three heights: just the page title, the title and some content, or all but
// the top of the map.
type Tier = "collapsed" | "default" | "expanded";

const DESKTOP_QUERY = "(min-width: 48rem)";
const EXPANDED_MAP_GAP = 80;
const DEFAULT_HEIGHT_RATIO = 0.45;
// Matches the p-4 the dashboard pages are wrapped in.
const PAGE_PADDING = 16;
// A pull shorter than this is treated as a tap.
const TAP_THRESHOLD = 5;

const mapStore = useMapStore();

const pane = useTemplateRef<HTMLElement>("pane");
const handle = useTemplateRef<HTMLElement>("handle");
const content = useTemplateRef<HTMLElement>("content");

const isDesktop = ref(false);
// Desktop only: whether the navigation and pane are tucked away to the left.
const collapsed = ref(false);

const tier = ref<Tier>("default");
const areaHeight = ref(0);
const handleHeight = ref(0);
const titleHeight = ref(0);
const paneWidth = ref(0);
const dragHeight = ref<number | null>(null);
let dragStart: { y: number; height: number } | null = null;
let suppressClick = false;

const tierHeights = computed(() => {
  const expanded = Math.max(areaHeight.value - EXPANDED_MAP_GAP, 0);
  const collapsed = Math.min(handleHeight.value + titleHeight.value, expanded);
  const defaultHeight = Math.min(Math.max(Math.round(areaHeight.value * DEFAULT_HEIGHT_RATIO), collapsed), expanded);

  return { collapsed, default: defaultHeight, expanded };
});

const height = computed(() => dragHeight.value ?? tierHeights.value[tier.value]);

function getTitle() {
  return content.value?.querySelector("h1") ?? null;
}

/**
 * When collapsed, scroll the page so its title sits at the top of the pane.
 */
function scrollToTitle() {
  if (tier.value === "collapsed" && content.value) {
    content.value.scrollTop = Math.max((getTitle()?.offsetTop ?? 0) - PAGE_PADDING, 0);
  }
}

function measure() {
  areaHeight.value = pane.value?.parentElement?.clientHeight ?? 0;
  handleHeight.value = handle.value?.offsetHeight ?? 0;
  paneWidth.value = pane.value?.offsetWidth ?? 0;

  const title = getTitle();
  titleHeight.value = (title?.offsetHeight ?? 32) + PAGE_PADDING * 2;
  scrollToTitle();
}

function setTier(value: Tier) {
  if (tier.value === "collapsed" && value !== "collapsed") {
    content.value?.scrollTo({ top: 0 });
  }
  tier.value = value;
  nextTick(scrollToTitle);
}

function onHandlePointerDown(event: PointerEvent) {
  handle.value?.setPointerCapture(event.pointerId);
  dragStart = { y: event.clientY, height: height.value };
}

function onHandlePointerMove(event: PointerEvent) {
  if (!dragStart) {
    return;
  }

  const { collapsed, expanded } = tierHeights.value;
  dragHeight.value = Math.min(Math.max(dragStart.height + dragStart.y - event.clientY, collapsed), expanded);
}

function onHandlePointerUp(event: PointerEvent) {
  if (!dragStart) {
    return;
  }

  const moved = Math.abs(event.clientY - dragStart.y) >= TAP_THRESHOLD;
  dragStart = null;

  // A pull snaps to the nearest height, and is followed by a click that shouldn't also change it.
  if (moved && dragHeight.value !== null) {
    const releasedAt = dragHeight.value;
    const heights = tierHeights.value;
    const nearest = (Object.keys(heights) as Tier[])
      .reduce((best, key) => Math.abs(heights[key] - releasedAt) < Math.abs(heights[best] - releasedAt) ? key : best);

    suppressClick = true;
    setTier(nearest);
  }

  dragHeight.value = null;
}

// Taps and the keyboard step up through the heights, then back to the default.
function onHandleClick() {
  if (suppressClick) {
    suppressClick = false;
    return;
  }

  setTier(tier.value === "default" ? "expanded" : "default");
}

function onHandleKeydown(event: KeyboardEvent) {
  const order: Tier[] = ["collapsed", "default", "expanded"];
  const index = order.indexOf(tier.value);

  if (event.key === "ArrowUp" && index < order.length - 1) {
    event.preventDefault();
    setTier(order[index + 1]!);
  }
  else if (event.key === "ArrowDown" && index > 0) {
    event.preventDefault();
    setTier(order[index - 1]!);
  }
}

watchEffect(() => {
  mapStore.setInsets(isDesktop.value
    ? { left: collapsed.value ? 0 : paneWidth.value, bottom: 0 }
    : { left: 0, bottom: tierHeights.value.default });
});

let resizeObserver: ResizeObserver | undefined;
let mutationObserver: MutationObserver | undefined;
let mediaQuery: MediaQueryList | undefined;
let frame = 0;

function scheduleMeasure() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(measure);
}

function onMediaChange() {
  isDesktop.value = mediaQuery?.matches ?? false;
  scheduleMeasure();
}

onMounted(() => {
  mediaQuery = window.matchMedia(DESKTOP_QUERY);
  mediaQuery.addEventListener("change", onMediaChange);
  isDesktop.value = mediaQuery.matches;

  // The title changes as pages load and navigate, so remeasure whenever the page does.
  resizeObserver = new ResizeObserver(scheduleMeasure);
  if (pane.value?.parentElement) {
    resizeObserver.observe(pane.value.parentElement);
  }
  if (content.value) {
    mutationObserver = new MutationObserver(scheduleMeasure);
    mutationObserver.observe(content.value, { childList: true, subtree: true, characterData: true });
  }

  measure();
});

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener("change", onMediaChange);
  resizeObserver?.disconnect();
  mutationObserver?.disconnect();
  cancelAnimationFrame(frame);
});
</script>

<template>
  <!--
    Phones: a sheet along the bottom of the map, sized by --pane-height. Larger screens: the navigation and
    pane down the left, which collapse together.
  -->
  <div
    ref="pane"
    class="absolute inset-x-0 bottom-0 z-10 flex h-[var(--pane-height,45%)] md:inset-y-0 md:right-auto md:h-auto"
    :class="[
      { 'transition-[height,translate] duration-300': dragHeight === null },
      { 'md:-translate-x-full': collapsed },
    ]"
    :style="areaHeight ? { '--pane-height': `${height}px` } : undefined"
  >
    <AppSidebar />
    <div class="flex-1 md:flex-none md:w-96 flex flex-col bg-base-200 shadow-lg overflow-hidden rounded-t-box md:rounded-tl-none md:rounded-br-box">
      <button
        ref="handle"
        type="button"
        class="md:hidden shrink-0 px-4 py-3 touch-none cursor-grab active:cursor-grabbing"
        aria-label="Resize side panel"
        @pointerdown="onHandlePointerDown"
        @pointermove="onHandlePointerMove"
        @pointerup="onHandlePointerUp"
        @pointercancel="onHandlePointerUp"
        @click="onHandleClick"
        @keydown="onHandleKeydown"
      >
        <span class="block h-1.5 rounded-full bg-base-content/30" />
      </button>
      <div
        ref="content"
        class="relative flex-1 min-h-0 md:overflow-y-auto"
        :class="tier === 'collapsed' ? 'overflow-hidden' : 'overflow-y-auto'"
      >
        <slot />
      </div>
    </div>
    <div
      class="tooltip tooltip-right hidden md:block absolute left-full top-1/2 -translate-y-1/2"
      :data-tip="collapsed ? 'Expand side panel' : 'Collapse side panel'"
    >
      <button
        type="button"
        class="flex items-center justify-center w-6 h-12 bg-base-200 rounded-r-box shadow-lg hover:cursor-pointer"
        :aria-label="collapsed ? 'Expand side panel' : 'Collapse side panel'"
        :aria-expanded="!collapsed"
        @click="collapsed = !collapsed"
      >
        <Icon :name="collapsed ? 'tabler:chevron-right' : 'tabler:chevron-left'" size="20" />
      </button>
    </div>
  </div>
</template>
