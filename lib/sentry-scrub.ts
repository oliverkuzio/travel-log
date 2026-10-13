// Search queries (e.g. place names) travel in query strings, so keep them out of Sentry events.
export function stripQueryStrings<T extends { request?: { url?: string; query_string?: unknown } }>(event: T) {
  if (event.request) {
    event.request.url = event.request.url?.split("?")[0];
    delete event.request.query_string;
  }
  return event;
}
