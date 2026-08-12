/**
 * API endpoint to seed all India states, cities, and markets.
 * Call POST /api/seed-india to populate the database.
 * Idempotent — safe to call multiple times.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/seed-india")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const { seedAllIndiaData } = await import("@/services/seed.server");
          const result = await seedAllIndiaData();

          return new Response(JSON.stringify(result, null, 2), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
