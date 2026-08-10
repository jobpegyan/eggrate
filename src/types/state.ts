/** View models for the programmatic state landing pages. */
import type { ArticleSummary, ChartPoint, Faq, RegionRate } from "@/types/home";

export interface StateRateSummary {
  perEgg: number;
  previousPerEgg: number;
  change: number;
  changePercent: number;
  weeklyAverage: number;
  monthlyAverage: number;
  highest: number;
  lowest: number;
  wholesale: number;
  retail: number;
  perDozen: number;
  perTray: number;
  perHundred: number;
  perPeti: number;
  effectiveDate: string;
  lastUpdated: string;
  verified: boolean;
}

export interface MarketRow {
  id: string;
  marketName: string;
  cityName: string;
  citySlug: string;
  perEgg: number;
  wholesale: number;
  retail: number;
  updatedAt: string;
  verified: boolean;
}

export interface StateStats {
  citiesCount: number;
  marketsCount: number;
  averageRate: number;
  highestRate: number;
  lowestRate: number;
  lastUpdated: string;
}

export interface StateInsights {
  highestCity: RegionRate | null;
  lowestCity: RegionRate | null;
  averageRate: number;
  weeklyTrend: number;
  monthlyTrend: number;
  mostVolatileCity: { name: string; slug: string; spread: number } | null;
  bestBuyingMarket: MarketRow | null;
}

export interface StateComparison {
  name: string;
  slug: string;
  perEgg: number;
  difference: number;
  distanceKm: number;
}

export interface StateSeries {
  d7: ChartPoint[];
  d30: ChartPoint[];
  d90: ChartPoint[];
  d365: ChartPoint[];
}

export interface StatePageData {
  state: {
    name: string;
    slug: string;
    code: string | null;
    seoTitle: string | null;
    metaDescription: string | null;
  };
  summary: StateRateSummary | null;
  stats: StateStats;
  cities: RegionRate[];
  markets: MarketRow[];
  series: StateSeries;
  insights: StateInsights;
  comparisons: StateComparison[];
  relatedStates: StateComparison[];
  faqs: Faq[];
  articles: ArticleSummary[];
}
