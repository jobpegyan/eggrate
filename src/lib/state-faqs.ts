/** Builds state-specific FAQs from live figures, then appends editorial FAQs. */
import type { Faq } from "@/types/home";
import type { StatePageData } from "@/types/state";
import { formatDateLong, formatPrice } from "@/utils/format";

export function buildStateFaqs(data: StatePageData): Faq[] {
  const { state, summary, stats, insights, comparisons } = data;
  const name = state.name;
  const generated: Faq[] = [];

  if (summary) {
    generated.push(
      {
        id: `${state.slug}-today`,
        question: `What is today's egg rate in ${name}?`,
        answer: `The average egg rate in ${name} today is ${formatPrice(summary.perEgg)} per egg, which is ${formatPrice(summary.perDozen)} per dozen and ${formatPrice(summary.perTray)} for a tray of 30. This is the average of all markets we track in the state for ${formatDateLong(summary.effectiveDate)}.`,
      },
      {
        id: `${state.slug}-wholesale`,
        question: `What is the wholesale egg price in ${name}?`,
        answer: `Wholesale eggs in ${name} average ${formatPrice(summary.wholesale)} per egg today, against a retail average of ${formatPrice(summary.retail)}. Wholesale rates apply to bulk purchases, usually in peti lots of 210 eggs at roughly ${formatPrice(summary.perPeti)} per egg.`,
      },
      {
        id: `${state.slug}-change`,
        question: `Has the egg rate in ${name} gone up or down?`,
        answer: `Compared with the previous trading day the rate has ${summary.change > 0 ? "risen" : summary.change < 0 ? "fallen" : "stayed flat"} by ${formatPrice(Math.abs(summary.change))} per egg (${summary.changePercent.toFixed(2)}%). Over the past week the average is ${formatPrice(summary.weeklyAverage)} and over the past month ${formatPrice(summary.monthlyAverage)}, with a monthly high of ${formatPrice(summary.highest)} and low of ${formatPrice(summary.lowest)}.`,
      },
    );
  }

  if (insights.highestCity && insights.lowestCity) {
    generated.push({
      id: `${state.slug}-cheapest`,
      question: `Which city has the cheapest eggs in ${name}?`,
      answer: `${insights.lowestCity.name} currently has the lowest tracked rate in ${name} at ${formatPrice(insights.lowestCity.perEgg)} per egg, while ${insights.highestCity.name} is the highest at ${formatPrice(insights.highestCity.perEgg)}.`,
    });
  }

  generated.push({
    id: `${state.slug}-coverage`,
    question: `How many egg markets are tracked in ${name}?`,
    answer: `We track ${stats.citiesCount} ${stats.citiesCount === 1 ? "city" : "cities"} and ${stats.marketsCount} ${stats.marketsCount === 1 ? "market" : "markets"} across ${name}. Each market declares its own rate and the state figure shown here is the average of those declarations.`,
  });

  if (comparisons.length > 0) {
    const cheaper = comparisons.filter((entry) => entry.difference > 0);
    generated.push({
      id: `${state.slug}-nearby`,
      question: `Are eggs cheaper in states near ${name}?`,
      answer: cheaper.length
        ? `Yes — ${cheaper
            .slice(0, 2)
            .map((entry) => `${entry.name} is ${formatPrice(entry.difference)} per egg cheaper`)
            .join(", and ")}. Nearby tracked states include ${comparisons.map((entry) => entry.name).join(", ")}.`
        : `Not today. ${name} is currently at or below the rate of nearby tracked states including ${comparisons.map((entry) => entry.name).join(", ")}.`,
    });
  }

  generated.push({
    id: `${state.slug}-update`,
    question: `How often is the ${name} egg rate updated?`,
    answer: `Rates for ${name} are updated every morning once markets declare their price for the day, and every past rate is retained so the charts on this page show the real trading history rather than an estimate.`,
  });

  return [...generated, ...data.faqs];
}
