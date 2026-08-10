/**
 * Programmatic long-form copy for city landing pages.
 *
 * Sentences are assembled from that city's own database figures, and phrasing
 * variants are chosen by a deterministic hash of the slug — so no two cities
 * read alike, and a given city renders identically on every request.
 */
import type { ContentBlock } from "@/lib/state-content";
import type { CityPageData } from "@/types/city";
import { formatNumber, formatPrice } from "@/utils/format";

function hash(value: string): number {
  let out = 0;
  for (let index = 0; index < value.length; index += 1) {
    out = (out * 31 + value.charCodeAt(index)) >>> 0;
  }
  return out;
}

function pick<T>(pool: readonly T[], seed: number, offset: number): T {
  return pool[(seed + offset * 11) % pool.length]!;
}

function join(names: string[], limit = 4): string {
  const shown = names.slice(0, limit);
  if (shown.length === 0) return "";
  if (shown.length === 1) return shown[0]!;
  return `${shown.slice(0, -1).join(", ")} and ${shown.at(-1)}`;
}

const CITY_ROLES = [
  "a consumption market that pulls eggs in from farms outside its own limits",
  "both a trading point and a large consumer in its own right",
  "a distribution hub whose quote is watched by smaller towns nearby",
  "a steady, high-volume buyer with predictable daily offtake",
  "a market where household and institutional buying arrive in roughly equal measure",
] as const;

const TRADE_RHYTHMS = [
  "Trading opens early, and the day's rate is usually settled before most shops raise their shutters",
  "Quotes firm up in the first hours of the morning, once arrivals are counted",
  "The rate is declared once the morning consignments are unloaded and weighed",
  "Prices are set at the start of the day and rarely revised before the next session",
  "Rates move in the morning window and then hold for the rest of the trading day",
] as const;

const RETAIL_HABITS = [
  "buy in dozens two or three times a week",
  "pick up half a dozen at a time from the nearest kirana",
  "buy a tray at a time and keep it for the week",
  "shop daily, in small quantities, close to home",
  "split purchases between a weekly tray and top-ups mid-week",
] as const;

const STORAGE_ANGLES = [
  "the humidity that follows the monsoon",
  "long summer afternoons with no cooling in transit",
  "the temperature swing between morning and midday",
  "warm storerooms in tightly packed market lanes",
  "the wait between the wholesale lot and the retail shelf",
] as const;

export function buildCityContent(data: CityPageData): ContentBlock[] {
  const { city, summary, markets, analytics, benchmarks, nearbyCities } = data;
  const seed = hash(city.slug);
  const name = city.name;
  const state = city.stateName;

  const rate = summary ? formatPrice(summary.perEgg) : "the declared rate";
  const dozen = summary ? formatPrice(summary.perDozen) : "the dozen price";
  const tray = summary ? formatPrice(summary.perTray) : "the tray price";
  const hundred = summary ? formatPrice(summary.perHundred) : "the hundred-egg price";
  const peti = summary ? formatPrice(summary.perPeti) : "the peti price";
  const wholesale = summary ? formatPrice(summary.wholesale) : "the wholesale price";
  const retail = summary ? formatPrice(summary.retail) : "the retail price";
  const spread = summary ? formatPrice(Math.abs(summary.retail - summary.wholesale)) : "a small margin";

  const marketNames = markets.map((market) => market.marketName);
  const wholesaleMarkets = markets.filter((market) => market.supportsWholesale);
  const retailMarkets = markets.filter((market) => market.supportsRetail);
  const stateBenchmark = benchmarks[0];
  const nationalBenchmark = benchmarks[1];
  const nearest = nearbyCities[0];
  const cheapestNearby = [...nearbyCities].sort((a, b) => a.perEgg - b.perEgg)[0];

  return [
    {
      id: "overview",
      heading: `${name} egg market overview`,
      paragraphs: [
        `${name} in ${state} is ${pick(CITY_ROLES, seed, 1)}. The rate you see at the top of this page — ${rate} per egg — is the average of every market in ${name} that has declared today, which is why it is a fair reference point for the city as a whole rather than a quote from any single trader.${city.population ? ` With a population of roughly ${formatNumber(city.population)}, daily egg consumption here is large enough that even a small move in the declared rate changes what the city spends in a week.` : ""}`,
        `${pick(TRADE_RHYTHMS, seed, 2)}. We track ${markets.length} ${markets.length === 1 ? "market" : "markets"} in ${name}${marketNames.length ? ` — ${join(marketNames)}` : ""}, and each one is listed separately in the table above with its own wholesale and retail line. Reading them side by side is more useful than reading the city average alone, because a bakery buying in bulk and a household buying a dozen are effectively shopping in two different markets.`,
        `${stateBenchmark && stateBenchmark.perEgg ? `Against the rest of ${state}, ${name} is currently ${formatPrice(Math.abs(stateBenchmark.difference))} ${stateBenchmark.difference >= 0 ? "dearer" : "cheaper"} per egg.` : `${name} tracks closely with the rest of ${state}.`}${nationalBenchmark && nationalBenchmark.perEgg ? ` Against the all-India average it is ${formatPrice(Math.abs(nationalBenchmark.difference))} ${nationalBenchmark.difference >= 0 ? "above" : "below"}.` : ""} That gap is not arbitrary: it reflects how far eggs travel to reach ${name}, how many traders compete here, and how much of the local demand is committed in advance to canteens and institutions.`,
      ],
    },
    {
      id: "wholesale-markets",
      heading: `Wholesale egg markets in ${name}`,
      paragraphs: [
        `${wholesaleMarkets.length ? `Wholesale trade in ${name} runs through ${join(wholesaleMarkets.map((market) => market.marketName))}.` : `Wholesale trade in ${name} runs through the markets listed in the table above.`} Wholesale here means buying by the peti — a case of 210 eggs — or by the tray in multiples. At today's rate a peti works out to about ${peti} per egg, and a hundred eggs to ${hundred}.`,
        `The wholesale quote of ${wholesale} is what traders, hotels, bakeries and mess contractors negotiate against. It moves first and moves fastest, because wholesalers carry the inventory risk: unsold stock loses value quickly, so they adjust the asking price the moment arrivals exceed what the city can absorb. If you buy more than a few trays a week in ${name}, this is the line to watch.`,
        `Practical advice for bulk buyers: confirm the day's quote by phone before travelling, ask whether breakage is priced in or deducted separately, and check whether the lot is farm-fresh or has already spent a day in storage. Declared rates guide the market, but the final invoice is still negotiated lot by lot.`,
      ],
    },
    {
      id: "retail-trends",
      heading: `Retail egg prices in ${name}`,
      paragraphs: [
        `Retail in ${name} is currently averaging ${retail} per egg, roughly ${spread} above the wholesale line. ${retailMarkets.length ? `Retail-facing markets include ${join(retailMarkets.map((market) => market.marketName))}, and` : "Beyond the formal markets,"} the eggs actually reach consumers through thousands of kirana stores, poultry outlets, pushcarts and supermarket shelves, each adding its own handling cost.`,
        `Most households in ${name} ${pick(RETAIL_HABITS, seed, 3)}. That buying pattern matters: because purchases are small and frequent, retail prices tend to move in round steps rather than in paise, and a shopkeeper often absorbs a small wholesale increase for a few days before passing it on. When you see a sharp jump at the counter, it usually reflects a wholesale move that happened several days earlier.`,
        `In practical terms a dozen eggs in ${name} costs about ${dozen} today and a thirty-egg tray about ${tray}. Buying the tray rather than the dozen is almost always the cheaper unit, provided you can store it properly — which the next section covers.`,
      ],
    },
    {
      id: "demand",
      heading: `Egg demand in ${name}`,
      paragraphs: [
        `Demand in ${name} is a mix of household consumption, food service and institutional buying. Households provide the steady base. Food service — hotels, bakeries, street vendors, cloud kitchens — provides the volatile layer that expands during festival weeks and wedding season and contracts sharply during holidays. Institutional buyers such as hostels, hospital kitchens and nutrition programmes commit to volume in advance, which anchors a portion of the city's offtake regardless of price.`,
        `Our demand reading for ${name} is currently ${analytics.demandIndex} out of 100, which we classify as ${analytics.demandLabel}. It is inferred from price behaviour rather than surveyed volumes: over the last thirty sessions the city closed higher on ${analytics.daysUp} days and lower on ${analytics.daysDown}, and the 7-day average of ${formatPrice(analytics.weeklyAverage)} sits ${analytics.weeklyAverage >= analytics.monthlyAverage ? "above" : "below"} the 30-day average of ${formatPrice(analytics.monthlyAverage)}.`,
        `Because eggs are cheap relative to other protein, demand in ${name} is fairly inelastic in the short run — a fifty-paise rise does not stop people buying. What does change consumption is weather and habit: cold weeks lift it, extreme heat suppresses it, and school and hostel calendars move institutional volume in blocks.`,
      ],
    },
    {
      id: "supply",
      heading: `Egg supply into ${name}`,
      paragraphs: [
        `Supply reaches ${name} from layer farms in and around ${state}, dispatched daily and moved by road in open trays. Our supply reading for the city is ${analytics.supplyIndex} out of 100, currently ${analytics.supplyLabel}. Layer birds lay on a fixed biological cycle, so short-term supply cannot be increased on demand; what arrives tomorrow was effectively decided months ago when the flock was placed.`,
        `That inelasticity is why ${name} can see sharp price moves from small changes in arrivals. If two or three consignments are delayed, the city is short that morning and the rate jumps; if arrivals overshoot, wholesalers cut quickly rather than hold stock. ${analytics.volatilityLabel === "high" ? `That is visible in the numbers here: volatility over the last month has been high at ${analytics.volatility.toFixed(2)}%.` : analytics.volatilityLabel === "low" ? `Even so, ${name} has been unusually steady lately, with volatility of just ${analytics.volatility.toFixed(2)}% over the last month.` : `Volatility of ${analytics.volatility.toFixed(2)}% over the last month puts ${name} in the middle of the range.`}`,
        `Feed cost sits behind all of it. Maize and soya make up the bulk of production cost, and both are traded nationally, so when grain firms up every farm supplying ${name} feels it at once. Transport fuel adds a second layer, and it weighs more heavily on cities that draw their eggs from farther away.`,
      ],
    },
    {
      id: "seasonality",
      heading: `Seasonal price pattern in ${name}`,
      paragraphs: [
        `Egg prices in ${name} follow the national winter-strong, summer-soft rhythm, with local variations. From late autumn onward, consumption per household rises and rates climb, usually peaking somewhere in the coldest weeks. As the weather warms, both appetite and shelf life fall, and the market softens.`,
        `The monsoon is the disruptive season rather than the expensive one. Roads slow, breakage in transit rises, and individual markets in ${name} can spike for two or three days without any change in underlying supply. Those spikes correct quickly, which is why the 7-day average is a better guide than any single day's quote during the rains.`,
        `Over the past 90 days ${name} has traded between ${formatPrice(analytics.lowest)}${analytics.lowestDate ? ` (on ${analytics.lowestDate})` : ""} and ${formatPrice(analytics.highest)}${analytics.highestDate ? ` (on ${analytics.highestDate})` : ""}. That band is the realistic planning range for anyone budgeting egg purchases in the city over a quarter.`,
      ],
    },
    {
      id: "factors",
      heading: `What affects the egg rate in ${name}`,
      paragraphs: [
        `Six forces explain most of what you see on this page. Feed cost sets the production floor. Flock placement decisions, made months earlier, cap how much can arrive. Weather changes both consumption and losses. Festival, wedding and institutional demand create short, sharp pulls. Transport cost and fuel prices set the premium ${name} pays over producing districts. And trader sentiment decides how fast the declared rate reacts to the other five.`,
        `Local competition matters too. Where several wholesalers compete for the same buyers, margins compress and the city tracks the state average closely. Where trade is concentrated in fewer hands, the spread between wholesale and retail — currently ${spread} in ${name} — tends to widen.`,
        `${nearest ? `Arbitrage with nearby markets is the final check on price. ${nearest.name} is about ${nearest.distanceKm} km away and trading at ${formatPrice(nearest.perEgg)}; when the gap between two nearby cities grows wider than the cost of moving a truckload, traders redirect consignments and the gap closes within days.` : `Arbitrage with nearby markets acts as the final check on price: when one city runs well above its neighbours, consignments are redirected and the gap closes.`}`,
      ],
    },
    {
      id: "buying-guide",
      heading: `Egg buying guide for ${name}`,
      paragraphs: [
        `Match the unit to your need. A household is served by the dozen at ${dozen} or the tray at ${tray}. A tiffin service, bakery or mess should be working in peti at roughly ${peti} per egg and negotiating against the wholesale line of ${wholesale}, not the retail counter.`,
        `Time the purchase against the trend rather than the headline number. If today's rate is below the 7-day average of ${formatPrice(analytics.weeklyAverage)}, you are buying well. If it is meaningfully above the 30-day average of ${formatPrice(analytics.monthlyAverage)}, and volatility is ${analytics.volatilityLabel}, a short wait has historically paid off in ${name}.`,
        `${cheapestNearby && summary && cheapestNearby.perEgg < summary.perEgg ? `For large orders, compare out of town: ${cheapestNearby.name} is ${formatPrice(summary.perEgg - cheapestNearby.perEgg)} per egg cheaper and around ${cheapestNearby.distanceKm} km away. On a few peti that saving will not cover a trip; on a truckload it might.` : `For large orders, compare the nearby cities listed further down this page before committing — the saving on bulk lots can outweigh transport if a neighbouring market is running softer.`}`,
        `Finally, judge freshness alongside price. Ask when the lot arrived, check for hairline cracks, and prefer a supplier whose stock turns over daily. A marginally dearer tray from a fast-moving shop is usually the better buy in ${name}.`,
      ],
    },
    {
      id: "storage",
      heading: `Storing eggs in ${name}`,
      paragraphs: [
        `Storage matters here because of ${pick(STORAGE_ANGLES, seed, 4)}. Eggs keep best cool, dry and pointed-end down, which keeps the yolk centred and the air cell stable. Left at room temperature in a warm kitchen, quality falls noticeably within days; refrigerated at a steady temperature, a tray comfortably lasts several weeks.`,
        `Two rules save more eggs than anything else. Do not wash eggs before storing — washing strips the natural cuticle that keeps bacteria out. And avoid moving them repeatedly between cold and warm, since the condensation that forms on a chilled shell is exactly what lets contamination through.`,
        `For bulk buyers in ${name}, rotate stock strictly first-in-first-out, keep trays off the floor and away from strong-smelling goods (shells absorb odour), and store the peti in the coolest part of the premises. Handled properly, breakage and spoilage on a bulk purchase should stay in low single-digit percentages — which, at ${rate} per egg, is the difference between a profitable order and a marginal one.`,
      ],
    },
    {
      id: "business",
      heading: `Egg business opportunities in ${name}`,
      paragraphs: [
        `The most common way into the trade in ${name} is distribution rather than production: buying at the wholesale line of ${wholesale} and supplying shops, hotels or offices at a small markup. It needs working capital, a cool storage space and a reliable vehicle far more than it needs scale, and margins depend almost entirely on how tightly you control breakage.`,
        `A second route is direct supply to food service. Bakeries, tiffin services, hostels and cloud kitchens in ${name} value delivery reliability and consistent size grading more than the last few paise on price, and they buy on standing orders — which turns a volatile daily market into predictable monthly revenue.`,
        `Small-scale production is the harder path. It ties up capital in birds and sheds, exposes you to feed prices you cannot control, and only rewards operators who can hold their nerve through soft seasons like the summer stretch. Anyone considering it should study the 1-year chart on this page first: the low of ${formatPrice(analytics.lowest)} matters far more to a producer's viability than the high of ${formatPrice(analytics.highest)}.`,
        `Whichever route you take, price transparency is the cheapest advantage available. Checking the ${name} rate daily against ${state} and the national average — all three of which are on this page — tells you whether the quote in front of you is fair before you commit to it.`,
      ],
    },
  ];
}
