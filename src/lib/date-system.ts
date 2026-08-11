/**
 * Centralized Server Date & Timezone Utility System for EggRate India.
 * Server/Database is the sole source of truth for time — zero browser/device clock dependency.
 * Default timezone: Asia/Kolkata (IST), configurable by Admin via automation_settings.
 */

export const DEFAULT_TIMEZONE = "Asia/Kolkata";

/**
 * Parses date input into a clean Date object using specified timezone or noon IST anchor.
 */
export function parseServerDate(input?: string | Date | null, timeZone: string = DEFAULT_TIMEZONE): Date {
  if (!input) return new Date();
  if (input instanceof Date) return input;

  const trimmed = input.trim();
  // Handle canonical YYYY-MM-DD strings anchored at noon to avoid boundary shifts
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Returns YYYY-MM-DD canonical date string for given timestamp in configured timezone (default Asia/Kolkata).
 */
export function getCanonicalDateStr(input: string | Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): string {
  const date = parseServerDate(input, timeZone);
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch {
    // Fallback to offset math if Intl timezone formatting fails
    const ist = new Date(date.getTime() + (330 + date.getTimezoneOffset()) * 60_000);
    return `${ist.getFullYear()}-${String(ist.getMonth() + 1).padStart(2, "0")}-${String(ist.getDate()).padStart(2, "0")}`;
  }
}

/**
 * Returns current server date in YYYY-MM-DD in Asia/Kolkata timezone.
 */
export function getCurrentDate(timeZone: string = DEFAULT_TIMEZONE): string {
  return getCanonicalDateStr(new Date(), timeZone);
}

/**
 * Returns current ISO date-time string.
 */
export function getCurrentDateTime(): string {
  return new Date().toISOString();
}

/**
 * Returns yesterday's canonical date in YYYY-MM-DD format relative to target date.
 */
export function getYesterdayDate(fromDate: string | Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): string {
  const currentStr = typeof fromDate === "string" ? fromDate : getCanonicalDateStr(fromDate, timeZone);
  const [y, m, d] = currentStr.split("-").map(Number);
  const target = new Date(y, m - 1, d - 1, 12, 0, 0);
  return getCanonicalDateStr(target, timeZone);
}

/**
 * Returns start of day ISO timestamp for target date in timezone.
 */
export function getStartOfDay(dateStr: string = getCurrentDate()): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
}

/**
 * Returns end of day ISO timestamp for target date in timezone.
 */
export function getEndOfDay(dateStr: string = getCurrentDate()): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
}

/**
 * Formats canonical YYYY-MM-DD or ISO string into human readable display string.
 * Example: "Tuesday, 11 August 2026"
 */
export function formatDisplayDate(input: string | Date, timeZone: string = DEFAULT_TIMEZONE): string {
  const date = parseServerDate(input, timeZone);
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }
}

/**
 * Formats timestamp into "11 Aug 2026, 8:15 AM"
 */
export function formatPublicationTimestamp(input: string | Date, timeZone: string = DEFAULT_TIMEZONE): string {
  const date = parseServerDate(input, timeZone);
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone,
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }
}

/**
 * Checks if two date inputs match the same YYYY-MM-DD date.
 */
export function isDateEqual(dateA: string | Date, dateB: string | Date): boolean {
  return getCanonicalDateStr(dateA) === getCanonicalDateStr(dateB);
}
