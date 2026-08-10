/** Query option factories for the public site. */
import { queryOptions } from "@tanstack/react-query";

import {
  fetchAdSlots,
  fetchArticle,
  fetchArticles,
  fetchHomepage,
  fetchCityPage,
  fetchCitySlugs,
  fetchStatePage,
  fetchStateSlugs,
  fetchStaticPage,
  fetchRegionHistory,
  searchPublic,
} from "@/services/public.functions";

const FIVE_MINUTES = 5 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

export const publicKeys = {
  homepage: ["public", "homepage"] as const,
  adSlots: ["public", "ad-slots"] as const,
  articles: (limit: number) => ["public", "articles", limit] as const,
  article: (slug: string) => ["public", "article", slug] as const,
  page: (slug: string) => ["public", "page", slug] as const,
  city: (slug: string) => ["public", "city", slug] as const,
  citySlugs: ["public", "city-slugs"] as const,
  state: (slug: string) => ["public", "state", slug] as const,
  stateSlugs: ["public", "state-slugs"] as const,
  search: (query: string) => ["public", "search", query] as const,
};

export const homepageQuery = () =>
  queryOptions({
    queryKey: publicKeys.homepage,
    queryFn: () => fetchHomepage(),
    staleTime: FIVE_MINUTES,
  });

export const adSlotsQuery = () =>
  queryOptions({
    queryKey: publicKeys.adSlots,
    queryFn: () => fetchAdSlots(),
    staleTime: HOUR,
  });

export const articlesQuery = (limit = 12) =>
  queryOptions({
    queryKey: publicKeys.articles(limit),
    queryFn: () => fetchArticles({ data: { limit } }),
    staleTime: HOUR,
  });

export const articleQuery = (slug: string) =>
  queryOptions({
    queryKey: publicKeys.article(slug),
    queryFn: () => fetchArticle({ data: { slug } }),
    staleTime: HOUR,
  });

export const staticPageQuery = (slug: string) =>
  queryOptions({
    queryKey: publicKeys.page(slug),
    queryFn: () => fetchStaticPage({ data: { slug } }),
    staleTime: HOUR,
  });

export const statePageQuery = (slug: string) =>
  queryOptions({
    queryKey: publicKeys.state(slug),
    queryFn: () => fetchStatePage({ data: { slug } }),
    staleTime: FIVE_MINUTES,
  });

export const stateSlugsQuery = () =>
  queryOptions({
    queryKey: publicKeys.stateSlugs,
    queryFn: () => fetchStateSlugs(),
    staleTime: HOUR,
  });

export const cityPageQuery = (slug: string) =>
  queryOptions({
    queryKey: publicKeys.city(slug),
    queryFn: () => fetchCityPage({ data: { slug } }),
    staleTime: FIVE_MINUTES,
  });

export const citySlugsQuery = () =>
  queryOptions({
    queryKey: publicKeys.citySlugs,
    queryFn: () => fetchCitySlugs(),
    staleTime: HOUR,
  });

export const publicSearchQuery = (query: string) =>
  queryOptions({
    queryKey: publicKeys.search(query),
    queryFn: () => searchPublic({ data: { query } }),
    enabled: query.trim().length > 0,
    staleTime: FIVE_MINUTES,
  });

export const regionHistoryQuery = (type: "national" | "state" | "city", slug?: string, days = 30) =>
  queryOptions({
    queryKey: [...publicKeys.homepage, "history", type, slug, days],
    queryFn: () => fetchRegionHistory({ data: { type, slug, days } }),
    staleTime: FIVE_MINUTES,
  });
