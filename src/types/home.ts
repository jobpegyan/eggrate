/** Public homepage view models. Pure types — no runtime imports. */

export interface NationalSummary {
  perEgg: number;
  perDozen: number;
  perTray: number;
  perHundred: number;
  perPeti: number;
  wholesale: number;
  retail: number;
  previousPerEgg: number;
  change: number;
  changePercent: number;
  effectiveDate: string;
  lastUpdated: string;
  verified: boolean;
  marketsCount: number;
  citiesCount: number;
  statesCount: number;
}

export interface RegionRate {
  name: string;
  slug: string;
  stateName?: string;
  stateSlug?: string;
  perEgg: number;
  perDozen: number;
  perTray: number;
  previousPerEgg: number;
  change: number;
  changePercent: number;
  featured?: boolean;
}

export interface TrendingHighlights {
  highest: RegionRate | null;
  lowest: RegionRate | null;
  mostSearched: RegionRate | null;
  biggestIncrease: RegionRate | null;
  biggestDrop: RegionRate | null;
}

export interface ChartPoint {
  date: string;
  perEgg: number;
}

export interface MarketUpdate {
  cityName: string;
  citySlug: string;
  stateName: string;
  perEgg: number;
  change: number;
  effectiveDate: string;
  updatedAt: string;
  verified: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface ArticleSummary {
  slug: string;
  title: string;
  excerpt: string | null;
  authorName: string | null;
  publishedAt: string;
  readMinutes: number;
  tags: string[];
}

export interface Article extends ArticleSummary {
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface StaticPage {
  slug: string;
  title: string;
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: string;
}

export interface AdSlot {
  position: string;
  name: string;
  code: string | null;
}

export interface HomepageData {
  national: NationalSummary | null;
  states: RegionRate[];
  cities: RegionRate[];
  trending: TrendingHighlights;
  chart: ChartPoint[];
  updates: MarketUpdate[];
  faqs: Faq[];
  articles: ArticleSummary[];
}
