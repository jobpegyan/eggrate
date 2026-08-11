
import { supabase } from "@/integrations/supabase/client";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { 
  automationSettingsSchema, 
  NormalizedRate 
} from "@/lib/automation-schemas";
import { createHash } from "crypto";

/**
 * Server functions for Data Automation Engine (Phase 7).
 */

// --- Settings Management ---

export const getAutomationSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from('automation_settings')
      .select('*');
    
    if (error) throw error;
    
    const settings: any = {};
    data.forEach(item => {
      settings[item.key] = item.value;
    });
    
    return automationSettingsSchema.parse(settings);
  });

export const updateAutomationSetting = createServerFn({ method: "POST" })
  .validator(z.object({
    key: z.string(),
    value: z.any()
  }))
  .handler(async ({ data: { key, value } }) => {
    const { error } = await supabase
      .from('automation_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    
    if (error) throw error;
    return { success: true };
  });

// --- Ingestion Pipeline ---

export const ingestRawData = createServerFn({ method: "POST" })
  .validator(z.object({
    sourceId: z.string().uuid(),
    payload: z.any(),
    requestId: z.string().optional()
  }))
  .handler(async ({ data: { sourceId, payload, requestId } }) => {
    const payloadStr = JSON.stringify(payload);
    const hash = createHash('sha256').update(payloadStr).digest('hex');
    
    const { data: existing } = await supabase
      .from('raw_data')
      .select('id')
      .eq('hash', hash)
      .eq('source_id', sourceId)
      .limit(1)
      .maybeSingle();
      
    if (existing) {
      return { status: 'duplicate', id: existing.id };
    }

    const { data, error } = await supabase
      .from('raw_data')
      .insert({
        source_id: sourceId,
        raw_payload: payload,
        hash,
        request_id: requestId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return { status: 'ingested', id: data.id };
  });

export const processRawData = createServerFn({ method: "POST" })
  .validator(z.object({
    rawDataId: z.string().uuid()
  }))
  .handler(async ({ data: { rawDataId } }) => {
    const { AutomationEngine } = await import("./automation-engine.server");
    const engine = new AutomationEngine();
    await engine.init();

    const { data: raw, error: fetchError } = await supabase
      .from('raw_data')
      .select('*, data_sources(*)')
      .eq('id', rawDataId)
      .single();
      
    if (fetchError || !raw) throw new Error("Raw data not found");

    try {
      const payload = raw.raw_payload as any;
      const processedRates: NormalizedRate[] = [];
      
      const items = Array.isArray(payload) ? payload : [payload];
      
      for (const item of items) {
        const normalized = await engine.processRate(item, raw.source_id!, rawDataId);
        if (normalized) {
          processedRates.push(normalized);
        }
      }

      // If we have processed rates, publish them if settings allow
      if (processedRates.length > 0) {
        // In a real scenario, we'd insert these into egg_rates table
        // For Phase 7, we just mark the raw data as processed
        await supabase
          .from('raw_data')
          .update({ status: 'processed' })
          .eq('id', rawDataId);
      } else {
        await supabase
          .from('raw_data')
          .update({ status: 'ignored' })
          .eq('id', rawDataId);
      }

      return { success: true, count: processedRates.length };
    } catch (err: any) {
      await supabase
        .from('raw_data')
        .update({ status: 'failed', error_message: err.message })
        .eq('id', rawDataId);
      throw err;
    }
  });

// --- Monitoring ---

export const getAutomationAuditLogs = createServerFn({ method: "GET" })
  .validator(z.object({
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0)
  }))
  .handler(async ({ data: { limit, offset } }) => {
    const { data, error, count } = await supabase
      .from('automation_audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    return { logs: data, total: count };
  });

export const getSourceHealth = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from('data_sources')
      .select(`
        id, 
        name, 
        kind, 
        status,
        raw_data(status, created_at)
      `)
      .order('name');
      
    if (error) throw error;
    
    return data.map(source => {
      const recent = source.raw_data as any[];
      const successCount = recent.filter(r => r.status === 'processed').length;
      const total = recent.length;
      const successRate = total > 0 ? (successCount / total) * 100 : 100;
      
      return {
        id: source.id,
        name: source.name,
        kind: source.kind,
        status: source.status,
        successRate: Math.round(successRate),
        lastFetch: recent[0]?.created_at || null
      };
    });
  });

export const resolveConflict = createServerFn({ method: "POST" })
  .validator(z.object({
    conflictId: z.string().uuid(),
    winnerSourceId: z.string().uuid().optional(), // If null, means 'ignore' or 'manual'
    resolutionMethod: z.string()
  }))
  .handler(async ({ data: { conflictId, winnerSourceId, resolutionMethod } }) => {
    const { data: conflict, error: fetchError } = await supabase
      .from('data_conflicts')
      .select('*')
      .eq('id', conflictId)
      .single();

    if (fetchError || !conflict) throw new Error("Conflict not found");

    // 1. Update the record in egg_rates if a winner is selected
    if (winnerSourceId) {
      const winnerRate = winnerSourceId === conflict.source_a ? conflict.rate_a : conflict.rate_b;
      
      if (conflict.city_id) {
        await supabase
          .from('egg_rates')
          .update({ 
            egg_rate: winnerRate as any,
            source_id: winnerSourceId,
            is_verified: true,
            verified_at: new Date().toISOString()
          })
          .eq('city_id', conflict.city_id)
          .eq('effective_date', conflict.date);
      }
    }

    // 2. Mark conflict as resolved
    const { error } = await supabase
      .from('data_conflicts')
      .update({
        resolved: true,
        resolution_method: resolutionMethod,
        resolved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', conflictId);

    if (error) throw error;
    return { success: true };
  });

export const triggerSyncPipeline = createServerFn({ method: "POST" })
  .validator(z.object({
    targetDate: z.string().optional(),
  }).optional())
  .handler(async ({ data }) => {
    const { AutomationEngine } = await import("./automation-engine.server");
    const engine = new AutomationEngine();
    return await engine.executeFullPipeline(data?.targetDate);
  });

export const getDiagnosticsData = createServerFn({ method: "GET" })
  .handler(async () => {
    const { getCurrentDate, getYesterdayDate } = await import("@/lib/date-system");
    const businessDate = getCurrentDate();
    const yesterdayDate = getYesterdayDate();

    // 1. Query active data sources
    const { data: sources, error: sourcesErr } = await supabase
      .from("data_sources")
      .select("id, name, kind, status, updated_at")
      .eq("status", "active");

    const connectedSourcesCount = sources?.length || 0;
    const isSourceConnected = connectedSourcesCount > 0;

    // 2. Query today's rate count & last published timestamp
    const { data: todayRates, count: todayPublishedCount } = await supabase
      .from("egg_rates")
      .select("id, published_at, updated_at", { count: "exact" })
      .eq("effective_date", businessDate)
      .eq("is_published", true);

    const lastPublishedTimestamp = todayRates?.[0]?.published_at || todayRates?.[0]?.updated_at || null;

    // 3. Query audit logs for last successful run
    const { data: lastLog } = await supabase
      .from("automation_audit_logs")
      .select("created_at, details, status")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      serverTime: new Date().toISOString(),
      indiaTime: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      businessDate,
      yesterdayDate,
      isSourceConnected,
      connectedSourcesCount,
      activeSources: sources || [],
      todayPublishedCount: todayPublishedCount || 0,
      lastPublishedTimestamp,
      lastLog,
      cronConfigured: true,
      cronEndpoint: "/api/cron/update-rates",
    };
  });
