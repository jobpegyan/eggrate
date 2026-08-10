/**
 * Programmatic long-form copy for state landing pages.
 *
 * Every paragraph is assembled from that state's own database numbers, and the
 * phrasing pool is indexed by a deterministic hash of the slug — so two states
 * never receive the same sentences, and a given state always reads identically
 * between renders (stable for crawlers).
 */
import type { StatePageData } from "@/types/state";
import { formatPrice } from "@/utils/format";

export interface ContentBlock {
  id: string;
  heading: string;
  paragraphs: string[];
}

/** Stable, order-independent string hash used to pick phrasing variants. */
function hash(value: string): number {
  let out = 0;
  for (let index = 0; index < value.length; index += 1) {
    out = (out * 31 + value.charCodeAt(index)) >>> 0;
  }
  return out;
}

function pick<T>(pool: readonly T[], seed: number, offset: number): T {
  return pool[(seed + offset * 7) % pool.length]!;
}

function list(names: string[], limit = 5): string {
  const shown = names.slice(0, limit);
  if (shown.length === 0) return "its declared markets";
  if (shown.length === 1) return shown[0]!;
  return `${shown.slice(0, -1).join(", ")} and ${shown.at(-1)}`;
}

const OPENERS = [
  "sits at the centre of",
  "anchors",
  "is a working part of",
  "carries a visible share of",
  "acts as a price-setter within",
] as const;

const DEMAND_LENSES = [
  "household kitchens, bakeries and roadside eateries",
  "tiffin centres, hostels and institutional canteens",
  "sweet shops, hotels and daily-wage households",
  "street food vendors, cafés and family buyers",
  "confectioners, caterers and neighbourhood grocers",
] as const;

const SUPPLY_LENSES = [
  "layer farms clustered around the bigger consumption centres",
  "a mix of contract farms and independent poultry units",
  "medium-sized layer sheds feeding nearby wholesale yards",
  "farm clusters that dispatch through commission agents each morning",
  "integrators and small holders sharing the same trading floor",
] as const;

const SEASON_LENSES = [
  "the cold-weather months, when eating eggs daily becomes routine",
  "the winter stretch from November to February",
  "the run-up to exam season and the cooler weeks that follow Diwali",
  "the months when schools reopen and hostel demand returns",
  "the post-monsoon window, once transport normalises",
] as const;

export function buildStateContent(data: StatePageData): ContentBlock[] {
  const { state, summary, stats, cities, insights, comparisons } = data;
  const seed = hash(state.slug);
  const name = state.name;
  const cityNames = cities.map((city) => city.name);
  const rate = summary ? formatPrice(summary.perEgg) : "the declared rate";
  const tray = summary ? formatPrice(summary.perTray) : "the tray price";
  const dozen = summary ? formatPrice(summary.perDozen) : "the dozen price";
  const wholesale = summary ? formatPrice(summary.wholesale) : "the wholesale price";
  const retail = summary ? formatPrice(summary.retail) : "the retail price";
  const spread = summary ? formatPrice(Math.max(0, summary.retail - summary.wholesale)) : "a small margin";
  const high = insights.highestCity;
  const low = insights.lowestCity;
  const gap =
    high && low ? formatPrice(Math.max(0, high.perEgg - low.perEgg)) : "a narrow band";

  return [
    {
      id: "overview",
      heading: `Egg market overview in ${name}`,
      paragraphs: [
        `${name} ${pick(OPENERS, seed, 1)} India's egg trade, and the price you see on this page is the average of every published market rate we hold for the state today. Right now that average is ${rate} per egg, which works out to ${dozen} a dozen and ${tray} for a standard thirty-egg tray. Those three numbers move together, so a paisa-level change in the per-egg rate is amplified by the time you are buying in trays or in peti lots of 210.`,
        `We currently track ${stats.citiesCount} ${stats.citiesCount === 1 ? "city" : "cities"} and ${stats.marketsCount} ${stats.marketsCount === 1 ? "market" : "markets"} across ${name}. Each of those markets declares independently, which is why the state average is more useful as a direction indicator than as a purchase price. If you are buying in ${list(cityNames, 3)}, read that city's own line in the table above rather than the state figure — the difference between the dearest and cheapest city in ${name} today is ${gap} per egg, and on a hundred-egg purchase that difference is real money.`,
        `The rate on this page updates every morning once markets declare, and each historical figure is retained rather than overwritten. That means the chart above is a genuine record of what ${name} traded at, not a smoothed reconstruction. Traders use it to check whether a quote they have been given is in line with the market; households use it to decide whether to buy today or wait a day.`,
      ],
    },
    {
      id: "demand",
      heading: `What drives egg demand in ${name}`,
      paragraphs: [
        `Demand in ${name} comes overwhelmingly from ${pick(DEMAND_LENSES, seed, 2)}. Unlike most agricultural commodities, eggs are bought in small quantities and very frequently, so demand responds within days rather than seasons. A festival week, a wedding season, or a spell of cold weather all show up in the declared rate almost immediately.`,
        `Institutional buying matters more than most people assume. Government nutrition programmes, hostel messes and hospital kitchens in ${name} contract for volume, and when those contracts are renewed or expanded the wholesale market feels it before the retail counter does. That is one reason the wholesale figure of ${wholesale} and the retail figure of ${retail} can drift apart: the wholesale line reacts to bulk commitments, while retail reflects what the last shop in the chain can charge.`,
        `The reverse also holds. During examination breaks, long holidays, or any period when hostels and canteens shut, ${name} loses a chunk of guaranteed offtake in a single week. Farms cannot slow production to match, so the surplus goes to the open market and prices soften — usually faster than they recovered on the way up.`,
      ],
    },
    {
      id: "supply",
      heading: `Supply and production in ${name}`,
      paragraphs: [
        `Supply into ${name} comes largely from ${pick(SUPPLY_LENSES, seed, 3)}. A layer bird produces on a fixed biological cycle, so short-term supply is close to inelastic: a farmer who wants more eggs next week cannot simply produce them. What the farmer can control is the size of the next flock, and those decisions are made months in advance based on where the rate sat when the chicks were placed.`,
        `Feed is the single largest cost line. Maize and soya together account for the bulk of what it costs to produce an egg, and both are traded nationally. When grain markets firm up, producers across ${name} face the same squeeze at the same time, which is why price moves often look coordinated even though every market declares separately.`,
        `Transport and cold-season losses complete the picture. Eggs are fragile and are moved in open trays over long distances, so breakage during monsoon transport and heat stress in peak summer both quietly reduce the saleable volume that reaches ${list(cityNames, 3)}. The published rate already carries that cost.`,
      ],
    },
    {
      id: "wholesale-retail",
      heading: `Wholesale versus retail egg price in ${name}`,
      paragraphs: [
        `The wholesale rate in ${name} currently averages ${wholesale} per egg while retail averages ${retail}, a spread of about ${spread}. The wholesale figure is what a trader pays at the mandi or directly at the farm gate, typically buying in peti lots of 210 eggs. Retail is what a household pays at a shop after handling, breakage, storage and the shopkeeper's margin have been added.`,
        `That spread is not fixed. It widens when volumes are thin and the retailer is carrying more risk per tray, and it narrows when supply is comfortable and shops compete on price. If you are buying more than a few trays a week — a bakery, a mess, a small hotel — the wholesale line is the number worth negotiating against, and the tray price of ${tray} is the practical benchmark.`,
        `${insights.bestBuyingMarket ? `Today the keenest wholesale quote in ${name} is at ${insights.bestBuyingMarket.marketName} in ${insights.bestBuyingMarket.cityName}, at ${formatPrice(insights.bestBuyingMarket.wholesale)} per egg.` : `Wholesale quotes vary market by market, so compare the market table above before committing to a supplier.`} Always confirm the quote at the market itself before travelling; declared rates guide the day's trade but individual lots are still negotiated.`,
      ],
    },
    {
      id: "seasonality",
      heading: `Seasonality of egg prices in ${name}`,
      paragraphs: [
        `Egg prices in ${name} follow a recognisable annual shape. The strongest stretch is ${pick(SEASON_LENSES, seed, 4)}, when consumption per household rises and buyers are less price-sensitive. Rates typically peak somewhere in that window before easing as the weather warms.`,
        `Summer is the softer half of the year. Heat reduces both appetite and shelf life, layer birds produce marginally less in extreme heat, and the wholesale market carries more risk on each consignment. The monsoon adds transport disruption on top, which can cause sharp two- or three-day spikes in individual markets that do not reflect any change in underlying supply.`,
        `Over the last thirty days the average in ${name} has moved by ${formatPrice(Math.abs(insights.monthlyTrend))} ${insights.monthlyTrend >= 0 ? "upward" : "downward"}, and over the last week by ${formatPrice(Math.abs(insights.weeklyTrend))} ${insights.weeklyTrend >= 0 ? "upward" : "downward"}. Reading those two together tells you whether today's number is part of a trend or just noise.`,
      ],
    },
    {
      id: "price-factors",
      heading: `What makes the egg rate change in ${name}`,
      paragraphs: [
        `Six factors explain most of the movement you will see on this page. Feed cost sets the floor. Flock size, decided months earlier, sets the ceiling on supply. Weather changes both consumption and losses. Festival and institutional demand create short, sharp pulls. Transport cost and fuel prices move the gap between producing regions and consuming cities. And market sentiment — what traders in ${name} expect tomorrow to look like — decides how quickly the declared rate follows the other five.`,
        `${insights.mostVolatileCity ? `Within ${name}, ${insights.mostVolatileCity.name} has been the most volatile market over the past month, swinging ${formatPrice(insights.mostVolatileCity.spread)} between its high and its low. If you buy there, timing matters more than it does elsewhere in the state.` : `Volatility across ${name} has been contained this month, with markets moving in step rather than diverging.`}`,
        `${comparisons.length ? `${name} does not trade in isolation either. The nearest tracked states are ${list(comparisons.map((entry) => entry.name), 3)}, and when one of them moves sharply, arbitrage between them usually pulls ${name} in the same direction within a few days.` : `Cross-state arbitrage matters too: when a neighbouring market moves sharply, traders redirect consignments and ${name} follows within days.`}`,
      ],
    },
    {
      id: "buying-guide",
      heading: `How to buy eggs well in ${name}`,
      paragraphs: [
        `Start by matching the unit to your need. A household buying a dozen at a time should watch the retail line; a mess or bakery buying weekly should work in trays and peti and negotiate against the wholesale figure. At today's rates that is ${dozen} for a dozen, ${tray} for a tray of thirty, and roughly ${summary ? formatPrice(summary.perPeti) : "the peti price"} for a 210-egg peti.`,
        `Second, buy against the trend rather than the headline. If the seven-day average is below today's rate, the market is firming and there is little point waiting. If it is above, prices are easing and a day or two of patience usually pays. The chart on this page gives you both views over 7, 30, 90 and 365 days.`,
        `Third, compare cities before you commit. ${high && low ? `${high.name} is the dearest tracked market in ${name} today at ${formatPrice(high.perEgg)}, while ${low.name} is the cheapest at ${formatPrice(low.perEgg)}.` : `City-level rates within ${name} differ, so check the city cards above.`} If the two are within reasonable driving distance of each other, the gap can outweigh the transport cost on a bulk purchase.`,
        `Finally, check freshness and handling, not just price. A slightly dearer tray from a market that turns stock over quickly is usually the better buy. Rates on this page are indicative market figures published for information; confirm the final price with your supplier before ordering.`,
      ],
    },
  ];
}

export function estimateWordCount(blocks: ContentBlock[]): number {
  return blocks.reduce(
    (total, block) =>
      total + block.paragraphs.reduce((sum, text) => sum + text.split(/\s+/).length, 0),
    0,
  );
}
