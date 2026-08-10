/**
 * Deterministic market insights derived from a city's own rate history.
 * Reads like analyst commentary, but every sentence is computed — no model calls,
 * no invented facts, and the same data always yields the same wording.
 */
import type { CityInsight, CityPageData } from "@/types/city";
import { formatPrice } from "@/utils/format";

export function buildCityInsights(data: CityPageData): CityInsight[] {
  const { city, summary, analytics, benchmarks, nearbyCities } = data;
  if (!summary) return [];

  const insights: CityInsight[] = [];
  const name = city.name;
  const change = summary.change;

  insights.push({
    id: "today",
    title: "Today's trend",
    tone: change > 0 ? "negative" : change < 0 ? "positive" : "neutral",
    body:
      change === 0
        ? `${name} is holding flat at ${formatPrice(summary.perEgg)} per egg, unchanged from the previous trading day. A steady quote usually means arrivals and offtake are matched.`
        : `${name} ${change > 0 ? "moved up" : "eased"} ${formatPrice(Math.abs(change))} per egg (${Math.abs(summary.changePercent).toFixed(2)}%) to ${formatPrice(summary.perEgg)}, ${change > 0 ? "so buyers are paying more" : "so buyers get a small break"} against the previous session.`,
  });

  const weekVsMonth = analytics.weeklyAverage - analytics.monthlyAverage;
  insights.push({
    id: "why",
    title: "Why the price moved",
    tone: weekVsMonth > 0 ? "negative" : weekVsMonth < 0 ? "positive" : "neutral",
    body: `Over the last 30 sessions ${name} closed higher on ${analytics.daysUp} days and lower on ${analytics.daysDown}. The 7-day average of ${formatPrice(analytics.weeklyAverage)} sits ${weekVsMonth >= 0 ? "above" : "below"} the 30-day average of ${formatPrice(analytics.monthlyAverage)}, which points to ${weekVsMonth >= 0 ? "demand running ahead of local arrivals" : "comfortable supply reaching the market"} rather than a one-day distortion.`,
  });

  insights.push({
    id: "weekly",
    title: "Weekly movement",
    tone: "neutral",
    body: `The 90-day range for ${name} runs from ${formatPrice(analytics.lowest)} to ${formatPrice(analytics.highest)}, and volatility is ${analytics.volatilityLabel} at ${analytics.volatility.toFixed(2)}%. ${analytics.volatilityLabel === "high" ? "With swings this wide, timing a bulk purchase is worth a day or two of patience." : analytics.volatilityLabel === "low" ? "With swings this narrow, waiting for a better price rarely pays here." : "Moderate swings mean modest gains are available to buyers who watch the daily rate."}`,
  });

  insights.push({
    id: "demand",
    title: "Expected demand",
    tone: analytics.demandLabel === "strong" ? "negative" : analytics.demandLabel === "soft" ? "positive" : "neutral",
    body: `Our demand reading for ${name} is ${analytics.demandIndex}/100 (${analytics.demandLabel}) against a supply reading of ${analytics.supplyIndex}/100 (${analytics.supplyLabel}). Both are inferred from how the local price has behaved over the past month, not from survey data, so treat them as direction rather than volume.`,
  });

  const stateBenchmark = benchmarks[0];
  const nationalBenchmark = benchmarks[1];
  const cheaperNeighbour = [...nearbyCities].sort((a, b) => a.perEgg - b.perEgg)[0];
  insights.push({
    id: "recommendation",
    title: "Business recommendation",
    tone: "neutral",
    body: `${stateBenchmark && stateBenchmark.perEgg ? `${name} is trading ${formatPrice(Math.abs(stateBenchmark.difference))} ${stateBenchmark.difference >= 0 ? "above" : "below"} the ${stateBenchmark.label.toLowerCase()}` : `${name} is trading in line with its state`}${nationalBenchmark && nationalBenchmark.perEgg ? ` and ${formatPrice(Math.abs(nationalBenchmark.difference))} ${nationalBenchmark.difference >= 0 ? "above" : "below"} the national average` : ""}. ${cheaperNeighbour && cheaperNeighbour.perEgg < summary.perEgg ? `If you buy in volume, ${cheaperNeighbour.name} is ${formatPrice(summary.perEgg - cheaperNeighbour.perEgg)} cheaper per egg and roughly ${cheaperNeighbour.distanceKm} km away — worth checking whether the saving clears your transport cost.` : `Local wholesale is competitive against nearby markets today, so there is little to gain by sourcing from out of town.`}`,
  });

  return insights;
}
