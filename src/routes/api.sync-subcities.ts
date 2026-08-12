/**
 * API endpoint to trigger sub-city egg rate sync from main cities.
 * Safe to call via GET or POST.
 */
import { createFileRoute } from "@tanstack/react-router";

async function handleSync() {
  try {
    const { syncSubCityRatesFromMainCities } = await import("@/services/subcity-sync.server");
    const result = await syncSubCityRatesFromMainCities();

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const Route = createFileRoute("/api/sync-subcities")({
  server: {
    handlers: {
      GET: handleSync,
      POST: handleSync,
    },
  },
});
