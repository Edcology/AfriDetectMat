/** The workspace clock. Kept fixed so the demo dataset and the UI never drift apart. */
export const TODAY = new Date(2026, 10, 17, 8, 5, 0);

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const pad = (n: number) => String(n).padStart(2, "0");

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function dayDiff(a: Date, b: Date) {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86_400_000);
}

/** "Today" · "Yesterday" · "Thu 19 Nov" */
export function relativeDay(date: Date, now: Date = TODAY) {
  const diff = dayDiff(date, now);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  if (diff === 1) return "Tomorrow";
  return `${DAYS[date.getDay()].slice(0, 3)} ${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}`;
}

/** "07:40" — the 24h clock used across tables. */
export function clock(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "Today · 07:40" */
export function stamp(date: Date, now: Date = TODAY) {
  return `${relativeDay(date, now)} · ${clock(date)}`;
}

/** "Tue 17 Nov · 14:00" */
export function dayTime(date: Date) {
  return `${DAYS[date.getDay()].slice(0, 3)} ${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} · ${clock(date)}`;
}

/** "Tuesday 17 November" */
export function longDate(date: Date) {
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** "November 2026" */
export function monthTitle(date: Date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "17" */
export function dayNumber(date: Date) {
  return date.getDate();
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, date.getHours(), date.getMinutes());
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function startOfWeek(date: Date) {
  const d = startOfDay(date);
  return addDays(d, -d.getDay());
}

export function isSameDay(a: Date, b: Date) {
  return sameDay(a, b);
}

/** "34w 2d" */
export function gestationalAge(weeks: number, days: number) {
  return `${weeks}w ${days}d`;
}

export function greeting(now: Date = TODAY) {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
