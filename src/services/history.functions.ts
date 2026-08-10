import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import * as historyService from "./history.server";

export const getHistorySummaryQuery = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({
    type: z.enum(["national", "state", "city"]),
    slug: z.string().optional(),
    date: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    return historyService.getHistorySummary(data.type, data.slug, data.date);
  });

export const getHistoricalRatesQuery = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({
    type: z.enum(["national", "state", "city"]),
    slug: z.string().optional(),
    days: z.number().optional().default(30)
  }).parse(data))
  .handler(async ({ data }) => {
    return historyService.getHistoricalRates(data.type, data.slug, data.days);
  });

export const getComparisonQuery = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({
    items: z.array(z.object({
      type: z.enum(["national", "state", "city"]),
      slug: z.string().optional()
    })),
    days: z.number().optional().default(30)
  }).parse(data))
  .handler(async ({ data }) => {
    return historyService.getComparison(data.items, data.days);
  });

export const getNationalMoversQuery = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({
    limit: z.number().optional().default(10)
  }).parse(data))
  .handler(async ({ data }) => {
    return historyService.getNationalMovers(data.limit);
  });

export const getCoverageStatsQuery = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({
    date: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    return historyService.getCoverageStats(data.date);
  });
