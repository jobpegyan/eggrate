/** City-specific FAQs generated from live figures, followed by editorial FAQs. */
import type { Faq } from "@/types/home";
import type { CityPageData } from "@/types/city";
import { formatDateLong, formatPrice } from "@/utils/format";

export function buildCityFaqs(data: CityPageData): Faq[] {
  const { city, summary, markets, analytics, benchmarks, nearbyCities } = data;
  const name = city.name;
  const generated: Faq[] = [];

  if (summary) {
    generated.push(
      {
        id: `${city.slug}-today`,
        question: `What is today's egg rate in ${name}?`,
        answer: `Today's egg rate in ${name} is ${formatPrice(summary.perEgg)} per egg, ${formatPrice(summary.perDozen)} per dozen, ${formatPrice(summary.perTray)} for a 30-egg tray and ${formatPrice(summary.perPeti)} for a 210-egg peti, as declared on ${formatDateLong(summary.effectiveDate)}.`,
      },
      {
        id: `${city.slug}-wholesale-retail`,
        question: `What is the difference between wholesale and retail egg price in ${name}?`,
        answer: `Wholesale eggs in ${name} are quoted at ${formatPrice(summary.wholesale)} per egg while retail sits at ${formatPrice(summary.retail)}, a difference of ${formatPrice(Math.abs(summary.retail - summary.wholesale))}. Wholesale applies to bulk lots bought at the market; retail is the shop counter price after handling, breakage and margin.`,
      },
      {
        id: `${city.slug}-different`,
        question: `Why is the ${name} egg rate different from other cities?`,
        answer: `${benchmarks[0]?.perEgg ? `${name} trades ${formatPrice(Math.abs(benchmarks[0].difference))} ${benchmarks[0].difference >= 0 ? "above" : "below"} the ${benchmarks[0].label.toLowerCase()}` : `Every market in India declares independently`}${benchmarks[1]?.perEgg ? ` and ${formatPrice(Math.abs(benchmarks[1].difference))} ${benchmarks[1].difference >= 0 ? "above" : "below"} the national average` : ""}. Distance from producing farms, local transport cost, how much of the city's demand is institutional, and how many traders compete in the local mandi all shift the declared price.`,
      },
    );
  }

  generated.push({
    id: `${city.slug}-update`,
    question: `How often is the ${name} egg rate updated?`,
    answer: `The ${name} rate is updated every morning as soon as local markets declare, and each day's figure is stored permanently so the charts and history table on this page show the real trading record rather than an estimate.`,
  });

  const wholesaleMarkets = markets.filter((market) => market.supportsWholesale);
  generated.push({
    id: `${city.slug}-buy-wholesale`,
    question: `Where can I buy wholesale eggs in ${name}?`,
    answer: wholesaleMarkets.length
      ? `${wholesaleMarkets.map((market) => market.marketName).join(", ")} ${wholesaleMarkets.length === 1 ? "handles" : "handle"} wholesale volumes in ${name}. Wholesale lots are usually sold by the peti of 210 eggs; confirm the day's quote at the market before travelling, since individual lots are still negotiated.`
      : `Wholesale eggs in ${name} are traded through the markets listed in the table above. Buying by the peti of 210 eggs gets you the wholesale line rather than the retail counter price.`,
  });

  generated.push({
    id: `${city.slug}-volatility`,
    question: `Is the egg price in ${name} stable?`,
    answer: `Volatility in ${name} is currently ${analytics.volatilityLabel} at ${analytics.volatility.toFixed(2)}% over the past 30 days. The 90-day range runs from ${formatPrice(analytics.lowest)} to ${formatPrice(analytics.highest)}, with a 7-day average of ${formatPrice(analytics.weeklyAverage)} and a 30-day average of ${formatPrice(analytics.monthlyAverage)}.`,
  });

  if (nearbyCities.length > 0) {
    const cheapest = [...nearbyCities].sort((a, b) => a.perEgg - b.perEgg)[0]!;
    generated.push({
      id: `${city.slug}-nearby`,
      question: `Which city near ${name} has the cheapest eggs?`,
      answer: `Among the markets closest to ${name}, ${cheapest.name} is currently the cheapest at ${formatPrice(cheapest.perEgg)} per egg, about ${cheapest.distanceKm} km away. Nearby tracked cities also include ${nearbyCities.slice(0, 4).map((entry) => entry.name).join(", ")}.`,
    });
  }

  return [...generated, ...data.faqs];
}
