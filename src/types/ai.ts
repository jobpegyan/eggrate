import { z } from "zod";

export const InsightType = z.enum([
  'daily_summary',
  'price_movement',
  'city_analysis',
  'state_analysis',
  'national_analysis',
  'weekly_summary',
  'monthly_summary',
  'trend_detection',
  'anomaly_explanation',
  'data_quality'
]);

export const InsightConfidence = z.enum(['low', 'medium', 'high']);
export const InsightStatus = z.enum(['draft', 'review', 'published', 'archived']);

export interface MarketInsight {
  id: string;
  type: z.infer<typeof InsightType>;
  scope: 'national' | 'state' | 'city';
  stateId?: string;
  cityId?: string;
  analysisDate: string;
  title: string;
  summary?: string;
  content: string;
  confidence: z.infer<typeof InsightConfidence>;
  confidenceReason?: string;
  sourceDataIds?: string[];
  status: z.infer<typeof InsightStatus>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AIProviderConfig {
  id: string;
  providerName: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  priority: number;
  isActive: boolean;
  config: Record<string, any>;
}

export interface AIUsageStats {
  providerName: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  requestCount: number;
  successCount: number;
  failureCount: number;
}
