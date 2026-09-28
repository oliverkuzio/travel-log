/**
 * Formats dates for the user's region: the US puts the month before the date, everywhere else
 * after. The locale comes from the Accept-Language header during SSR and is shared with the
 * client, so the server and hydrated markup match.
 */
export default function useDateFormat() {
  const locale = useState("date-locale", () => {
    if (import.meta.server) {
      const header = useRequestHeaders(["accept-language"])["accept-language"];
      return header?.split(",")[0]?.split(";")[0]?.trim() || "en";
    }

    return navigator.language;
  });

  const monthFirst = computed(() => {
    try {
      return new Intl.Locale(locale.value).region === "US";
    }
    catch {
      return false;
    }
  });

  function formatDate(value: number | string) {
    return formatLongDate(value, monthFirst.value);
  }

  function formatDateRange(startedAt: number, endedAt: number, withTime = false) {
    return formatLongDateRange(startedAt, endedAt, { monthFirst: monthFirst.value, withTime });
  }

  return { formatDate, formatDateRange };
}
