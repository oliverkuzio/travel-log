const isOnline = ref(true);
let listening = false;

/**
 * Whether the browser thinks it has a connection. Starts as online and only updates once the app
 * has hydrated, so pages rendered on the server (or served from the offline cache) hydrate cleanly.
 */
export function useOnline() {
  if (import.meta.client && !listening) {
    listening = true;

    onNuxtReady(() => {
      isOnline.value = navigator.onLine;
      window.addEventListener("online", () => isOnline.value = true);
      window.addEventListener("offline", () => isOnline.value = false);
    });
  }

  return readonly(isOnline);
}
