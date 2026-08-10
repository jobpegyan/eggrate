import type { City, EggRate, RatePoint, Region } from "@/types";
import { toISODate } from "@/utils/format";

/**
 * Deterministic placeholder dataset used by the data layer until the Cloud
 * database is provisioned. Replace `src/database/queries.ts` internals — not
 * the call sites — when wiring real tables.
 */

export const STATES: Region[] = [
  { id: "s-ap", slug: "andhra-pradesh", name: "Andhra Pradesh", code: "AP" },
  { id: "s-tg", slug: "telangana", name: "Telangana", code: "TG" },
  { id: "s-tn", slug: "tamil-nadu", name: "Tamil Nadu", code: "TN" },
  { id: "s-ka", slug: "karnataka", name: "Karnataka", code: "KA" },
  { id: "s-mh", slug: "maharashtra", name: "Maharashtra", code: "MH" },
  { id: "s-up", slug: "uttar-pradesh", name: "Uttar Pradesh", code: "UP" },
  { id: "s-wb", slug: "west-bengal", name: "West Bengal", code: "WB" },
  { id: "s-dl", slug: "delhi", name: "Delhi", code: "DL" },
];

const CITY_SEED: [string, string, boolean][] = [
  ["Vijayawada", "andhra-pradesh", true],
  ["Visakhapatnam", "andhra-pradesh", false],
  ["Hyderabad", "telangana", true],
  ["Warangal", "telangana", false],
  ["Chennai", "tamil-nadu", true],
  ["Namakkal", "tamil-nadu", true],
  ["Bengaluru", "karnataka", true],
  ["Mysuru", "karnataka", false],
  ["Mumbai", "maharashtra", true],
  ["Pune", "maharashtra", false],
  ["Lucknow", "uttar-pradesh", true],
  ["Varanasi", "uttar-pradesh", false],
  ["Kolkata", "west-bengal", true],
  ["New Delhi", "delhi", true],
];

export const CITIES: City[] = CITY_SEED.map(([name, stateSlug, isMajorMarket], index) => {
  const state = STATES.find((s) => s.slug === stateSlug)!;
  return {
    id: `c-${index}`,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    stateSlug: state.slug,
    stateName: state.name,
    isMajorMarket,
  };
});

/** Stable pseudo-random value in [0, 1) derived from a string seed. */
function seeded(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10_000) / 10_000;
}

function priceFor(citySlug: string, date: string): number {
  return Number((5.2 + seeded(citySlug + date) * 1.4).toFixed(2));
}

export function rateFor(city: City, date = toISODate()): EggRate {
  const previous = toISODate(new Date(new Date(date).getTime() - 86_400_000));
  const pricePerPiece = priceFor(city.slug, date);
  return {
    id: `${city.slug}-${date}`,
    citySlug: city.slug,
    cityName: city.name,
    stateSlug: city.stateSlug,
    stateName: city.stateName,
    date,
    pricePerPiece,
    pricePerTray: Number((pricePerPiece * 30).toFixed(2)),
    pricePer100: Number((pricePerPiece * 100).toFixed(2)),
    market: "necc",
    changePerPiece: Number((pricePerPiece - priceFor(city.slug, previous)).toFixed(2)),
  };
}

export function historyFor(citySlug: string, days = 30): RatePoint[] {
  const today = Date.now();
  return Array.from({ length: days }, (_, index) => {
    const date = toISODate(new Date(today - (days - 1 - index) * 86_400_000));
    return { date, pricePerPiece: priceFor(citySlug, date) };
  });
}