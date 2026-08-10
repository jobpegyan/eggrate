/** Global, environment-independent application constants. */

export const SITE = {
  name: "EggRateToday",
  shortName: "EggRateToday",
  tagline: "Today's egg rate across every Indian state & city",
  description:
    "Daily NECC egg rates for every state and city in India. Live mandi prices, historical trends and wholesale/retail comparisons, updated every morning.",
  locale: "en-IN",
  /** Relative URLs are used until a production domain is attached. */
  baseUrl: "https://www.egg-rate.today",
  twitter: "@eggratetoday",
} as const;

export const CURRENCY = "INR" as const;

/** Locales the UI is prepared to serve. Only `en` is wired up today. */
export const SUPPORTED_LOCALES = ["en", "hi", "te", "ta"] as const;
export const DEFAULT_LOCALE = "en";

/** Feature flags, kept centrally so pages never branch on env vars directly. */
export const FEATURES = {
  maintenanceMode: false,
  adsense: false,
  multiLanguage: false,
} as const;

/** Cache windows (seconds) for server responses. */
export const CACHE = {
  rates: 60 * 15,
  static: 60 * 60 * 24,
  sitemap: 60 * 60,
} as const;

export const NAV_LINKS = [
  { label: "Today's Rate", to: "/" },
  { label: "States", to: "/states" },
  { label: "Cities", to: "/cities" },
  { label: "History", to: "/trends" },
  { label: "AI Analysis", to: "/egg-market-analysis" },
  { label: "Blog", to: "/blog" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

/** Legal / policy links rendered in the footer. */
export const LEGAL_LINKS = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Disclaimer", to: "/disclaimer" },
  { label: "Contact", to: "/contact" },
] as const;