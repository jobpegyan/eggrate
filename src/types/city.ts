/** View models for the programmatic city landing pages. */
import type { ArticleSummary, ChartPoint, Faq } from "@/types/home";

export interface CityRateSummary {
  perEgg: number;
  previousPerEgg: number;
  change: number;
  changePercent: number;
  perDozen: number;
  perTray: number;
  perHundred: number;
  perPeti: number;
  wholesale: number;
  retail: number;
  effectiveDate: string;
  previousDate: string | null;
  lastUpdated: string;
  verified: boolean;
}

export interface CityMarketRow {
  id: string;
  marketName: string;
  marketSlug: string;
  marketType: "wholesale" | "retail" | "both";
  supportsWholesale: boolean;
  supportsRetail: boolean;
  perEgg: number;
  wholesale: number;
  retail: number;
  updatedAt: string;
  verified: boolean;
  distanceKm: number | null;
}

export interface CityHistoryRow {
  date: string;
  perEgg: number;
  wholesale: number;
  retail: number;
  difference: number;
  changePercent: number;
}

export interface CityAnalytics {
  weeklyAverage: number;
  monthlyAverage: number;
  quarterlyAverage: number;
  highest: number;
  highestDate: string | null;
  lowest: number;
  lowestDate: string | null;
  volatility: number;
  volatilityLabel: "low" | "moderate" | "high";
  demandIndex: number;
  demandLabel: "soft" | "steady" | "strong";
  supplyIndex: number;
  supplyLabel: "tight" | "balanced" | "surplus";
  daysUp: number;
  daysDown: number;
}

export interface CityComparison {
  name: string;
  slug: string;
  stateName: string;
  perEgg: number;
  difference: number;
  distanceKm: number;
}

export interface CityBenchmark {
  label: string;
  perEgg: number;
  difference: number;
  differencePercent: number;
}

export interface CitySeries {
  d7: ChartPoint[];
  d30: ChartPoint[];
  d90: ChartPoint[];
  d365: ChartPoint[];
}

export interface CityInsight {
  id: string;
  title: string;
  body: string;
  tone: "positive" | "negative" | "neutral";
}

export interface CityPageData {
  city: {
    name: string;
    slug: string;
    stateName: string;
    stateSlug: string;
    latitude: number | null;
    longitude: number | null;
    population: number | null;
    seoTitle: string | null;
    metaDescription: string | null;
  };
  summary: CityRateSummary | null;
  series: CitySeries;
  markets: CityMarketRow[];
  history: CityHistoryRow[];
  analytics: CityAnalytics;
  benchmarks: CityBenchmark[];
  nearbyCities: CityComparison[];
  stateCities: CityComparison[];
  nearbyStates: { name: string; slug: string; perEgg: number; difference: number }[];
  popularCities: { name: string; slug: string; stateName: string }[];
  faqs: Faq[];
  articles: ArticleSummary[];
}
