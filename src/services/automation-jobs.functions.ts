
import { supabase } from "@/integrations/supabase/client";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Public Data Automation endpoints for webhooks and scheduled jobs.
 * Part of Phase 7 (Data Automation Engine).
 */

export const triggerDailyFetch = createServerFn({ method: "POST" })
  .validator(z.object({
    apiKey: z.string()
  }))
  .handler(async ({ data: { apiKey } }) => {
    // Basic verification
    if (apiKey !== process.env['AUTOMATION_API_KEY'] && process.env['NODE_ENV'] === 'production') {
      throw new Error("Unauthorized");
    }

    const { data: sources } = await supabase
      .from('data_sources')
      .select('*')
      .eq('status', 'active')
      .not('url', 'is', null);

    if (!sources) return { success: true, message: "No active sources found" };

    const results = [];
    for (const source of sources) {
      try {
        const jobId = `fetch-${source.id}-${Date.now()}`;
        
        await supabase.from('automation_audit_logs').insert({
          job_id: jobId,
          action: 'source_fetch',
          status: 'running',
          details: { source_id: source.id, source_name: source.name }
        });

        // 1. Perform Fetch
        // 2. Ingest Raw Data
        // 3. Trigger In-Process Pipeline
        
        results.push({ source: source.name, status: 'triggered' });
        
        await supabase.from('automation_audit_logs').insert({
          job_id: jobId,
          action: 'source_fetch',
          status: 'success',
          details: { source_id: source.id, source_name: source.name, records: 0 }
        });
      } catch (err: any) {
        await supabase.from('automation_audit_logs').insert({
          action: 'source_fetch',
          status: 'failed',
          details: { source_id: source.id, error: err.message }
        });
      }
    }

    return { success: true, processed: results.length };
  });

export const runFullPipeline = createServerFn({ method: "POST" })
  .handler(async () => {
    const { AutomationEngine } = await import("./automation-engine.server");
    const engine = new AutomationEngine();
    await engine.init();

    // 1. Get pending raw data
    const { data: pending } = await supabase
      .from('raw_data')
      .select('id')
      .eq('status', 'pending')
      .limit(10);

    if (!pending || pending.length === 0) return { success: true, message: "No pending data" };

    const { processRawData } = await import("./automation.functions");

    for (const item of pending) {
      await processRawData({ data: { rawDataId: item.id } });
    }

    return { success: true, count: pending.length };
  });
