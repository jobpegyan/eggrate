import { getCurrentDate, getCurrentDateTime, getYesterdayDate } from "@/lib/date-system";
import { validatePublicUrl } from "@/lib/security.server";

export interface NECCRecord {
  centre: string;
  mappedCity?: string;
  day: number;
  rate_date: string;
  raw_rate: number;
  egg_rate: number;
  tray_price: number;
  hundred_price: number;
  peti_price: number;
  unit: string;
  mapping_status: "MAPPED" | "UNMAPPED";
}

export interface NECCFetchResult {
  success: boolean;
  year: number;
  month: number;
  fetchedCount: number;
  validCount: number;
  unmappedCount: number;
  coveragePercent: number;
  parsedRecords: NECCRecord[];
  unmappedCentres: string[];
  validationErrors: string[];
  note?: string;
}

export const NECC_CENTRE_ALIASES: Record<string, string> = {
  "ahmedabad": "ahmedabad",
  "ajmer": "ajmer",
  "barwala": "barwala",
  "bengaluru (cc)": "bengaluru",
  "brahmapur (od)": "berhampur",
  "chennai (cc)": "chennai",
  "chittoor": "chittoor",
  "delhi (cc)": "delhi",
  "e.godavari": "east godavari",
  "hospet": "hospet",
  "hyderabad": "hyderabad",
  "jabalpur": "jabalpur",
  "kolkata (wb)": "kolkata",
  "ludhiana": "ludhiana",
  "mumbai (cc)": "mumbai",
  "mysuru": "mysore",
  "namakkal": "namakkal",
  "pune": "pune",
  "raipur": "raipur",
  "surat": "surat",
  "vijayawada": "vijayawada",
  "vizag": "visakhapatnam",
  "w.godavari": "west godavari",
  "warangal": "warangal",
  "allahabad (cc)": "allahabad",
  "bhopal": "bhopal",
  "indore (cc)": "indore",
  "kanpur (cc)": "kanpur",
  "luknow (cc)": "lucknow",
  "muzaffurpur (cc)": "muzaffarpur",
  "nagpur": "nagpur",
  "patna": "patna",
  "ranchi  (cc)": "ranchi",
  "ranchi (cc)": "ranchi",
  "varanasi (cc)": "varanasi",
};

export class NECCConnectorEngine {
  private readonly baseUrl = "https://www.e2necc.com/home/eggprice";

  /**
   * Fetches the official NECC monthly daily rate sheet for given year and month.
   */
  async fetchNECCMonth(year: number, month: number): Promise<NECCFetchResult> {
    const urlCheck = validatePublicUrl(this.baseUrl);
    if (!urlCheck.isValid) {
      return {
        success: false,
        year,
        month,
        fetchedCount: 0,
        validCount: 0,
        unmappedCount: 0,
        coveragePercent: 0,
        parsedRecords: [],
        unmappedCentres: [],
        validationErrors: [`SSRF Validation Failed: ${urlCheck.error}`],
      };
    }

    const monthStr = String(month).padStart(2, "0");
    const yearStr = String(year);

    const params = new URLSearchParams();
    params.append("ddlMonth", monthStr);
    params.append("ddlYear", yearStr);
    params.append("btnSearch", "Search");

    try {
      const res = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Origin": "https://www.e2necc.com",
          "Referer": "https://www.e2necc.com/home/eggprice",
        },
        body: params,
        signal: AbortSignal.timeout(12000),
      });

      if (!res.ok) {
        return {
          success: false,
          year,
          month,
          fetchedCount: 0,
          validCount: 0,
          unmappedCount: 0,
          coveragePercent: 0,
          parsedRecords: [],
          unmappedCentres: [],
          validationErrors: [`NECC Official Portal returned HTTP ${res.status}`],
        };
      }

      const html = await res.text();
      const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
      const table2 = tables[2];

      if (!table2) {
        return {
          success: false,
          year,
          month,
          fetchedCount: 0,
          validCount: 0,
          unmappedCount: 0,
          coveragePercent: 0,
          parsedRecords: [],
          unmappedCentres: [],
          validationErrors: ["NECC rate sheet table structure not found (PARSER_WARNING)"],
        };
      }

      const trs = table2.match(/<tr[\s\S]*?<\/tr>/gi) || [];
      const parsedRecords: NECCRecord[] = [];
      const unmappedCentresSet = new Set<string>();

      const daysInMonth = new Date(year, month, 0).getDate();

      for (let i = 0; i < trs.length; i++) {
        const tr = trs[i];
        const tds = tr.match(/<td[^>]*>(.*?)<\/td>/gi) || [];

        if (tds.length >= 28) {
          const rawCentre = tds[0].replace(/<[^>]+>/g, "").trim();
          if (!rawCentre || rawCentre.includes("NECC SUGGESTED") || rawCentre.includes("PREVAILING")) continue;

          const cleanLower = rawCentre.toLowerCase().replace(/\s+/g, " ");
          const mappedCity = NECC_CENTRE_ALIASES[cleanLower];

          if (!mappedCity) {
            unmappedCentresSet.add(rawCentre);
          }

          for (let day = 1; day <= daysInMonth; day++) {
            if (tds[day]) {
              const valStr = tds[day].replace(/<[^>]+>/g, "").trim();
              if (valStr && valStr !== "-" && valStr !== "0" && valStr !== "") {
                const rawVal = parseFloat(valStr);
                if (!isNaN(rawVal) && rawVal > 0) {
                  const dayStr = String(day).padStart(2, "0");
                  const rateDate = `${yearStr}-${monthStr}-${dayStr}`;
                  const normalizedRate = Number((rawVal / 100).toFixed(2));

                  parsedRecords.push({
                    centre: rawCentre,
                    mappedCity: mappedCity || rawCentre,
                    day,
                    rate_date: rateDate,
                    raw_rate: rawVal,
                    egg_rate: normalizedRate,
                    tray_price: Number((normalizedRate * 30).toFixed(2)),
                    hundred_price: rawVal,
                    peti_price: Number((normalizedRate * 210).toFixed(2)),
                    unit: "100 eggs",
                    mapping_status: mappedCity ? "MAPPED" : "UNMAPPED",
                  });
                }
              }
            }
          }
        }
      }

      const totalExpectedCentres = 34;
      const centresFoundCount = new Set(parsedRecords.map((r) => r.centre)).size;
      const coveragePercent = Math.min(100, Math.round((centresFoundCount / totalExpectedCentres) * 100));

      return {
        success: parsedRecords.length > 0,
        year,
        month,
        fetchedCount: parsedRecords.length,
        validCount: parsedRecords.length,
        unmappedCount: unmappedCentresSet.size,
        coveragePercent,
        parsedRecords,
        unmappedCentres: Array.from(unmappedCentresSet),
        validationErrors: [],
        note: `Successfully parsed ${parsedRecords.length} daily rate record(s) across ${centresFoundCount} NECC centres (${coveragePercent}% coverage).`,
      };
    } catch (err: any) {
      return {
        success: false,
        year,
        month,
        fetchedCount: 0,
        validCount: 0,
        unmappedCount: 0,
        coveragePercent: 0,
        parsedRecords: [],
        unmappedCentres: [],
        validationErrors: [err.message || "Failed to reach NECC Official portal"],
      };
    }
  }

  /**
   * Executes automatic daily synchronization of official NECC rates into Supabase DB.
   */
  async fetchCurrentNECCRates(): Promise<{
    success: boolean;
    date: string;
    importedCount: number;
    dbConfirmedCount: number;
    coveragePercent: number;
    note: string;
  }> {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const todayStr = getCurrentDate();
    const [yearStr, monthStr, dayStr] = todayStr.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    const monthResult = await this.fetchNECCMonth(year, month);
    if (!monthResult.success) {
      return {
        success: false,
        date: todayStr,
        importedCount: 0,
        dbConfirmedCount: 0,
        coveragePercent: 0,
        note: `NECC Fetch Failed: ${monthResult.validationErrors[0] || "Unknown error"}`,
      };
    }

    // Filter today's records
    const todayRecords = monthResult.parsedRecords.filter((r) => r.day === day || r.rate_date === todayStr);
    const recordsToImport = todayRecords.length > 0 ? todayRecords : monthResult.parsedRecords.filter((r) => r.day === day - 1);

    // Load DB cities and markets
    const { data: dbCities } = await supabaseAdmin.from("cities").select("id, name, slug, state_id").limit(5000);
    const { data: dbMarkets } = await supabaseAdmin.from("markets").select("id, name, slug, city_id").limit(5000);

    const dbRows: any[] = [];
    const startTime = getCurrentDateTime();

    for (const rec of recordsToImport) {
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
          notes: `Official NECC Suggested Rate (${rec.centre})`,
        });
      }
    }

    let importedCount = 0;
    let upsertErrorMsg = "";

    // Detailed diagnostic logging
    console.log(`[NECC] todayStr=${todayStr} day=${day} recordsToImport=${recordsToImport.length} dbCities=${dbCities?.length} dbMarkets=${dbMarkets?.length} dbRows=${dbRows.length}`);

    if (dbRows.length === 0) {
      console.warn("[NECC] dbRows is empty — no cities matched. recordsToImport sample:", JSON.stringify(recordsToImport.slice(0, 3)));
    }

    if (dbRows.length > 0) {
      const { error: upsertErr } = await supabaseAdmin.from("egg_rates").upsert(dbRows, {
        onConflict: "city_id,market_id,effective_date",
        ignoreDuplicates: false,
      } as any);

      if (!upsertErr) {
        importedCount = dbRows.length;
        console.log(`[NECC] Upsert success: ${importedCount} rows`);
      } else {
        upsertErrorMsg = upsertErr.message;
        console.error("[NECC] Upsert error:", upsertErr.message, upsertErr);
      }
    }

    // Verification Query — use service_role so RLS doesn't block
    const { data: dbCheck, error: checkErr } = await supabaseAdmin
      .from("egg_rates")
      .select("id")
      .eq("effective_date", todayStr)
      .eq("is_published", true);

    const dbConfirmedCount = dbCheck?.length || 0;
    console.log(`[NECC] DB verify: confirmed=${dbConfirmedCount} checkErr=${checkErr?.message}`);

    const isSuccess = importedCount > 0 || dbConfirmedCount > 0;

    // Audit log
    try {
      await supabaseAdmin.from("automation_audit_logs").insert({
        job_id: `necc-${Date.now()}`,
        action: "necc_rate_update",
        status: isSuccess ? "success" : "failed",
        details: {
          target_date: todayStr,
          fetched: recordsToImport.length,
          db_rows_prepared: dbRows.length,
          imported: importedCount,
          db_confirmed: dbConfirmedCount,
          upsert_error: upsertErrorMsg || null,
          coverage_percent: monthResult.coveragePercent,
          timestamp: startTime,
        },
      });
    } catch (auditErr: any) {
      console.warn("[NECC] Audit log failed:", auditErr.message);
    }

    return {
      success: isSuccess,
      date: todayStr,
      importedCount,
      dbConfirmedCount,
      coveragePercent: monthResult.coveragePercent,
      note: isSuccess
        ? `Successfully imported ${importedCount} official NECC rate records for ${todayStr}. DB confirmed: ${dbConfirmedCount}.`
        : `Failed to insert NECC rates. dbRows=${dbRows.length} upsertError=${upsertErrorMsg || "none"} dbConfirmed=${dbConfirmedCount}`,
    };
  }
}

