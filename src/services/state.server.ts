/**
 * Server-only aggregation for the programmatic /state/$slug pages.
 * Every number is derived from published database rows.
 */
import { supabase } from "@/integrations/supabase/client";
import { listArticles } from "@/services/public.server";
import { toISODate } from "@/utils/format";
import type { ChartPoint, Faq, RegionRate } from "@/types/home";
import type {
  MarketRow,
  StateComparison,
  StateInsights,
  StatePageData,
  StateRateSummary,
  StateSeries,
  StateStats,
} from "@/types/state";

const YEAR_DAYS = 365;

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function pct(current: number, previous: number): number {
  if (!previous) return 0;
  return round(((current - previous) / previous) * 100, 2);
}

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

interface StateRateRow {
  id: string;
  egg_rate: number;
  dozen_price: number | null;
  tray_price: number | null;
  hundred_price: number | null;
  peti_price: number | null;
  wholesale_price: number | null;
  retail_price: number | null;
  effective_date: string;
  updated_at: string;
  is_verified: boolean;
  cities: { name: string; slug: string; is_featured: boolean } | null;
  markets: { name: string; slug: string } | null;
}

function seriesFor(byDate: Map<string, number>, days: number): ChartPoint[] {
  const cutoff = isoDaysAgo(days);
  return [...byDate.entries()]
    .filter(([date]) => date >= cutoff)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, perEgg]) => ({ date, perEgg }));
}

function cityRollup(today: StateRateRow[], yesterday: StateRateRow[], stateName: string, stateSlug: string): RegionRate[] {
  const group = (rows: StateRateRow[]) => {
    const map = new Map<string, StateRateRow[]>();
    for (const row of rows) {
      if (!row.cities) continue;
      const list = map.get(row.cities.slug);
      if (list) list.push(row);
      else map.set(row.cities.slug, [row]);
    }
    return map;
  };

  const current = group(today);
  const previous = group(yesterday);

  return [...current.entries()]
    .map(([slug, rows]) => {
      const perEgg = mean(rows.map((row) => Number(row.egg_rate)));
      const prevRows = previous.get(slug);
      const previousPerEgg = prevRows ? mean(prevRows.map((r) => Number(r.egg_rate))) : perEgg;
      return {
        name: rows[0]!.cities!.name,
        slug,
        stateName,
        stateSlug,
        featured: rows[0]!.cities!.is_featured,
        perEgg,
        perDozen: mean(rows.map((r) => Number(r.dozen_price ?? Number(r.egg_rate) * 12))),
        perTray: mean(rows.map((r) => Number(r.tray_price ?? Number(r.egg_rate) * 30))),
        previousPerEgg,
        change: round(perEgg - previousPerEgg),
        changePercent: pct(perEgg, previousPerEgg),
      } satisfies RegionRate;
    })
    .sort((a, b) => b.perEgg - a.perEgg);
}

/** Straight-line distance between two lat/lng pairs, in kilometres. */
function haversine(a: [number, number], b: [number, number]): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const [lat1, lon1] = a;
  const [lat2, lon2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return round(2 * 6371 * Math.asin(Math.sqrt(h)), 0);
}

/** Centroid + today's average for every active state, used for "nearby states". */
async function loadStateNeighbours(
  currentSlug: string,
  currentPerEgg: number,
): Promise<StateComparison[]> {
  const [{ data: cityRows }, { data: rateRows }] = await Promise.all([
    supabase
      .from("cities")
      .select("latitude,longitude,states(name,slug)")
      .eq("status", "active"),
    supabase
      .from("egg_rates")
      .select("egg_rate,effective_date,states(slug)")
      .eq("is_published", true)
      .gte("effective_date", isoDaysAgo(3))
      .order("effective_date", { ascending: false })
      .limit(2000),
  ]);

  type CityRow = { latitude: number | null; longitude: number | null; states: { name: string; slug: string } | null };
  const centroids = new Map<string, { name: string; lat: number[]; lng: number[] }>();
  for (const row of (cityRows ?? []) as unknown as CityRow[]) {
    if (!row.states || row.latitude == null || row.longitude == null) continue;
    const entry = centroids.get(row.states.slug) ?? { name: row.states.name, lat: [], lng: [] };
    entry.lat.push(Number(row.latitude));
    entry.lng.push(Number(row.longitude));
    centroids.set(row.states.slug, entry);
  }

  type LatestRow = { egg_rate: number; effective_date: string; states: { slug: string } | null };
  const latestDate = ((rateRows ?? []) as unknown as LatestRow[])[0]?.effective_date ?? "";
  const perState = new Map<string, number[]>();
  for (const row of (rateRows ?? []) as unknown as LatestRow[]) {
    if (!row.states || row.effective_date !== latestDate) continue;
    const list = perState.get(row.states.slug) ?? [];
    list.push(Number(row.egg_rate));
    perState.set(row.states.slug, list);
  }

  const origin = centroids.get(currentSlug);
  if (!origin) return [];
  const originPoint: [number, number] = [mean(origin.lat), mean(origin.lng)];

  return [...centroids.entries()]
    .filter(([slug]) => slug !== currentSlug && perState.has(slug))
    .map(([slug, entry]) => {
      const perEgg = mean(perState.get(slug)!);
      return {
        name: entry.name,
        slug,
        perEgg,
        difference: round(currentPerEgg - perEgg),
        distanceKm: haversine(originPoint, [mean(entry.lat), mean(entry.lng)]),
      } satisfies StateComparison;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function listStateSlugs(): Promise<{ slug: string; name: string }[]> {
  const { data, error } = await supabase
    .from("states")
    .select("slug,name")
    .eq("status", "active")
    .order("display_order")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getStatePageData(slug: string): Promise<StatePageData | null> {
  const { data: state, error } = await supabase
    .from("states")
    .select("id,name,slug,code,seo_title,meta_description")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!state) return null;

  const [{ data: rateData, error: rateError }, { count: cityCount }, { count: marketCount }, faqRows, articles] =
    await Promise.all([
      supabase
        .from("egg_rates")
        .select(
          "id,egg_rate,dozen_price,tray_price,hundred_price,peti_price,wholesale_price,retail_price,effective_date,updated_at,is_verified,cities(name,slug,is_featured),markets(name,slug)",
        )
        .eq("is_published", true)
        .eq("state_id", state.id)
        .gte("effective_date", isoDaysAgo(YEAR_DAYS))
        .order("effective_date", { ascending: false })
        .limit(5000),
      supabase
        .from("cities")
        .select("id,states!inner(slug)", { count: "exact", head: true })
        .eq("status", "active")
        .eq("states.slug", slug),
      supabase
        .from("markets")
        .select("id,states!inner(slug)", { count: "exact", head: true })
        .eq("status", "active")
        .eq("states.slug", slug),
      supabase.from("faqs").select("id,question,answer").eq("is_active", true).order("display_order"),
      listArticles(3),
    ]);

  let rows = (rateData ?? []) as unknown as StateRateRow[];

  const todayStr = toISODate();
  let byDate = new Map<string, StateRateRow[]>();
  for (const row of rows) {
    const list = byDate.get(row.effective_date);
    if (list) list.push(row);
    else byDate.set(row.effective_date, [row]);
  }
  let dates = [...byDate.keys()].sort((a, b) => b.localeCompare(a));

  if (!dates[0] || dates[0] < todayStr) {
    try {
      const { AutomationEngine } = await import("./automation-engine.server");
      const engine = new AutomationEngine();
      await engine.executeFullPipeline(todayStr);

      const { data: freshRateData } = await supabase
        .from("egg_rates")
        .select(
          "id,egg_rate,dozen_price,tray_price,hundred_price,peti_price,wholesale_price,retail_price,effective_date,updated_at,is_verified,cities(name,slug,is_featured),markets(name,slug)",
        )
        .eq("is_published", true)
        .eq("state_id", state.id)
        .gte("effective_date", isoDaysAgo(YEAR_DAYS))
        .order("effective_date", { ascending: false })
        .limit(5000);

      if (freshRateData && freshRateData.length > 0) {
        rows = freshRateData as unknown as StateRateRow[];
        byDate = new Map<string, StateRateRow[]>();
        for (const row of rows) {
          const list = byDate.get(row.effective_date);
          if (list) list.push(row);
          else byDate.set(row.effective_date, [row]);
        }
        dates = [...byDate.keys()].sort((a, b) => b.localeCompare(a));
      }
    } catch {
      // Non-blocking fallback
    }
  }

  const today = byDate.get(dates[0] ?? "") ?? [];
  const yesterday = byDate.get(dates[1] ?? "") ?? [];

  const averages = new Map<string, number>();
  for (const [date, list] of byDate) {
    averages.set(date, mean(list.map((row) => Number(row.egg_rate))));
  }

  const series: StateSeries = {
    d7: seriesFor(averages, 7),
    d30: seriesFor(averages, 30),
    d90: seriesFor(averages, 90),
    d365: seriesFor(averages, YEAR_DAYS),
  };

  const perEgg = mean(today.map((row) => Number(row.egg_rate)));
  const previousPerEgg = yesterday.length ? mean(yesterday.map((r) => Number(r.egg_rate))) : perEgg;
  const monthValues = series.d30.map((point) => point.perEgg);

  const latestDate = dates[0] ?? "";
  const effectiveDate = (latestDate && latestDate >= todayStr) ? latestDate : todayStr;

  const summary: StateRateSummary | null =
    today.length === 0
      ? null
      : {
          perEgg,
          previousPerEgg,
          change: round(perEgg - previousPerEgg),
          changePercent: pct(perEgg, previousPerEgg),
          weeklyAverage: mean(series.d7.map((point) => point.perEgg)),
          monthlyAverage: mean(monthValues),
          highest: monthValues.length ? round(Math.max(...monthValues)) : perEgg,
          lowest: monthValues.length ? round(Math.min(...monthValues)) : perEgg,
          wholesale: mean(today.map((r) => Number(r.wholesale_price ?? r.egg_rate))),
          retail: mean(today.map((r) => Number(r.retail_price ?? r.egg_rate))),
          perDozen: mean(today.map((r) => Number(r.dozen_price ?? Number(r.egg_rate) * 12))),
          perTray: mean(today.map((r) => Number(r.tray_price ?? Number(r.egg_rate) * 30))),
          perHundred: mean(today.map((r) => Number(r.hundred_price ?? Number(r.egg_rate) * 100))),
          perPeti: mean(today.map((r) => Number(r.peti_price ?? Number(r.egg_rate) * 210))),
          effectiveDate,
          lastUpdated: today.map((row) => row.updated_at).sort().at(-1) ?? "",
          verified: today.every((row) => row.is_verified),
        };

  const cities = cityRollup(today, yesterday, state.name, state.slug);

  const markets: MarketRow[] = today
    .filter((row) => row.markets)
    .map((row) => ({
      id: row.id,
      marketName: row.markets!.name,
      cityName: row.cities?.name ?? "",
      citySlug: row.cities?.slug ?? "",
      perEgg: Number(row.egg_rate),
      wholesale: Number(row.wholesale_price ?? row.egg_rate),
      retail: Number(row.retail_price ?? row.egg_rate),
      updatedAt: row.updated_at,
      verified: row.is_verified,
    }))
    .sort((a, b) => a.marketName.localeCompare(b.marketName));

  // Thirty-day spread per city highlights where the price swings most.
  const spreadByCity = new Map<string, { name: string; values: number[] }>();
  const monthCutoff = isoDaysAgo(30);
  for (const row of rows) {
    if (!row.cities || row.effective_date < monthCutoff) continue;
    const entry = spreadByCity.get(row.cities.slug) ?? { name: row.cities.name, values: [] };
    entry.values.push(Number(row.egg_rate));
    spreadByCity.set(row.cities.slug, entry);
  }
  const volatility = [...spreadByCity.entries()]
    .map(([citySlug, entry]) => ({
      name: entry.name,
      slug: citySlug,
      spread: round(Math.max(...entry.values) - Math.min(...entry.values)),
    }))
    .sort((a, b) => b.spread - a.spread);

  const weekAgo = series.d7[0]?.perEgg ?? perEgg;
  const monthAgo = series.d30[0]?.perEgg ?? perEgg;

  const insights: StateInsights = {
    highestCity: cities[0] ?? null,
    lowestCity: cities.at(-1) ?? null,
    averageRate: perEgg,
    weeklyTrend: round(perEgg - weekAgo),
    monthlyTrend: round(perEgg - monthAgo),
    mostVolatileCity: volatility[0] ?? null,
    bestBuyingMarket:
      [...markets].sort((a, b) => a.wholesale - b.wholesale)[0] ?? null,
  };

  const neighbours = await loadStateNeighbours(state.slug, perEgg);

  const stats: StateStats = {
    citiesCount: cityCount ?? cities.length,
    marketsCount: marketCount ?? new Set(markets.map((market) => market.marketName)).size,
    averageRate: perEgg,
    highestRate: cities[0]?.perEgg ?? perEgg,
    lowestRate: cities.at(-1)?.perEgg ?? perEgg,
    lastUpdated: summary?.lastUpdated ?? "",
  };

  return {
    state: {
      name: state.name,
      slug: state.slug,
      code: state.code,
      seoTitle: state.seo_title,
      metaDescription: state.meta_description,
    },
    summary,
    stats,
    cities,
    markets,
    series,
    insights,
    comparisons: neighbours.slice(0, 4),
    relatedStates: neighbours.slice(0, 8),
    faqs: (faqRows.data ?? []) as Faq[],
    articles,
  };
}
