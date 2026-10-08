// How often to retry syncing while changes are waiting, in case an event was missed.
const SYNC_INTERVAL = 60_000;

export default defineNuxtPlugin((nuxtApp) => {
  const outbox = useOutboxStore();
  const router = useRouter();

  nuxtApp.hook("app:mounted", async () => {
    await outbox.ready();

    // The server-rendered page couldn't show changes queued on this device, so refetch with them.
    if (outbox.entries.length) {
      outbox.changedAt = Date.now();
    }

    outbox.sync();
  });

  window.addEventListener("online", () => outbox.sync());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      outbox.sync();
    }
  });
  setInterval(() => outbox.sync(), SYNC_INTERVAL);

  // Once a record created on this device is synced, move from its temporary URL to the real one.
  watch([() => router.currentRoute.value, () => outbox.refs], ([route]) => {
    const params = Object.fromEntries(Object.entries(route.params).map(([key, value]) =>
      [key, typeof value === "string" ? outbox.resolveRef(value) : value]));

    if (route.name && Object.keys(params).some(key => params[key] !== route.params[key])) {
      router.replace({ name: route.name, params, query: route.query, hash: route.hash });
    }
  });
});
