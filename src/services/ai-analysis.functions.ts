import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getMarketInsight, getAIUsageStats } from "./ai-analysis.server";
import { InsightType } from "@/types/ai";

export const getMarketInsightQuery = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({
    type: InsightType,
    scope: z.enum(['national', 'state', 'city']),
    slug: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    return getMarketInsight(data.type, data.scope, data.slug);
  });

export const generateMarketInsightMutation = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({
    type: InsightType,
    scope: z.enum(['national', 'state', 'city']),
    slug: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    const { generateMarketInsight } = await import("./ai-analysis.server");
    return generateMarketInsight(data.type, data.scope, data.slug);
  });

export const getAIUsageStatsQuery = createServerFn({ method: "GET" })
  .handler(async () => {
    return getAIUsageStats();
  });
