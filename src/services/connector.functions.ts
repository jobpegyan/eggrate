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
    kind: z.enum(["auto", "wordpress", "api", "json", "rss", "html", "csv", "custom"]),
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
    kind: z.enum(["auto", "wordpress", "api", "json", "rss", "html", "csv", "custom"]),
    fieldMappings: z.array(z.object({
      sourceField: z.string(),
      targetField: z.string(),
      transformations: z.array(z.string()).optional(),
    })).optional(),
    isEggRateMode: z.boolean().optional(),
  }))
  .handler(async ({ data }) => {
    const { ConnectorEngine } = await import("./connector-engine.server");
    const engine = new ConnectorEngine();
    const result = await engine.executeFetch({
      url: data.url,
      kind: data.kind as any,
      fieldMappings: data.fieldMappings as any,
      isEggRateMode: data.isEggRateMode,
    });

    const jobId = `connector-${Date.now()}`;

    // Record audit log entry
    await supabase.from("automation_audit_logs").insert({
      job_id: jobId,
      action: "connector_run",
      status: result.success ? "success" : "failed",
      details: {
        url: data.url,
        kind: data.kind,
        fetched: result.fetchedCount,
        valid: result.validCount,
        rejected: result.rejectedCount,
        timestamp: new Date().toISOString(),
      },
    });

    return {
      jobId,
      ...result,
    };
  });
