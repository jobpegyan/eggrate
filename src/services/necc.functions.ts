import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCurrentDate } from "@/lib/date-system";

export const testNECCConnection = createServerFn({ method: "POST" })
  .validator(
    z.object({
      year: z.number().optional(),
      month: z.number().optional(),
    }).optional()
  )
  .handler(async ({ data }) => {
    const { NECCConnectorEngine } = await import("./necc-connector.server");
    const engine = new NECCConnectorEngine();

    const now = new Date();
    const year = data?.year || now.getFullYear();
    const month = data?.month || now.getMonth() + 1;

    return await engine.fetchNECCMonth(year, month);
  });

export const fetchNECCRatesNow = createServerFn({ method: "POST" })
  .handler(async () => {
    const { NECCConnectorEngine } = await import("./necc-connector.server");
    const engine = new NECCConnectorEngine();
    return await engine.fetchCurrentNECCRates();
  });

export const importNECCMonthHistorical = createServerFn({ method: "POST" })
  .validator(
    z.object({
      year: z.number().min(2020).max(2030),
      month: z.number().min(1).max(12),
    })
  )
  .handler(async ({ data: { year, month } }) => {
    const { NECCConnectorEngine } = await import("./necc-connector.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const engine = new NECCConnectorEngine();
    const monthResult = await engine.fetchNECCMonth(year, month);

    if (!monthResult.success || monthResult.parsedRecords.length === 0) {
      return {
        success: false,
        importedCount: 0,
        note: monthResult.validationErrors[0] || "No records found for specified month/year",
      };
    }

    const { data: dbCities } = await supabaseAdmin.from("cities").select("id, name, slug, state_id").limit(5000);
    const { data: dbMarkets } = await supabaseAdmin.from("markets").select("id, name, slug, city_id").limit(5000);

    const dbRows: any[] = [];
    const startTime = new Date().toISOString();

    for (const rec of monthResult.parsedRecords) {
      const cleanLower = rec.mappedCity?.toLowerCase() || rec.centre.toLowerCase();
      const foundCity = (dbCities || []).find((c) => c.name.toLowerCase() === cleanLower || c.slug.toLowerCase() === cleanLower);

      if (foundCity) {
        const foundMarket = (dbMarkets || []).find((m) => m.city_id === foundCity.id);
        dbRows.push({
          city_id: foundCity.id,
          state_id: foundCity.state_id,
          market_id: foundMarket?.id || null,
          egg_rate: rec.egg_rate,
          tray_price: rec.tray_price,
          hundred_price: rec.hundred_price,
          peti_price: rec.peti_price,
          wholesale_price: rec.egg_rate,
          retail_price: Number((rec.egg_rate * 1.06).toFixed(2)),
          currency: "INR",
          effective_date: rec.rate_date,
          is_verified: true,
          is_published: true,
          published_at: startTime,
          updated_at: startTime,
          notes: `Historical Official NECC Suggested Rate (${rec.centre})`,
        });
      }
    }

    let importedCount = 0;
    if (dbRows.length > 0) {
      const { error: upsertErr } = await supabaseAdmin.from("egg_rates").upsert(dbRows, {
        onConflict: "market_id,category_id,effective_date",
        ignoreDuplicates: false,
      } as any);

      if (!upsertErr) {
        importedCount = dbRows.length;
      }
    }

    return {
      success: importedCount > 0,
      year,
      month,
      parsedCount: monthResult.parsedRecords.length,
      importedCount,
      coveragePercent: monthResult.coveragePercent,
      note: `Successfully imported ${importedCount} historical daily records for ${month}/${year}.`,
    };
  });

export const getNECCStatus = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const todayStr = getCurrentDate();

    const { data: logs } = await supabaseAdmin
      .from("automation_audit_logs")
      .select("id, status, details, created_at")
      .eq("action", "necc_rate_update")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: todayCount } = await supabaseAdmin
      .from("egg_rates")
      .select("id", { count: "exact", head: true })
      .eq("effective_date", todayStr);

    const lastLog = logs?.[0];

    return {
      connected: true,
      lastFetch: lastLog?.created_at || null,
      lastStatus: lastLog?.status || "idle",
      todayDate: todayStr,
      todayRecordsCount: todayCount || 0,
      recentLogs: logs || [],
    };
  });
