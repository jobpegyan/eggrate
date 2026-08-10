import { z } from "zod";

export const automationJobStatusSchema = z.enum([
  "pending",
  "running",
  "completed",
  "partially_completed",
  "failed",
  "cancelled",
]);

export type AutomationJobStatus = z.infer<typeof automationJobStatusSchema>;

export const sourcePrioritySchema = z.coerce.number().int().min(1).max(10);

export const automationSettingsSchema = z.object({
  anomalyThresholdPercent: z.number().min(0).max(100).default(15),
  maxDailyPriceChange: z.number().min(0).default(2), // INR
  maxStaleDurationDays: z.number().int().min(1).default(3),
  autoPublishVerified: z.boolean().default(true),
  autoPublishBelowThreshold: z.boolean().default(false),
  petiSizeDefault: z.number().int().min(1).default(210),
  retryMaxAttempts: z.number().int().min(0).default(3),
  retryBackoffMs: z.number().int().min(1000).default(5000),
});

export type AutomationSettings = z.infer<typeof automationSettingsSchema>;

export const rawDataStatusSchema = z.enum(["pending", "processed", "failed", "ignored"]);

export const dataQualityLevelSchema = z.enum(["excellent", "good", "warning", "poor"]);

export interface NormalizedRate {
  stateName: string;
  cityName: string;
  marketName?: string;
  eggRate: number;
  effectiveDate: string;
  sourceId: string;
  unit: string;
  currency: string;
  petiSize?: number;
}

export const anomalyRuleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string().optional(),
  condition: z.string(), // SQL or logic description
  threshold: z.number(),
  isActive: z.boolean().default(true),
});

export type AnomalyRule = z.infer<typeof anomalyRuleSchema>;
