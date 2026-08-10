import { supabase } from "@/integrations/supabase/client";
import type { 
  HistorySummary, 
  RegionHistoryPoint, 
  ComparisonData,
  RegionMovers,
  CoverageStats
} from "@/types/history";

/**
 * Historical Data Service
 */

export async function getHistorySummary(
  type: "national" | "state" | "city",
  slug?: string,
  date?: string
): Promise<HistorySummary | null> {
  const targetDate = date || new Date().toISOString().slice(0, 10);
  
  let query: any;
  if (type === "city" && slug) {
    query = supabase
      .from("daily_city_rates")
      .select("*")
      .eq("city_slug", slug)
      .eq("effective_date", targetDate);
  } else if (type === "state" && slug) {
    query = supabase
      .from("daily_state_rates")
      .select("*")
      .eq("state_slug", slug)
      .eq("effective_date", targetDate);
  } else {
    query = supabase
      .from("daily_national_rates")
      .select("*")
      .eq("effective_date", targetDate);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const result: HistorySummary = {
    price: Number(data.avg_price || data.egg_rate),
    date: data.effective_date ? String(data.effective_date) : targetDate,
  };

  if (type === "state" && slug) {
    const { data: movers } = await supabase
      .from("latest_city_rates")
      .select("city_name, egg_rate")
      .eq("state_slug", slug)
      .order("egg_rate", { ascending: false });
    
    if (movers && movers.length > 0) {
      const top = movers[0];
      const bottom = movers[movers.length - 1];
      
      if (top) {
        result.highestCity = top.city_name || undefined;
        result.highestPrice = top.egg_rate ? Number(top.egg_rate) : undefined;
      }
      if (bottom) {
        result.lowestCity = bottom.city_name || undefined;
        result.lowestPrice = bottom.egg_rate ? Number(bottom.egg_rate) : undefined;
      }
    }
  }

  return result;
}

export async function getHistoricalRates(
  type: "national" | "state" | "city",
  slug?: string,
  days = 30
): Promise<RegionHistoryPoint[]> {
  const { data, error } = await supabase
    .rpc("get_region_history", { 
      p_type: type, 
      p_slug: slug || undefined, 
      p_days: days 
    });

  if (error) {
    console.error("RPC get_region_history failed, falling back:", error.message);
    let query: any;
    if (type === "city" && slug) {
      query = supabase
        .from("daily_city_rates")
        .select("effective_date, avg_price")
        .eq("city_slug", slug);
    } else if (type === "state" && slug) {
      query = supabase
        .from("daily_state_rates")
        .select("effective_date, avg_price")
        .eq("state_slug", slug);
    } else {
      query = supabase.from("daily_national_rates").select("effective_date, avg_price");
    }

    const { data: fallbackData, error: fallbackError } = await query
      .order("effective_date", { ascending: false })
      .limit(days);
    
    if (fallbackError) throw new Error(fallbackError.message);
    
    return (fallbackData ?? []).reverse().map((row: any) => ({
      date: row.effective_date ? String(row.effective_date) : "",
      price: Number(row.avg_price)
    }));
  }

  return (data as any[]).map(row => ({
    date: row.effective_date ? String(row.effective_date) : "",
    price: Number(row.avg_price)
  }));
}

export async function getComparison(
  items: { type: "national" | "state" | "city"; slug?: string }[],
  days = 30
): Promise<ComparisonData> {
  const results = await Promise.all(
    items.map(async (item) => {
      const history = await getHistoricalRates(item.type, item.slug, days);
      return {
        label: item.slug || "National",
        data: history
      };
    })
  );

  return {
    periods: results[0]?.data.map(d => d.date) || [],
    series: results
  };
}

export async function getNationalMovers(limit = 10): Promise<RegionMovers> {
  const { data: gainers, error: gError } = await supabase
    .from("regional_price_movers")
    .select("*")
    .order("percentage_change", { ascending: false })
    .limit(limit);

  if (gError) throw new Error(gError.message);

  const { data: losers, error: lError } = await supabase
    .from("regional_price_movers")
    .select("*")
    .order("percentage_change", { ascending: true })
    .limit(limit);

  if (lError) throw new Error(lError.message);

  return {
    gainers: (gainers ?? []).map(row => ({
      name: row.city_name || "Unknown",
      slug: row.city_slug || "unknown",
      state: row.state_name || "Unknown",
      price: Number(row.current_price),
      change: Number(row.price_change),
      percent: Number(row.percentage_change)
    })),
    losers: (losers ?? []).map(row => ({
      name: row.city_name || "Unknown",
      slug: row.city_slug || "unknown",
      state: row.state_name || "Unknown",
      price: Number(row.current_price),
      change: Number(row.price_change),
      percent: Number(row.percentage_change)
    }))
  };
}

export async function getCoverageStats(date?: string): Promise<CoverageStats> {
  const targetDate = date || new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase.rpc("get_data_coverage_stats", { _date: targetDate });
  
  if (error) throw new Error(error.message);
  
  const stats = (data as any)[0];
  if (!stats) {
    return {
      totalCities: 0,
      updatedCities: 0,
      coveragePercent: 0,
      date: targetDate
    };
  }

  return {
    totalCities: Number(stats.total_cities),
    updatedCities: Number(stats.updated_cities),
    coveragePercent: Number(stats.coverage_percent),
    date: targetDate
  };
}
