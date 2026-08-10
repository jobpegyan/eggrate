export interface HistorySummary {
  price: number;
  date: string;
  highestCity?: string;
  highestPrice?: number;
  lowestCity?: string;
  lowestPrice?: number;
}

export interface RegionHistoryPoint {
  date: string;
  price: number;
}

export interface ComparisonSeries {
  label: string;
  data: RegionHistoryPoint[];
}

export interface ComparisonData {
  periods: string[];
  series: ComparisonSeries[];
}

export interface MoverItem {
  name: string;
  slug: string;
  state: string;
  price: number;
  change: number;
  percent: number;
}

export interface RegionMovers {
  gainers: MoverItem[];
  losers: MoverItem[];
}

export interface CoverageStats {
  totalCities: number;
  updatedCities: number;
  coveragePercent: number;
  date: string;
}
