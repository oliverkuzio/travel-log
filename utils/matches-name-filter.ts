/**
 * Whether a name contains the filter text, ignoring case. An empty filter matches everything.
 */
export function matchesNameFilter(name: string, filter: string) {
  const query = filter.trim().toLowerCase();

  return !query || name.toLowerCase().includes(query);
}
