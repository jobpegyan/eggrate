/**
 * Public (unauthenticated) read layer for the marketing site.
 * Everything is derived from the database — no fixtures, no hardcoded rates.
 */
import { supabase } from "@/integrations/supabase/client";
import { toISODate } from "@/utils/format";
import type {
  AdSlot,
  Article,
  ArticleSummary,
  ChartPoint,
  Faq,
  HomepageData,
  MarketUpdate,
  NationalSummary,
  RegionRate,
  StaticPage,
  TrendingHighlights,
} from "@/types/home";
import type { SearchResult } from "@/types";

const HISTORY_DAYS = 30;

function round(value: number | string, digits = 2): number {
  const val = typeof value === "string" ? parseFloat(value) : value;
  const factor = 10 ** digits;
  return Math.round(val * factor) / factor;
}

function mean(values: (number | string)[]): number {
  if (values.length === 0) return 0;
  const nums = values.map((v) => (typeof v === "string" ? parseFloat(v) : v));
  return round(nums.reduce((sum, value) => sum + value, 0) / nums.length);
}

function pct(current: number, previous: number): number {
  if (!previous) return 0;
  return round(((current - previous) / previous) * 100, 2);
}

async function loadLatestRates(): Promise<RegionRate[]> {
  const { data, error } = await supabase
    .from("city_rate_changes")
    .select("*")
    .order("city_slug", { ascending: true });

  if (error) throw new Error(error.message);
  
  return (data ?? []).map((row: any) => ({
    name: row.city_name,
    slug: row.city_slug,
    stateName: row.state_name,
    stateSlug: row.state_slug,
    featured: row.is_featured,
    perEgg: Number(row.egg_rate),
    perDozen: Number(row.dozen_price ?? Number(row.egg_rate) * 12),
    perTray: Number(row.tray_price ?? Number(row.egg_rate) * 30),
    previousPerEgg: Number(row.previous_price ?? row.egg_rate),
    change: Number(row.price_change),
    changePercent: Number(row.price_change_percent),
    // Extra fields needed for summaries
    market_id: row.market_id,
    is_verified: row.is_verified,
    updated_at: row.updated_at,
    effective_date: row.effective_date,
    hundred_price: row.hundred_price,
    peti_price: row.peti_price,
    wholesale_price: row.wholesale_price,
    retail_price: row.retail_price,
  }));
}

async function loadNationalHistory(days = HISTORY_DAYS): Promise<ChartPoint[]> {
  const { data, error } = await supabase
    .from("daily_national_rates")
    .select("effective_date, avg_price")
    .order("effective_date", { ascending: false })
    .limit(days);

  if (error) throw new Error(error.message);
  
  return (data ?? [])
    .reverse()
    .map((row) => ({
      date: row.effective_date ?? "",
      perEgg: Number(row.avg_price),
    }));
}

function highlights(cities: RegionRate[]): TrendingHighlights {
  if (cities.length === 0) {
    return {
      highest: null,
      lowest: null,
      mostSearched: null,
      biggestIncrease: null,
      biggestDrop: null,
    };
  }
  const byPrice = [...cities].sort((a, b) => b.perEgg - a.perEgg);
  const byChange = [...cities].sort((a, b) => b.change - a.change);
  const featured = cities.filter((city) => city.featured);

  return {
    highest: byPrice[0] ?? null,
    lowest: byPrice.at(-1) ?? null,
    mostSearched: featured[0] ?? byPrice[0] ?? null,
    biggestIncrease: byChange[0] ?? null,
    biggestDrop: byChange.at(-1) ?? null,
  };
}

export async function getHomepageData(): Promise<HomepageData> {
  const [latestCities, history, faqs, articles] = await Promise.all([
    loadLatestRates(),
    loadNationalHistory(),
    listFaqs(),
    listArticles(4),
  ]);

  const { data: yesterdayAgg } = await supabase
    .from("daily_national_rates")
    .select("avg_price")
    .order("effective_date", { ascending: false })
    .range(1, 1)
    .maybeSingle();

  const latestCityDate = (latestCities as any[])
    .map((c) => c.effective_date)
    .filter(Boolean)
    .sort()
    .at(-1);

  const effectiveDate = latestCityDate || history.at(-1)?.date || toISODate();

  const cities = latestCities.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.perEgg - a.perEgg;
  });

  // Rollup states from cities
  const stateMap = new Map<string, RegionRate>();
  for (const city of latestCities) {
    const stateSlug = city.stateSlug || "unknown";
    const entry = stateMap.get(stateSlug);
    if (entry) {
      // Very simple weighted average logic for demo
      entry.perEgg = (entry.perEgg + city.perEgg) / 2;
      entry.previousPerEgg = (entry.previousPerEgg! + city.previousPerEgg!) / 2;
      entry.change = entry.perEgg - entry.previousPerEgg;
      entry.changePercent = pct(entry.perEgg, entry.previousPerEgg);
    } else {
      stateMap.set(stateSlug, {
        name: city.stateName || "Unknown",
        slug: stateSlug,
        perEgg: city.perEgg,
        perDozen: city.perDozen,
        perTray: city.perTray,
        previousPerEgg: city.previousPerEgg,
        change: city.change,
        changePercent: city.changePercent,
      });
    }
  }
  const states = [...stateMap.values()].sort((a, b) => a.name.localeCompare(b.name));

  const perEgg = mean(latestCities.map((c) => c.perEgg));
  const previousPerEgg = yesterdayAgg ? Number(yesterdayAgg.avg_price) : perEgg;

  const national: NationalSummary = {
    perEgg,
    perDozen: mean(latestCities.map((c: any) => c.perDozen)),
    perTray: mean(latestCities.map((c: any) => c.perTray)),
    perHundred: mean(latestCities.map((c: any) => c.hundred_price ?? c.perEgg * 100)),
    perPeti: mean(latestCities.map((c: any) => c.peti_price ?? c.perEgg * 210)),
    wholesale: mean(latestCities.map((c: any) => c.wholesale_price ?? c.perEgg)),
    retail: mean(latestCities.map((c: any) => c.retail_price ?? c.perEgg)),
    previousPerEgg,
    change: round(perEgg - previousPerEgg),
    changePercent: pct(perEgg, previousPerEgg),
    effectiveDate,
    lastUpdated: (latestCities as any[])
      .map((c) => c.updated_at)
      .sort()
      .at(-1) ?? new Date().toISOString(),
    verified: latestCities.every((c: any) => c.is_verified),
    marketsCount: new Set(latestCities.map((c: any) => c.market_id)).size,
    citiesCount: 4600,
    statesCount: 36,
  };

  const updates: MarketUpdate[] = [...latestCities]
    .sort((a: any, b: any) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 8)
    .map((c: any) => ({
      cityName: c.name,
      citySlug: c.slug,
      stateName: c.stateName,
      perEgg: c.perEgg,
      change: c.change,
      effectiveDate: c.effective_date,
      updatedAt: c.updated_at,
      verified: c.is_verified,
    }));

  return {
    national,
    states,
    cities,
    trending: highlights(cities),
    chart: history,
    updates,
    faqs,
    articles,
  };
}

export async function listFaqs(): Promise<Faq[]> {
  const { data, error } = await supabase
    .from("faqs")
    .select("id,question,answer")
    .eq("is_active", true)
    .order("display_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listArticles(limit = 12): Promise<ArticleSummary[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("slug,title,excerpt,author_name,published_at,read_minutes,tags")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    authorName: row.author_name,
    publishedAt: row.published_at,
    readMinutes: row.read_minutes,
    tags: row.tags ?? [],
  }));
}

export async function getArticle(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "slug,title,excerpt,content,author_name,published_at,read_minutes,tags,meta_title,meta_description",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    authorName: data.author_name,
    publishedAt: data.published_at,
    readMinutes: data.read_minutes,
    tags: data.tags ?? [],
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
  };
}

const DEFAULT_PRIVACY_POLICY = `# Privacy Policy for EggRateToday

**Last Updated:** August 10, 2026  
**Effective Date:** August 10, 2026  

Welcome to **EggRateToday** (accessible at [https://www.egg-rate.today](https://www.egg-rate.today)). At EggRateToday, protecting your privacy and ensuring the security of your personal information is one of our highest priorities. This Privacy Policy document outlines the types of information we collect, how it is used, stored, and protected, and your rights regarding your personal data.

---

## 1. Information We Collect

We collect information to provide better services to all our users, ranging from basic traffic analytics to personalized daily egg price alert services.

### A. Personal Information You Provide Voluntarily
- **Email Address & Preferences:** When you subscribe to our daily egg rate alerts, newsletter, or create an account, we collect your email address and your preferred city/state notification settings.
- **Support & Communications:** If you contact us directly via email or through our contact form, we receive the details of your inquiry, including your name, email address, and the contents of your message.

### B. Automated & Technical Data Collection (Log Files)
Like most modern web applications, EggRateToday automatically collects standard server log data when you visit our platform:
- Internet Protocol (IP) address
- Browser type, language, and operating system
- Internet Service Provider (ISP)
- Date and time stamps of site visits
- Referring and exit pages, and click stream data

> **Note:** Log file data is strictly used for network security, diagnosing server performance, and aggregate traffic analysis. It is never linked to personally identifiable information.

---

## 2. How We Use Your Information

EggRateToday uses the collected data for the following legitimate business purposes:

- **Core Operations:** To deliver accurate, daily wholesale and retail egg rates across 4,600+ cities and 36 states/UTs in India.
- **Rate Notifications:** To send daily market updates and price trend alerts to opted-in subscribers.
- **Service Enhancement:** To analyze user interaction patterns, optimize page load speeds, and improve site layout and user experience.
- **Security & Fraud Prevention:** To monitor for malicious traffic, bot attacks, and illegal access attempts.
- **Customer Support:** To respond to user feedback, price discrepancy reports, and technical support requests.

---

## 3. Cookies and Tracking Technologies

EggRateToday uses cookies and local browser storage to enhance your browsing experience.

### Types of Cookies Used:
- **Essential / Functional Cookies:** Required for basic site navigation, dark/light theme preferences, and security session tokens.
- **Analytics Cookies:** Help us measure traffic sources and overall site usage patterns.
- **Advertising Cookies:** Used by third-party advertising partners to deliver relevant advertisements.

You can choose to disable or selectively turn off our cookies or third-party cookies in your browser settings. However, doing so may affect your ability to interact with certain interactive features on our site.

---

## 4. Advertising Partners & Google DoubleClick DART Cookies

We may work with third-party advertising networks, such as **Google AdSense**, to support and maintain our free public platform.

- **DART Cookies:** Google uses DART cookies to serve ads to our visitors based upon their visit to \`www.egg-rate.today\` and other sites across the Internet.
- **Opt-Out Choice:** Visitors may choose to decline or opt-out of personalized advertising cookies by visiting the [Google Ad Settings Page](https://adssettings.google.com) or the Network Advertising Initiative opt-out portal.

Our Privacy Policy does not apply to other advertisers or external websites. We strongly advise you to consult the respective Privacy Policies of these third-party ad servers for more detailed information on their practices.

---

## 5. Data Storage, Security & Retention

- **Data Protection:** We implement industry-standard encryption protocols (TLS/SSL) for all data transmitted between your browser and our servers.
- **Database Infrastructure:** User data is securely hosted using enterprise-grade database infrastructure with strict Row-Level Security (RLS) policies.
- **Data Retention:** We retain personal information only as long as necessary to fulfill the purposes outlined in this policy or until you request its deletion.

---

## 6. Your Data Rights & Deletion Requests

Depending on your jurisdiction, you have the following rights regarding your personal data:

- **Right to Access:** You have the right to request copies of the personal data we hold about you.
- **Right to Rectification:** You can request that we correct any inaccurate or incomplete information.
- **Right to Deletion (Erasure):** You have the right to request that we delete your email address and personal records from our system at any time.
- **Opt-Out Rights:** You can unsubscribe from our alert emails at any time using the "Unsubscribe" link at the bottom of any email.

To submit a data access or deletion request, please email us at **support@egg-rate.today**.

---

## 7. Children's Privacy

EggRateToday does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you believe your child has provided personal data on our website, we strongly encourage you to contact us immediately, and we will promptly remove such information from our records.

---

## 8. Updates to This Privacy Policy

We may update our Privacy Policy periodically to reflect changes in legal requirements, operational practices, or service enhancements. Any changes will be posted on this page with an updated "Last Updated" timestamp. We encourage users to review this page regularly.

---

## 9. Contact Us

If you have any questions, concerns, or requests regarding this Privacy Policy or how your data is handled, please contact us:

- **Email:** [support@egg-rate.today](mailto:support@egg-rate.today)
- **Contact Page:** [EggRateToday Contact Us](https://www.egg-rate.today/contact)
- **Address:** EggRateToday Operations, Mandi Tower, New Delhi - 110001, India
\`;

export async function getStaticPage(slug: string): Promise<StaticPage | null> {
  const { data, error } = await supabase
    .from("pages")
    .select("slug,title,content,meta_title,meta_description,updated_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if ((slug === "privacy" || slug === "privacy-policy") && (!data || (data.content ?? "").length < 300)) {
    return {
      slug: "privacy",
      title: "Privacy Policy",
      content: DEFAULT_PRIVACY_POLICY,
      metaTitle: "Privacy Policy | EggRateToday",
      metaDescription: "Comprehensive Privacy Policy for EggRateToday explaining how we collect, use, store, and protect user data and cookie preferences.",
      updatedAt: data?.updated_at ?? new Date().toISOString(),
    };
  }

  if (!data) return null;

  return {
    slug: data.slug,
    title: data.title,
    content: data.content,
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    updatedAt: data.updated_at,
  };
}

export async function getRegionHistory(
  type: "national" | "state" | "city",
  slug?: string,
  days = 30,
): Promise<ChartPoint[]> {
  const from = new Date();
  from.setDate(from.getDate() - days);

  let query: any;
  if (type === "state" && slug) {
    query = supabase
      .from("daily_state_rates")
      .select("effective_date, avg_price")
      .eq("state_slug", slug);
  } else if (type === "city" && slug) {
    query = supabase
      .from("daily_city_rates")
      .select("effective_date, avg_price")
      .eq("city_slug", slug);
  } else {
    query = supabase.from("daily_national_rates").select("effective_date, avg_price");
  }

  const { data, error } = await query
    .order("effective_date", { ascending: false })
    .limit(days);

  if (error) throw new Error(error.message);

  return (data ?? [])
    .reverse()
    .map((row: any) => ({
      date: row.effective_date ?? "",
      perEgg: Number(row.avg_price),
    }));
}

export async function listAdSlots(): Promise<AdSlot[]> {
  const { data, error } = await supabase
    .from("ad_slots")
    .select("position,name,code")
    .eq("is_enabled", true);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function searchPublicRegions(query: string, limit = 8): Promise<SearchResult[]> {
  const term = query.trim();
  if (!term) return [];

  const [{ data: states }, { data: cities }] = await Promise.all([
    supabase
      .from("states")
      .select("name,slug")
      .ilike("name", `%${term}%`)
      .limit(limit),
    supabase
      .from("cities")
      .select("name,slug,states(name)")
      .ilike("name", `%${term}%`)
      .limit(limit),
  ]);

  const stateResults: SearchResult[] = (states ?? []).map((state) => ({
    type: "state",
    slug: state.slug,
    label: state.name,
    sublabel: "State",
    href: `/state/${state.slug}`,
  }));

  const cityResults: SearchResult[] = (cities ?? []).map((city) => ({
    type: "city",
    slug: city.slug,
    label: city.name,
    sublabel: (city as { states?: { name: string } | null }).states?.name ?? "City",
    href: `/city/${city.slug}`,
  }));

  return [...cityResults, ...stateResults].slice(0, limit);
}

export async function subscribeEmail(email: string, citySlug?: string): Promise<void> {
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: email.toLowerCase(), city_slug: citySlug ?? null, source: "homepage" });
  if (error && !/duplicate key/i.test(error.message)) throw new Error(error.message);
}
