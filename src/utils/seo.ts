import { SITE } from "@/lib/constants";

type MetaTag = Record<string, string>;

export interface SeoInput {
  title: string;
  description: string;
  /** Route path, always starting with "/". */
  path: string;
  type?: "website" | "article";
  image?: string;
  noindex?: boolean;
  publishedAt?: string;
  modifiedAt?: string;
}

/** Absolute when a base URL is configured, relative otherwise. */
export function canonicalUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.baseUrl}${clean === "/" ? "/" : clean.replace(/\/$/, "")}`;
}

export function pageTitle(title: string): string {
  if (!title) return SITE.name;
  return title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
}

export function fillTemplate(template: string, vars: Record<string, string>) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{${key}}`, "g"), value);
  }
  return result;
}

/** Builds the `meta` array for a route's head(). */
export function buildMeta(input: SeoInput): MetaTag[] {
  const title = pageTitle(input.title);
  const url = canonicalUrl(input.path);
  const meta: MetaTag[] = [
    { title },
    { name: "description", content: input.description },
    { property: "og:title", content: title },
    { property: "og:description", content: input.description },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:url", content: url },
    { property: "og:site_name", content: SITE.name },
    { property: "og:locale", content: "en_IN" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: input.description },
  ];
  if (input.image) {
    meta.push({ property: "og:image", content: input.image });
    meta.push({ name: "twitter:image", content: input.image });
  }
  if (input.noindex) meta.push({ name: "robots", content: "noindex, nofollow" });
  if (input.publishedAt)
    meta.push({ property: "article:published_time", content: input.publishedAt });
  if (input.modifiedAt)
    meta.push({ property: "article:modified_time", content: input.modifiedAt });
  return meta;
}

export function buildLinks(path: string) {
  return [{ rel: "canonical", href: canonicalUrl(path) }];
}

type JsonLd = Record<string, unknown>;

export function jsonLdScript(schema: JsonLd | JsonLd[]) {
  return { type: "application/ld+json", children: JSON.stringify(schema) };
}

/** One-call helper returning a complete head() payload. */
export function buildSeo(input: SeoInput & { schema?: JsonLd | JsonLd[] }) {
  return {
    meta: buildMeta(input),
    links: buildLinks(input.path),
    ...(input.schema ? { scripts: [jsonLdScript(input.schema)] } : {}),
  };
}

/* ---------------------------------- Schemas --------------------------------- */

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: canonicalUrl("/"),
    description: SITE.description,
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: canonicalUrl("/"),
    inLanguage: "en-IN",
  };
}

export function breadcrumbSchema(items: { name: string; href: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.href),
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function productRateSchema(input: {
  name: string;
  price: number;
  areaServed: string;
  validFrom: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    category: "Poultry/Eggs",
    offers: {
      "@type": "Offer",
      price: input.price.toFixed(2),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      areaServed: input.areaServed,
      priceValidUntil: input.validFrom,
    },
  };
}

export function webPageSchema(input: {
  name: string;
  description: string;
  path: string;
  modifiedAt?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    description: input.description,
    url: canonicalUrl(input.path),
    inLanguage: "en-IN",
    isPartOf: { "@type": "WebSite", name: SITE.name, url: canonicalUrl("/") },
    ...(input.modifiedAt ? { dateModified: input.modifiedAt } : {}),
  };
}

/** Dataset schema for a price series — helps rate tables qualify for rich results. */
export function datasetSchema(input: {
  name: string;
  description: string;
  path: string;
  areaServed: string;
  modifiedAt?: string;
  temporalCoverage?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: input.name,
    description: input.description,
    url: canonicalUrl(input.path),
    license: canonicalUrl("/terms"),
    isAccessibleForFree: true,
    creator: { "@type": "Organization", name: SITE.name, url: canonicalUrl("/") },
    spatialCoverage: { "@type": "Place", name: input.areaServed },
    variableMeasured: "Egg price per piece (INR)",
    ...(input.temporalCoverage ? { temporalCoverage: input.temporalCoverage } : {}),
    ...(input.modifiedAt ? { dateModified: input.modifiedAt } : {}),
  };
}

/** Article schema for the long-form local guide rendered on a rate page. */
export function articleSchema(input: {
  headline: string;
  description: string;
  path: string;
  publishedAt?: string;
  modifiedAt?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl(input.path) },
    inLanguage: "en-IN",
    author: { "@type": "Organization", name: SITE.name, url: canonicalUrl("/") },
    publisher: { "@type": "Organization", name: SITE.name, url: canonicalUrl("/") },
    ...(input.publishedAt ? { datePublished: input.publishedAt } : {}),
    ...(input.modifiedAt ? { dateModified: input.modifiedAt } : {}),
  };
}
