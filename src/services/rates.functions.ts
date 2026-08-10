/**
 * Public read API. Thin server functions only — all logic lives in the
 * database layer so these stay safe to split into the client graph.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  getCityBySlug,
  getLatestRates,
  getRateForCity,
  getRateHistory,
  getStateBySlug,
  listCities,
  listStates,
  paginateRates,
  searchRegions,
} from "@/database/queries";

const slugSchema = z.object({ slug: z.string().min(1).max(80) });

export const fetchStates = createServerFn({ method: "GET" }).handler(() => listStates());

export const fetchCities = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ stateSlug: z.string().min(1).max(80).optional() }).parse(data ?? {}),
  )
  .handler(({ data }) => listCities(data.stateSlug));

export const fetchState = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => slugSchema.parse(data))
  .handler(({ data }) => getStateBySlug(data.slug));

export const fetchCity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => slugSchema.parse(data))
  .handler(({ data }) => getCityBySlug(data.slug));

export const fetchLatestRates = createServerFn({ method: "GET" }).handler(() => getLatestRates());

export const fetchCityRate = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => slugSchema.parse(data))
  .handler(({ data }) => getRateForCity(data.slug));

export const fetchRateHistory = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ slug: z.string().min(1).max(80), days: z.number().int().min(7).max(365).optional() }).parse(data),
  )
  .handler(({ data }) => getRateHistory(data.slug, data.days ?? 30));

export const fetchRatesPage = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z
      .object({ page: z.number().int().min(1).optional(), pageSize: z.number().int().min(1).max(100).optional() })
      .parse(data ?? {}),
  )
  .handler(({ data }) => paginateRates(data.page ?? 1, data.pageSize ?? 25));

export const searchPlaces = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ query: z.string().max(80) }).parse(data))
  .handler(({ data }) => searchRegions(data.query));