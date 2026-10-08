const PREFETCHED_KEY = "offline-prefetched";
const MAX_RECORDS = 100;
const CONCURRENCY = 4;

/**
 * Once per session, quietly fetch every location and trip (and their cover photos) so the service
 * worker caches them and they can be opened offline, even if they were never visited.
 */
export default function useOfflinePrefetch() {
  if (import.meta.server) {
    return;
  }

  const { locations } = storeToRefs(useLocationsStore());
  const { trips } = storeToRefs(useTripsStore());
  const isOnline = useOnline();

  watch([locations, trips, isOnline], ([locations, trips, isOnline]) => {
    // Without a controlling service worker the responses wouldn't be cached, so wait for one.
    if (!locations || !trips || !isOnline || !navigator.serviceWorker?.controller || hasPrefetched()) {
      return;
    }

    markPrefetched();

    const records = [
      ...locations.map(location => ({ url: `/api/locations/${location.slug}`, coverImageKey: location.coverImageKey })),
      ...trips.map(trip => ({ url: `/api/trips/${trip.slug}`, coverImageKey: trip.coverImageKey })),
    ].slice(0, MAX_RECORDS);

    const urls = records.flatMap(record => record.coverImageKey
      ? [record.url, `/api/images/${record.coverImageKey}`]
      : [record.url]);

    whenIdle(() => fetchAll(urls));
  }, { immediate: true });
}

async function fetchAll(urls: string[]) {
  const queue = [...urls];

  async function worker() {
    for (let url = queue.shift(); url; url = queue.shift()) {
      // Only the service worker's copy matters; a failure just means it isn't available offline.
      await fetch(url).catch(() => {});
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}

function whenIdle(callback: () => void) {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(callback);
  }
  else {
    setTimeout(callback, 2000);
  }
}

// Storage can be unavailable (e.g. some private modes), in which case prefetching just runs again.
function hasPrefetched() {
  try {
    return sessionStorage.getItem(PREFETCHED_KEY) === "true";
  }
  catch {
    return false;
  }
}

function markPrefetched() {
  try {
    sessionStorage.setItem(PREFETCHED_KEY, "true");
  }
  catch {}
}
