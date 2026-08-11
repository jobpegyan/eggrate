import { DEFAULT_LOCALE } from "@/lib/constants";
import { 
  getCanonicalDateStr, 
  parseServerDate, 
  formatDisplayDate, 
  formatPublicationTimestamp 
} from "@/lib/date-system";

export { 
  getCanonicalDateStr, 
  getCurrentDate, 
  getCurrentDateTime, 
  getYesterdayDate, 
  getStartOfDay, 
  getEndOfDay, 
  formatDisplayDate, 
  formatPublicationTimestamp, 
  isDateEqual 
} from "@/lib/date-system";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const inrCompactFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** ₹5.85 — used for per-piece prices. */
export function formatPrice(value: number): string {
  return inrFormatter.format(value);
}

/** ₹176 — used for tray / 100-piece prices. */
export function formatPriceCompact(value: number): string {
  return inrCompactFormatter.format(value);
}

/** +0.12 / -0.08 / 0.00 with an explicit sign. */
export function formatDelta(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}₹${Math.abs(value).toFixed(2)}`;
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(fractionDigits)}%`;
}

export function deltaDirection(value: number): "up" | "down" | "flat" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

function toDate(input: string | Date): Date {
  return parseServerDate(input);
}

/** "4 Aug 2026" */
export function formatDate(input: string | Date, locale: string = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(`${locale}-IN`, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(toDate(input));
}

/** "Tuesday, 4 August 2026" */
export function formatDateLong(input: string | Date, locale: string = DEFAULT_LOCALE): string {
  return formatDisplayDate(input);
}

/** YYYY-MM-DD in IST, the canonical key for a rate day. */
/** "4 Aug 2026, 18:30" */
export function formatDateTime(input: string | Date, locale: string = DEFAULT_LOCALE): string {
  return formatPublicationTimestamp(input);
}

export function toISODate(input: string | Date = new Date()): string {
  return getCanonicalDateStr(input);
}

/** "2 days ago" / "today" */
export function formatRelativeDay(input: string | Date): string {
  const days = Math.round(
    (Date.now() - toDate(input).getTime()) / 86_400_000,
  );
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function titleCase(value: string): string {
  return value.replace(/(^|[\s-])\w/g, (c) => c.toUpperCase()).replace(/-/g, " ");
}