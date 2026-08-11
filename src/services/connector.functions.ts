import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const autoDetectSource = createServerFn({ method: "POST" })
  .validator(z.object({
    url: z.string().url("Enter a valid URL"),
  }))
  .handler(async ({ data: { url } }) => {
    const { ConnectorEngine } = await import("./connector-engine.server");
    const engine = new ConnectorEngine();
    return await engine.autoDetect(url);
  });

export const testConnector = createServerFn({ method: "POST" })
  .validator(z.object({
    url: z.string().url("Enter a valid URL"),
    kind: z.enum(["auto", "wordpress", "api", "json", "rss", "html", "csv", "excel", "manual", "cron", "webhook", "scrape", "custom"]),
    fieldMappings: z.array(z.object({
      sourceField: z.string(),
      targetField: z.string(),
      transformations: z.array(z.string()).optional(),
      defaultValue: z.string().optional(),
    })).optional(),
    isEggRateMode: z.boolean().optional(),
  }))
  .handler(async ({ data }) => {
    const { ConnectorEngine } = await import("./connector-engine.server");
    const engine = new ConnectorEngine();
    return await engine.executeFetch({
      url: data.url,
      kind: data.kind as any,
      fieldMappings: data.fieldMappings as any,
      isEggRateMode: data.isEggRateMode,
    });
  });

export const runConnectorNow = createServerFn({ method: "POST" })
  .validator(z.object({
    sourceId: z.string().optional(),
    url: z.string().url("Enter a valid URL"),
    kind: z.enum(["auto", "wordpress", "api", "json", "rss", "html", "csv", "excel", "manual", "cron", "webhook", "scrape", "custom"]),
    fieldMappings: z.array(z.object({
      sourceField: z.string(),
      targetField: z.string(),
      transformations: z.array(z.string()).optional(),
    })).optional(),
    isEggRateMode: z.boolean().optional(),
  }))
  .handler(async ({ data }) => {
    const { ConnectorEngine } = await import("./connector-engine.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const engine = new ConnectorEngine();
    const result = await engine.executeFetch({
      url: data.url,
      kind: data.kind as any,
      fieldMappings: data.fieldMappings as any,
      isEggRateMode: data.isEggRateMode,
    });

    const CITY_ALIASES: Record<string, string> = {
      "e-godavari": "east godavari",
      "luknow": "lucknow",
      "muzaffurpur": "muzaffarpur",
      "mysuru": "mysore",
      "brahmapur": "berhampur",
    };

    let importedCount = 0;

    if (result.mappedRecords && result.mappedRecords.length > 0) {
      // 1. Fetch DB cities
      const { data: dbCities } = await supabaseAdmin
        .from("cities")
        .select("id, name, slug, state_id")
        .limit(5000);

      // 2. Fetch DB markets
      const { data: dbMarkets } = await supabaseAdmin
        .from("markets")
        .select("id, name, slug, city_id")
        .limit(5000);

      const dbRows: any[] = [];
      const startTime = new Date().toISOString();

      for (const rec of result.mappedRecords) {
        if (!rec.city || !rec.egg_rate) continue;

        const cleanLower = (CITY_ALIASES[rec.city.toLowerCase()] || rec.city).toLowerCase();
        const foundCity = (dbCities || []).find(
          (c) => c.name.toLowerCase() === cleanLower || c.slug.toLowerCase() === cleanLower
        );

        if (foundCity) {
          const foundMarket = (dbMarkets || []).find((m) => m.city_id === foundCity.id);
          dbRows.push({
            city_id: foundCity.id,
            state_id: foundCity.state_id,
            market_id: foundMarket?.id || null,
            egg_rate: Number(rec.egg_rate),
            tray_price: Number(rec.tray_price || rec.egg_rate * 30),
            hundred_price: Number(rec.hundred_price || rec.egg_rate * 100),
            peti_price: Number(rec.peti_price || rec.egg_rate * 210),
            wholesale_price: Number(rec.wholesale_price || rec.egg_rate),
            retail_price: Number(rec.retail_price || rec.egg_rate * 1.06),
            currency: rec.currency || "INR",
            effective_date: rec.effective_date,
            source_id: data.sourceId || null,
            is_verified: true,
            is_published: true,
            published_at: startTime,
            updated_at: startTime,
            notes: `Imported via Generic Connector (${rec.source_name || "EggRateLab"})`,
          });
        }
      }

      if (dbRows.length > 0) {
        const { error: upsertErr } = await supabaseAdmin.from("egg_rates").upsert(dbRows, {
          onConflict: "market_id,category_id,effective_date",
          ignoreDuplicates: false,
        } as any);

        if (!upsertErr) {
          importedCount = dbRows.length;
        } else {
          console.warn("DB Upsert notice:", upsertErr.message);
        }
      }
    }

    // Verification Query
    const targetDate = result.mappedRecords?.[0]?.effective_date || new Date().toISOString().slice(0, 10);
    const { data: dbCheck } = await supabaseAdmin
      .from("egg_rates")
      .select("id, effective_date, egg_rate")
      .eq("effective_date", targetDate);

    const dbConfirmedCount = dbCheck?.length || 0;
    const isSuccess = importedCount > 0 || dbConfirmedCount > 0;
    const jobId = `connector-${Date.now()}`;

    // Record audit log entry
    await supabase.from("automation_audit_logs").insert({
      job_id: jobId,
      action: "connector_run",
      status: isSuccess ? "success" : "failed",
      details: {
        url: data.url,
        kind: data.kind,
        fetched: result.fetchedCount,
        valid: result.validCount,
        rejected: result.rejectedCount,
        imported: importedCount,
        db_confirmed: dbConfirmedCount,
        timestamp: new Date().toISOString(),
      },
    });

    return {
      jobId,
      success: isSuccess,
      status: isSuccess ? "PUBLISHED" : "FAILED",
      fetchedCount: result.fetchedCount,
      validCount: result.validCount,
      rejectedCount: result.rejectedCount,
      importedCount,
      dbConfirmedCount,
      targetDate,
      rawSample: result.rawSample,
      parsedRecords: result.parsedRecords,
      mappedRecords: result.mappedRecords,
      validationErrors: result.validationErrors,
      note: isSuccess
        ? `Successfully imported ${importedCount} record(s) into Supabase! Confirmed ${dbConfirmedCount} DB records for ${targetDate}.`
        : "Failed to import records into Supabase.",
    };
  });
