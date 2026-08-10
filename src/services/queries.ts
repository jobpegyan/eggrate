/** TanStack Query option factories — the single source of cache keys. */
import { queryOptions } from "@tanstack/react-query";

import {
  fetchCities,
  fetchCity,
  fetchCityRate,
  fetchLatestRates,
  fetchRateHistory,
  fetchState,
  fetchStates,
  searchPlaces,
} from "@/services/rates.functions";

export const queryKeys = {
  states: ["states"] as const,
  state: (slug: string) => ["state", slug] as const,
  cities: (stateSlug?: string) => ["cities", stateSlug ?? "all"] as const,
  city: (slug: string) => ["city", slug] as const,
  latestRates: ["rates", "latest"] as const,
  cityRate: (slug: string) => ["rates", "city", slug] as const,
  rateHistory: (slug: string, days: number) => ["rates", "history", slug, days] as const,
  search: (query: string) => ["search", query] as const,
};

const FIVE_MINUTES = 5 * 60 * 1000;

export const statesQuery = () =>
  queryOptions({ queryKey: queryKeys.states, queryFn: () => fetchStates(), staleTime: FIVE_MINUTES });

export const stateQuery = (slug: string) =>
  queryOptions({
    queryKey: queryKeys.state(slug),
    queryFn: () => fetchState({ data: { slug } }),
    staleTime: FIVE_MINUTES,
  });

export const citiesQuery = (stateSlug?: string) =>
  queryOptions({
    queryKey: queryKeys.cities(stateSlug),
    queryFn: () => fetchCities({ data: stateSlug ? { stateSlug } : {} }),
    staleTime: FIVE_MINUTES,
  });

export const cityQuery = (slug: string) =>
  queryOptions({
    queryKey: queryKeys.city(slug),
    queryFn: () => fetchCity({ data: { slug } }),
    staleTime: FIVE_MINUTES,
  });

export const latestRatesQuery = () =>
  queryOptions({
    queryKey: queryKeys.latestRates,
    queryFn: () => fetchLatestRates(),
    staleTime: FIVE_MINUTES,
  });

export const cityRateQuery = (slug: string) =>
  queryOptions({
    queryKey: queryKeys.cityRate(slug),
    queryFn: () => fetchCityRate({ data: { slug } }),
    staleTime: FIVE_MINUTES,
  });

export const rateHistoryQuery = (slug: string, days = 30) =>
  queryOptions({
    queryKey: queryKeys.rateHistory(slug, days),
    queryFn: () => fetchRateHistory({ data: { slug, days } }),
    staleTime: FIVE_MINUTES,
  });

export const searchQuery = (query: string) =>
  queryOptions({
    queryKey: queryKeys.search(query),
    queryFn: () => searchPlaces({ data: { query } }),
    enabled: query.trim().length > 0,
    staleTime: FIVE_MINUTES,
  });