const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayISO(): string {
  return toISODate(new Date());
}

export function getCurrentMonthLabel(): string {
  const now = new Date();
  const monthName = now.toLocaleString("en-US", { month: "long" });
  return `${monthName} ${now.getFullYear()}`;
}

export function isInCurrentMonth(iso: string): boolean {
  return iso.slice(0, 7) === getTodayISO().slice(0, 7);
}

export function formatDisplayDate(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (iso === toISODate(today)) {
    return "Today";
  }

  if (iso === toISODate(yesterday)) {
    return "Yesterday";
  }

  const weekday = WEEKDAY_NAMES[parsed.getDay()];
  const month = MONTH_NAMES[parsed.getMonth()];
  return `${weekday}, ${month} ${parsed.getDate()}`;
}
