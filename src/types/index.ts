/** Shared domain types. Keep this module free of runtime imports. */

export type RateUnit = "piece" | "tray" | "hundred";
export type MarketType = "wholesale" | "retail" | "necc";

export interface Region {
  id: string;
  slug: string;
  name: string;
  /** Two-letter-ish state code, e.g. "AP", "TN". */
  code: string;
}

export interface City {
  id: string;
  slug: string;
  name: string;
  stateSlug: string;
  stateName: string;
  isMajorMarket: boolean;
}

export interface EggRate {
  id: string;
  citySlug: string;
  cityName: string;
  stateSlug: string;
  stateName: string;
  /** ISO date (YYYY-MM-DD) the rate applies to. */
  date: string;
  /** Price in INR for a single egg. */
  pricePerPiece: number;
  pricePerTray: number;
  pricePer100: number;
  market: MarketType;
  /** Difference vs. previous published day, in INR per piece. */
  changePerPiece: number;
}

export interface RatePoint {
  date: string;
  pricePerPiece: number;
}

export interface SearchResult {
  type: "state" | "city";
  slug: string;
  label: string;
  sublabel?: string;
  href: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };