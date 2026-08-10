/**
 * Server-only aggregation for the programmatic /city/$slug pages.
 * Every figure comes from published database rows — nothing is hardcoded.
 */
import { supabase } from "@/integrations/supabase/client";
import { listArticles } from "@/services/public.server";
import type { ChartPoint, Faq } from "@/types/home";
import type {
  CityAnalytics,
  CityBenchmark,
  CityComparison,
  CityHistoryRow,
  CityMarketRow,
  CityPageData,
  CityRateSummary,
  CitySeries,
} from "@/types/city";

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

/** Straight-line distance between two lat/lng pairs, in kilometres. */
function haversine(a: [number, number], b: [number, number]): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
  return round(2 * 6371 * Math.asin(Math.sqrt(h)), 0);
}

interface CityRateRow {
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
  markets: {
    id: string;
    name: string;
    slug: string;
    market_type: "wholesale" | "retail" | "both";
    supports_wholesale: boolean;
    supports_retail: boolean;
  } | null;
}

function sliceSeries(points: ChartPoint[], days: number): ChartPoint[] {
  const cutoff = isoDaysAgo(days);
  return points.filter((point) => point.date >= cutoff);
}

/** Population-weighted "popular" city shortcuts for the search block. */
async function loadPopularCities(excludeSlug: string) {
  const { data } = await supabase
    .from("cities")
    .select("name,slug,states(name)")
    .eq("status", "active")
    .eq("is_featured", true)
    .order("population", { ascending: false, nullsFirst: false })
    .limit(13);
  type Row = { name: string; slug: string; states: { name: string } | null };
  return ((data ?? []) as unknown as Row[])
    .filter((row) => row.slug !== excludeSlug)
    .slice(0, 12)
    .map((row) => ({ name: row.name, slug: row.slug, stateName: row.states?.name ?? "" }));
}

export async function listCitySlugs(): Promise<
  { slug: string; name: string; stateName: string; stateSlug: string }[]
> {
  const { data, error } = await supabase
    .from("cities")
    .select("slug,name,display_order,states!inner(name,slug)")
    .eq("status", "active")
    .order("display_order")
    .order("name");
  if (error) throw new Error(error.message);
  type Row = { slug: string; name: string; states: { name: string; slug: string } | null };
  return ((data ?? []) as unknown as Row[]).map((row) => ({
    slug: row.slug,
    name: row.name,
    stateName: row.states?.name ?? "",
    stateSlug: row.states?.slug ?? "",
  }));
}

export async function getCityPageData(slug: string): Promise<CityPageData | null> {
  const { data: city, error } = await supabase
    .from("cities")
    .select(
      "id,name,slug,latitude,longitude,population,seo_title,meta_description,state_id,states!inner(name,slug)",
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!city) return null;

  const cityRecord = city as unknown as {
    id: string;
    name: string;
    slug: string;
    latitude: number | null;
    longitude: number | null;
    population: number | null;
    seo_title: string | null;
    meta_description: string | null;
    state_id: string;
    states: { name: string; slug: string };
  };

  const yearStart = isoDaysAgo(YEAR_DAYS);

  const [
    { data: rateData, error: rateError },
    { data: peerData },
    { data: nationalData },
    { data: faqData },
    articles,
    popularCities,
  ] = await Promise.all([
    supabase
      .from("egg_rates")
      .select(
        "id,egg_rate,dozen_price,tray_price,hundred_price,peti_price,wholesale_price,retail_price,effective_date,updated_at,is_verified,markets(id,name,slug,market_type,supports_wholesale,supports_retail)",
      )
      .eq("is_published", true)
      .eq("city_id", cityRecord.id)
      .gte("effective_date", yearStart)
      .order("effective_date", { ascending: false })
      .limit(5000),
    // Latest few days across every city, for nearby-city and state comparisons.
    supabase
      .from("egg_rates")
      .select(
        "egg_rate,effective_date,cities!inner(name,slug,latitude,longitude,status),states!inner(name,slug)",
      )
      .eq("is_published", true)
      .gte("effective_date", isoDaysAgo(3))
      .limit(4000),
    supabase
      .from("egg_rates")
      .select("egg_rate,effective_date")
      .eq("is_published", true)
      .gte("effective_date", isoDaysAgo(3))
      .limit(4000),
    supabase.from("faqs").select("id,question,answer").eq("is_active", true).order("display_order"),
    listArticles(3),
    loadPopularCities(slug),
  ]);

  if (rateError) throw new Error(rateError.message);
  const rows = (rateData ?? []) as unknown as CityRateRow[];

  /* ------------------------------ daily rollups ----------------------------- */

  const byDate = new Map<string, CityRateRow[]>();
  for (const row of rows) {
    const list = byDate.get(row.effective_date);
    if (list) list.push(row);
    else byDate.set(row.effective_date, [row]);
  }
  const dates = [...byDate.keys()].sort((a, b) => b.localeCompare(a));
  const today = byDate.get(dates[0] ?? "") ?? [];
  const yesterday = byDate.get(dates[1] ?? "") ?? [];

  const ascending = [...dates].reverse();
  const fullSeries: ChartPoint[] = ascending.map((date) => ({
    date,
    perEgg: mean((byDate.get(date) ?? []).map((row) => Number(row.egg_rate))),
  }));

  const series: CitySeries = {
    d7: sliceSeries(fullSeries, 7),
    d30: sliceSeries(fullSeries, 30),
    d90: sliceSeries(fullSeries, 90),
    d365: fullSeries,
  };

  const perEgg = mean(today.map((row) => Number(row.egg_rate)));
  const previousPerEgg = yesterday.length
    ? mean(yesterday.map((row) => Number(row.egg_rate)))
    : perEgg;

  const summary: CityRateSummary | null =
    today.length === 0
      ? null
      : {
          perEgg,
          previousPerEgg,
          change: round(perEgg - previousPerEgg),
          changePercent: pct(perEgg, previousPerEgg),
          perDozen: mean(today.map((r) => Number(r.dozen_price ?? Number(r.egg_rate) * 12))),
          perTray: mean(today.map((r) => Number(r.tray_price ?? Number(r.egg_rate) * 30))),
          perHundred: mean(today.map((r) => Number(r.hundred_price ?? Number(r.egg_rate) * 100))),
          perPeti: mean(today.map((r) => Number(r.peti_price ?? Number(r.egg_rate) * 210))),
          wholesale: mean(today.map((r) => Number(r.wholesale_price ?? r.egg_rate))),
          retail: mean(today.map((r) => Number(r.retail_price ?? r.egg_rate))),
          effectiveDate: dates[0] ?? "",
          previousDate: dates[1] ?? null,
          lastUpdated: today.map((row) => row.updated_at).sort().at(-1) ?? "",
          verified: today.every((row) => row.is_verified),
        };

  /* -------------------------------- markets -------------------------------- */

  const { data: marketMeta } = await supabase
    .from("markets")
    .select("id,name,slug,market_type,supports_wholesale,supports_retail,cities(latitude,longitude)")
    .eq("city_id", cityRecord.id)
    .eq("status", "active");

  const markets: CityMarketRow[] = today
    .filter((row) => row.markets)
    .map((row) => ({
      id: row.id,
      marketName: row.markets!.name,
      marketSlug: row.markets!.slug,
      marketType: row.markets!.market_type,
      supportsWholesale: row.markets!.supports_wholesale,
      supportsRetail: row.markets!.supports_retail,
      perEgg: Number(row.egg_rate),
      wholesale: Number(row.wholesale_price ?? row.egg_rate),
      retail: Number(row.retail_price ?? row.egg_rate),
      updatedAt: row.updated_at,
      verified: row.is_verified,
      distanceKm: null,
    }))
    .sort((a, b) => a.marketName.localeCompare(b.marketName));

  // Markets without a rate today still belong on the page, marked as awaiting a rate.
  const priced = new Set(markets.map((market) => market.marketSlug));
  type MarketMeta = {
    id: string;
    name: string;
    slug: string;
    market_type: "wholesale" | "retail" | "both";
    supports_wholesale: boolean;
    supports_retail: boolean;
  };
  for (const meta of (marketMeta ?? []) as unknown as MarketMeta[]) {
    if (priced.has(meta.slug)) continue;
    markets.push({
      id: meta.id,
      marketName: meta.name,
      marketSlug: meta.slug,
      marketType: meta.market_type,
      supportsWholesale: meta.supports_wholesale,
      supportsRetail: meta.supports_retail,
      perEgg: 0,
      wholesale: 0,
      retail: 0,
      updatedAt: "",
      verified: false,
      distanceKm: null,
    });
  }

  /* ----------------------------- history table ----------------------------- */

  const history: CityHistoryRow[] = dates.map((date, index) => {
    const list = byDate.get(date) ?? [];
    const value = mean(list.map((row) => Number(row.egg_rate)));
    const nextDate = dates[index + 1];
    const previous = nextDate
      ? mean((byDate.get(nextDate) ?? []).map((row) => Number(row.egg_rate)))
      : value;
    return {
      date,
      perEgg: value,
      wholesale: mean(list.map((row) => Number(row.wholesale_price ?? row.egg_rate))),
      retail: mean(list.map((row) => Number(row.retail_price ?? row.egg_rate))),
      difference: round(value - previous),
      changePercent: pct(value, previous),
    };
  });

  /* -------------------------------- analytics ------------------------------ */

  const month = series.d30.map((point) => point.perEgg);
  const quarter = series.d90.map((point) => point.perEgg);
  const monthlyAverage = mean(month);
  const highestPoint = [...series.d90].sort((a, b) => b.perEgg - a.perEgg)[0] ?? null;
  const lowestPoint = [...series.d90].sort((a, b) => a.perEgg - b.perEgg)[0] ?? null;

  // Volatility = standard deviation of the last 30 daily averages, as a % of the mean.
  const variance =
    month.length > 1
      ? month.reduce((sum, value) => sum + (value - monthlyAverage) ** 2, 0) / month.length
      : 0;
  const volatility = monthlyAverage ? round((Math.sqrt(variance) / monthlyAverage) * 100, 2) : 0;

  const recent = history.slice(0, 30);
  const daysUp = recent.filter((row) => row.difference > 0).length;
  const daysDown = recent.filter((row) => row.difference < 0).length;

  // Demand and supply are read from price behaviour: sustained gains imply demand
  // outrunning placements, sustained falls imply surplus arrivals.
  const weeklyAverage = mean(series.d7.map((point) => point.perEgg));
  const demandIndex = round(
    Math.min(100, Math.max(0, 50 + (weeklyAverage - monthlyAverage) * 25 + (daysUp - daysDown) * 1.5)),
  );
  const supplyIndex = round(Math.min(100, Math.max(0, 100 - demandIndex)));

  const analytics: CityAnalytics = {
    weeklyAverage,
    monthlyAverage,
    quarterlyAverage: mean(quarter),
    highest: highestPoint?.perEgg ?? perEgg,
    highestDate: highestPoint?.date ?? null,
    lowest: lowestPoint?.perEgg ?? perEgg,
    lowestDate: lowestPoint?.date ?? null,
    volatility,
    volatilityLabel: volatility < 2 ? "low" : volatility < 5 ? "moderate" : "high",
    demandIndex,
    demandLabel: demandIndex >= 60 ? "strong" : demandIndex >= 40 ? "steady" : "soft",
    supplyIndex,
    supplyLabel: supplyIndex >= 60 ? "surplus" : supplyIndex >= 40 ? "balanced" : "tight",
    daysUp,
    daysDown,
  };

  /* --------------------------- peers and benchmarks ------------------------- */

  type PeerRow = {
    egg_rate: number;
    effective_date: string;
    cities: {
      name: string;
      slug: string;
      latitude: number | null;
      longitude: number | null;
      status: string;
    } | null;
    states: { name: string; slug: string } | null;
  };
  const peers = (peerData ?? []) as unknown as PeerRow[];
  const peerLatest = peers.reduce<string>(
    (latest, row) => (row.effective_date > latest ? row.effective_date : latest),
    "",
  );
  const peerToday = peers.filter((row) => row.effective_date === peerLatest && row.cities?.status === "active");

  const cityAgg = new Map<
    string,
    { name: string; stateName: string; stateSlug: string; lat: number | null; lng: number | null; values: number[] }
  >();
  const stateAgg = new Map<string, { name: string; values: number[] }>();
  for (const row of peerToday) {
    if (!row.cities || !row.states) continue;
    const entry =
      cityAgg.get(row.cities.slug) ??
      {
        name: row.cities.name,
        stateName: row.states.name,
        stateSlug: row.states.slug,
        lat: row.cities.latitude === null ? null : Number(row.cities.latitude),
        lng: row.cities.longitude === null ? null : Number(row.cities.longitude),
        values: [],
      };
    entry.values.push(Number(row.egg_rate));
    cityAgg.set(row.cities.slug, entry);

    const state = stateAgg.get(row.states.slug) ?? { name: row.states.name, values: [] };
    state.values.push(Number(row.egg_rate));
    stateAgg.set(row.states.slug, state);
  }

  type NationalRow = { egg_rate: number; effective_date: string };
  const nationalRows = (nationalData ?? []) as unknown as NationalRow[];
  const nationalLatest = nationalRows.reduce<string>(
    (latest, row) => (row.effective_date > latest ? row.effective_date : latest),
    "",
  );
  const nationalAverage = mean(
    nationalRows.filter((row) => row.effective_date === nationalLatest).map((row) => Number(row.egg_rate)),
  );
  const stateAverage = mean(stateAgg.get(cityRecord.states.slug)?.values ?? []);

  const benchmarks: CityBenchmark[] = [
    {
      label: `${cityRecord.states.name} average`,
      perEgg: stateAverage,
      difference: round(perEgg - stateAverage),
      differencePercent: pct(perEgg, stateAverage),
    },
    {
      label: "National average",
      perEgg: nationalAverage,
      difference: round(perEgg - nationalAverage),
      differencePercent: pct(perEgg, nationalAverage),
    },
  ];

  const origin: [number, number] | null =
    cityRecord.latitude !== null && cityRecord.longitude !== null
      ? [Number(cityRecord.latitude), Number(cityRecord.longitude)]
      : null;

  const comparisons: CityComparison[] = [...cityAgg.entries()]
    .filter(([citySlug]) => citySlug !== slug)
    .map(([citySlug, entry]) => {
      const value = mean(entry.values);
      return {
        name: entry.name,
        slug: citySlug,
        stateName: entry.stateName,
        perEgg: value,
        difference: round(perEgg - value),
        distanceKm:
          origin && entry.lat !== null && entry.lng !== null
            ? haversine(origin, [entry.lat, entry.lng])
            : Number.POSITIVE_INFINITY,
      };
    });

  const nearbyCities = [...comparisons]
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 8)
    .map((entry) => ({
      ...entry,
      distanceKm: Number.isFinite(entry.distanceKm) ? entry.distanceKm : 0,
    }));

  const stateCities = comparisons
    .filter((entry) => entry.stateName === cityRecord.states.name)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .map((entry) => ({
      ...entry,
      distanceKm: Number.isFinite(entry.distanceKm) ? entry.distanceKm : 0,
    }));

  const nearbyStates = [...stateAgg.entries()]
    .filter(([stateSlug]) => stateSlug !== cityRecord.states.slug)
    .map(([stateSlug, entry]) => {
      const value = mean(entry.values);
      return {
        name: entry.name,
        slug: stateSlug,
        perEgg: value,
        difference: round(perEgg - value),
      };
    })
    .sort((a, b) => Math.abs(a.difference) - Math.abs(b.difference))
    .slice(0, 8);

  return {
    city: {
      name: cityRecord.name,
      slug: cityRecord.slug,
      stateName: cityRecord.states.name,
      stateSlug: cityRecord.states.slug,
      latitude: cityRecord.latitude === null ? null : Number(cityRecord.latitude),
      longitude: cityRecord.longitude === null ? null : Number(cityRecord.longitude),
      population: cityRecord.population,
      seoTitle: cityRecord.seo_title,
      metaDescription: cityRecord.meta_description,
    },
    summary,
    series,
    markets,
    history,
    analytics,
    benchmarks,
    nearbyCities,
    stateCities,
    nearbyStates,
    popularCities,
    faqs: (faqData ?? []) as Faq[],
    articles,
  };
}
