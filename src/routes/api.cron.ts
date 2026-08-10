import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/api/cron")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return handleCron(request);
      },
      POST: async ({ request }) => {
        return handleCron(request);
      },
    },
  },
});

async function handleCron(request: Request) {
  const url = new URL(request.url);
  const keyParam = url.searchParams.get("key");
  const authHeader = request.headers.get("authorization");

  const expectedSecret = process.env["CRON_SECRET"] || process.env["AUTOMATION_API_KEY"];

  if (expectedSecret && keyParam !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: Invalid key" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { data: sources } = await supabase
      .from("data_sources")
      .select("id, name")
      .eq("status", "active");

    const jobId = `cron-${Date.now()}`;

    await supabase.from("automation_audit_logs").insert({
      job_id: jobId,
      action: "cron_trigger",
      status: "success",
      details: {
        sourcesCount: sources?.length || 0,
        triggeredAt: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Cron job executed successfully",
        jobId,
        activeSources: sources?.length || 0,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to run cron job",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
