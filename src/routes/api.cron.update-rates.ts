import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentDate } from "@/lib/date-system";

export const Route = createFileRoute("/api/cron/update-rates")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return handleCronRequest(request);
      },
      POST: async ({ request }) => {
        return handleCronRequest(request);
      },
    },
  },
});

async function handleCronRequest(request: Request) {
  const url = new URL(request.url);
  const keyParam = url.searchParams.get("key");
  const authHeader = request.headers.get("authorization");

  const expectedSecret = process.env["CRON_SECRET"] || process.env["AUTOMATION_API_KEY"];

  if (expectedSecret && keyParam !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: Invalid cron key" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { AutomationEngine } = await import("@/services/automation-engine.server");
    const engine = new AutomationEngine();
    const result = await engine.executeFullPipeline();

    const dateStr = getCurrentDate();
    const isSuccess = result.status === "PUBLISHED" || result.status === "PARTIAL";

    const responsePayload = {
      success: isSuccess,
      date: dateStr,
      status: result.status,
      fetched: result.recordsProcessed,
      published: result.recordsPublished,
      failed: result.status === "FAILED" ? 1 : 0,
      coveragePercent: result.coveragePercent,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(responsePayload), {
      status: isSuccess ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        date: getCurrentDate(),
        error: error.message || "Cron execution failed",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
