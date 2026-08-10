/**
 * Reusable database layer.
 *
 * Every read the app performs goes through this module, so swapping the
 * fixture source for the Cloud/Postgres client is a one-file change.
 * Functions here are server-safe only — call them from services/server fns.
 */
import { CITIES, STATES, historyFor, rateFor } from "@/database/fixtures";
import type { City, EggRate, Paginated, RatePoint, Region, SearchResult } from "@/types";
import { toISODate } from "@/utils/format";

export async function listStates(): Promise<Region[]> {
  return [...STATES].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getStateBySlug(slug: string): Promise<Region | null> {
  return STATES.find((state) => state.slug === slug) ?? null;
}

export async function listCities(stateSlug?: string): Promise<City[]> {
  const cities = stateSlug ? CITIES.filter((city) => city.stateSlug === stateSlug) : CITIES;
  return [...cities].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  return CITIES.find((city) => city.slug === slug) ?? null;
}

export async function getLatestRates(date = toISODate()): Promise<EggRate[]> {
  return CITIES.map((city) => rateFor(city, date));
}

export async function getRateForCity(
  citySlug: string,
  date = toISODate(),
): Promise<EggRate | null> {
  const city = await getCityBySlug(citySlug);
  return city ? rateFor(city, date) : null;
}

export async function getRateHistory(citySlug: string, days = 30): Promise<RatePoint[]> {
  return historyFor(citySlug, days);
}

export async function paginateRates(
  page = 1,
  pageSize = 25,
  date = toISODate(),
): Promise<Paginated<EggRate>> {
  const all = await getLatestRates(date);
  const start = (page - 1) * pageSize;
  return { items: all.slice(start, start + pageSize), page, pageSize, total: all.length };
}

export async function searchRegions(query: string, limit = 8): Promise<SearchResult[]> {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const states: SearchResult[] = STATES.filter((state) =>
    state.name.toLowerCase().includes(term),
  ).map((state) => ({
    type: "state",
    slug: state.slug,
    label: state.name,
    sublabel: "State",
    href: `/states/${state.slug}`,
  }));

  const cities: SearchResult[] = CITIES.filter((city) =>
    city.name.toLowerCase().includes(term),
  ).map((city) => ({
    type: "city",
    slug: city.slug,
    label: city.name,
    sublabel: city.stateName,
    href: `/city/${city.slug}`,
  }));

  return [...states, ...cities].slice(0, limit);
}

/** Every indexable path, used by the sitemap route. */
export async function listIndexablePaths(): Promise<string[]> {
  return [
    "/",
    "/states",
    "/cities",
    "/trends",
    ...STATES.map((state) => `/states/${state.slug}`),
    ...CITIES.map((city) => `/city/${city.slug}`),
  ];
}