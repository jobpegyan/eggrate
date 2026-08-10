import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { 
  getHistorySummary, 
  getHistoricalRates, 
  getNationalMovers, 
  getCoverageStats 
} from "./history.server";
import type { MarketInsight, AIUsageStats } from "@/types/ai";
import { z } from "zod";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

/**
 * AI Market Analysis Service
 */

// Helper to get formatted data for AI prompt
async function getMarketContext(scope: 'national' | 'state' | 'city', slug?: string) {
  const [current, history7, movers, coverage] = await Promise.all([
    getHistorySummary(scope, slug),
    getHistoricalRates(scope, slug, 7),
    getNationalMovers(5),
    getCoverageStats()
  ]);

  return {
    current,
    history7,
    movers,
    coverage,
    timestamp: new Date().toISOString()
  };
}

export async function getMarketInsight(
  type: MarketInsight['type'],
  scope: MarketInsight['scope'],
  slug?: string
): Promise<MarketInsight | null> {
  let query = supabase
    .from('ai_market_insights')
    .select('*')
    .eq('type', type)
    .eq('scope', scope)
    .eq('status', 'published')
    .order('analysis_date', { ascending: false })
    .limit(1);

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;

  return {
    id: data.id,
    type: data.type as any,
    scope: data.scope as any,
    stateId: data.state_id ?? undefined,
    cityId: data.city_id ?? undefined,
    analysisDate: data.analysis_date,
    title: data.title,
    summary: data.summary ?? undefined,
    content: data.content,
    confidence: data.confidence as any,
    confidenceReason: data.confidence_reason ?? undefined,
    sourceDataIds: data.source_data_ids ?? undefined,
    status: data.status as any,
    metadata: (data.metadata as Record<string, any>) || {},
    createdAt: data.created_at ?? new Date().toISOString(),
    updatedAt: data.updated_at ?? new Date().toISOString()
  };
}

export async function generateMarketInsight(
  type: MarketInsight['type'],
  scope: MarketInsight['scope'],
  slug?: string
) {
  const context = await getMarketContext(scope, slug);
  const apiKey = process.env['DEEPSEEK_API_KEY'];

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const prompt = `
You are an expert Indian Egg Market Analyst for the "EggRateToday" platform.
Analyze the following market data and provide a detailed report in Markdown format.

MARKET CONTEXT:
Scope: ${scope} ${slug ? `(${slug})` : ''}
Analysis Type: ${type}
Current Snapshot: ${JSON.stringify(context.current)}
7-Day History: ${JSON.stringify(context.history7)}
Market Movers: ${JSON.stringify(context.movers)}
Data Coverage: ${JSON.stringify(context.coverage)}
Generated At: ${context.timestamp}

REQUIREMENTS:
 1. Provide a professional Title.
 2. Structure the content using Markdown (headers, lists, bold text).
 3. Use Markdown Tables for data comparisons (e.g., current vs previous rates).
 4. Be factual. Mention specific price changes and percentages from the data.
 5. Identify regional trends (e.g., "South India showing volatility").
 6. Provide a confidence score (low, medium, or high) based on data coverage.
 7. Conclude with a "Weekly Outlook".
7. Focus on transparency.

RESPONSE FORMAT (JSON):
{
  "title": "Report Title",
  "content": "Markdown content here...",
  "confidence": "high" | "medium" | "low",
  "confidenceReason": "Why this confidence score?"
}
`;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a professional market analyst." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("DeepSeek API error:", errorText);
    throw new Error(`AI generation failed: ${response.statusText}`);
  }

  const result = await response.json();
  const choice = result.choices[0]?.message?.content;
  
  if (!choice) throw new Error("Empty response from AI");
  
  const parsed = JSON.parse(choice);

  // Store in DB - using admin client because the server function handles its own validation
  // and needs to bypass the 'Admins only' insert policy for the service role
  const { data: inserted, error } = await supabaseAdmin
    .from('ai_market_insights')
    .insert({
      type,
      scope,
      title: parsed.title,
      content: parsed.content,
      confidence: parsed.confidence,
      confidence_reason: parsed.confidenceReason,
      analysis_date: new Date().toISOString().slice(0, 10),
      status: 'published',
      metadata: {
        model: 'deepseek-chat',
        usage: result.usage
      }
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to store insight:", error);
    throw error;
  }

  // Log usage
  await supabaseAdmin.from('ai_usage_logs').insert({
    model: 'deepseek-chat',
    prompt_tokens: result.usage.prompt_tokens,
    completion_tokens: result.usage.completion_tokens,
    estimated_cost: (result.usage.prompt_tokens * 0.0001 + result.usage.completion_tokens * 0.0002) / 1000, // Dummy pricing for DeepSeek
    status: 'success'
  });

  return inserted;
}

export async function getAIUsageStats(): Promise<AIUsageStats[]> {
  const { data, error } = await supabase
    .from('ai_usage_logs')
    .select('model, prompt_tokens, completion_tokens, estimated_cost, status');

  if (error || !data) return [];

  const statsMap = new Map<string, AIUsageStats>();

  data.forEach(log => {
    const key = log.model;
    const existing = statsMap.get(key) || {
      providerName: 'Unknown',
      model: log.model,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimatedCost: 0,
      requestCount: 0,
      successCount: 0,
      failureCount: 0
    };

    existing.promptTokens += log.prompt_tokens;
    existing.completionTokens += log.completion_tokens;
    existing.totalTokens += (log.prompt_tokens + log.completion_tokens);
    existing.estimatedCost += log.estimated_cost;
    existing.requestCount += 1;
    if (log.status === 'success') existing.successCount += 1;
    else existing.failureCount += 1;

    statsMap.set(key, existing);
  });

  return Array.from(statsMap.values());
}
