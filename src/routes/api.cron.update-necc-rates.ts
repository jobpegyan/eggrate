import { createFileRoute } from "@tanstack/react-router";
import { NECCConnectorEngine } from "@/services/necc-connector.server";

export const Route = createFileRoute("/api/cron/update-necc-rates")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const engine = new NECCConnectorEngine();
          const result = await engine.fetchCurrentNECCRates();
          return new Response(
            JSON.stringify({
              success: result.success,
              status: result.success ? "PUBLISHED" : "FAILED",
              date: result.date,
              importedCount: result.importedCount,
              dbConfirmedCount: result.dbConfirmedCount,
              coveragePercent: result.coveragePercent,
              note: result.note,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({
              success: false,
              status: "ERROR",
              error: err.message || "Failed to execute NECC rate cron",
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      },
    },
  },
});
