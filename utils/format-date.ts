const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

/**
 * A local YYYY-MM-DD date, as used by date inputs.
 */
export function toDateInputValue(value: number | string) {
  const date = new Date(value);

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatTime(value: number | string) {
  const date = new Date(value);

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * e.g. 1st, 2nd, 3rd, 4th, 11th, 12th, 13th, 21st.
 */
function withOrdinal(value: number) {
  const lastTwo = value % 100;

  if (lastTwo >= 11 && lastTwo <= 13) {
    return `${value}th`;
  }

  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };

  return `${value}${suffixes[value % 10] ?? "th"}`;
}

/**
 * e.g. "Mon, 1st Sept 2020", or "Mon, Sept 01 2020" when the month comes first (as in the US).
 */
export function formatLongDate(value: number | string, monthFirst = false) {
  const date = new Date(value);
  const day = DAYS[date.getDay()];
  const month = MONTHS[date.getMonth()];

  return monthFirst
    ? `${day}, ${month} ${pad(date.getDate())} ${date.getFullYear()}`
    : `${day}, ${withOrdinal(date.getDate())} ${month} ${date.getFullYear()}`;
}

/**
 * Formats a start and end as a range, collapsing it to one date when both fall on the same day.
 * With times, a same-day range shows the date once, e.g. "Mon, 01 Sept 2020 09:00 - 17:30".
 */
export function formatLongDateRange(startedAt: number, endedAt: number, options: { monthFirst?: boolean; withTime?: boolean } = {}) {
  const { monthFirst, withTime } = options;
  const startDate = formatLongDate(startedAt, monthFirst);
  const endDate = formatLongDate(endedAt, monthFirst);
  const sameDay = startDate === endDate;

  if (!withTime) {
    return sameDay ? startDate : `${startDate} - ${endDate}`;
  }

  const start = `${startDate} ${formatTime(startedAt)}`;

  if (startedAt === endedAt) {
    return start;
  }

  return `${start} - ${sameDay ? "" : `${endDate} `}${formatTime(endedAt)}`;
}
