import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { AdSlot, StickyMobileAd } from "@/components/ads/ad-slot";
import { PageSkeleton } from "@/components/common/skeletons";
import { Container, Section } from "@/components/common/section";
import { CityAnalyticsSection } from "@/components/city/city-analytics";
import { CityChart } from "@/components/city/city-chart";
import { CityCompare } from "@/components/city/city-compare";
import { CityHero } from "@/components/city/city-hero";
import { CityHistory } from "@/components/city/city-history";
import { CityInsights } from "@/components/city/city-insights";
import { CityMarkets } from "@/components/city/city-markets";
import { CityRelated } from "@/components/city/city-related";
import { FaqSection } from "@/components/home/faq-section";
import { LatestArticles } from "@/components/home/latest-articles";
import { Newsletter } from "@/components/home/newsletter";
import { StateContent } from "@/components/state/state-content";
import { Button } from "@/components/ui/button";
import { buildCityContent } from "@/lib/city-content";
import { buildCityFaqs } from "@/lib/city-faqs";
import { buildCityInsights } from "@/lib/city-insights";
import { cityPageQuery } from "@/services/public-queries";
import { fetchSeoTemplate } from "@/services/seo.functions";
import type { CityPageData } from "@/types/city";
import { formatPrice } from "@/utils/format";
import {
  articleSchema,
  breadcrumbSchema,
  buildSeo,
  datasetSchema,
  faqSchema,
  fillTemplate,
  organizationSchema,
  productRateSchema,
  webPageSchema,
} from "@/utils/seo";

/** Meta text comes from the city's own record and today's figures. */
function seoTexts(data: CityPageData) {
  const { city, summary, markets } = data;
  const title =
    city.seoTitle ??
    (summary
      ? `Egg Rate Today in ${city.name} — ${formatPrice(summary.perEgg)} per Egg`
      : `Egg Rate Today in ${city.name}`);
  const description =
    city.metaDescription ??
    (summary
      ? `Today's egg rate in ${city.name}, ${city.stateName} is ${formatPrice(summary.perEgg)} per egg, ${formatPrice(summary.perDozen)} per dozen, ${formatPrice(summary.perTray)} per tray and ${formatPrice(summary.perPeti)} per peti. Wholesale ${formatPrice(summary.wholesale)}, retail ${formatPrice(summary.retail)}, with ${markets.length} market rates and 1-year price history.`
      : `Live wholesale and retail egg prices for ${city.name}, ${city.stateName}, updated every morning with full price history.`);
  return { title, description };
}

export const Route = createFileRoute("/city/$slug")({
  loader: async ({ context, params }) => {
    const [data, seoTemplate] = await Promise.all([
      context.queryClient.ensureQueryData(cityPageQuery(params.slug)),
      fetchSeoTemplate({ data: { pageType: "city" } }),
    ]);
    if (!data) throw notFound();
    return { ...data, seoTemplate };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "City not found | EggRateToday" }, { name: "robots", content: "noindex" }],
      };
    }
    const data = loaderData;
    const path = `/city/${params.slug}`;
    const { title: fallbackTitle, description: fallbackDescription } = seoTexts(data);
    const template = (data as any).seoTemplate;

    const vars = {
      city: data.city.name,
      state: data.city.stateName,
      rate: data.summary ? formatPrice(data.summary.perEgg) : "",
      markets: String(data.markets.length),
    };

    const title = template?.title_template
      ? fillTemplate(template.title_template, vars)
      : fallbackTitle;

    const description = template?.description_template
      ? fillTemplate(template.description_template, vars)
      : fallbackDescription;

    const faqs = buildCityFaqs(data);
    return buildSeo({
      title,
      description,
      path,
      schema: [
        organizationSchema(),
        webPageSchema({
          name: title,
          description,
          path,
          ...(data.summary?.lastUpdated ? { modifiedAt: data.summary.lastUpdated } : {}),
        }),
        breadcrumbSchema([
          { name: "States", href: "/states" },
          { name: data.city.stateName, href: `/state/${data.city.stateSlug}` },
          { name: data.city.name, href: path },
        ]),
        datasetSchema({
          name: `Daily egg prices in ${data.city.name}`,
          description: `Daily wholesale and retail egg price observations for markets in ${data.city.name}, ${data.city.stateName}, India.`,
          path,
          areaServed: `${data.city.name}, ${data.city.stateName}, India`,
          temporalCoverage: data.series.d365[0]
            ? `${data.series.d365[0].date}/${data.summary?.effectiveDate ?? data.series.d365.at(-1)?.date}`
            : undefined,
          ...(data.summary?.lastUpdated ? { modifiedAt: data.summary.lastUpdated } : {}),
        }),
        articleSchema({
          headline: `Egg rate in ${data.city.name}: prices, markets and buying guide`,
          description,
          path,
          ...(data.summary?.effectiveDate ? { publishedAt: data.summary.effectiveDate } : {}),
          ...(data.summary?.lastUpdated ? { modifiedAt: data.summary.lastUpdated } : {}),
        }),
        ...(data.summary
          ? [
              productRateSchema({
                name: `Egg rate in ${data.city.name}`,
                price: data.summary.perEgg,
                areaServed: `${data.city.name}, ${data.city.stateName}, India`,
                validFrom: data.summary.effectiveDate,
              }),
            ]
          : []),
        faqSchema(faqs),
      ],
    });
  },
  pendingComponent: PageSkeleton,
  notFoundComponent: CityNotFound,
  errorComponent: ({ error }) => (
    <Container className="py-16">
      <h1 className="font-display text-2xl font-semibold">Could not load this city</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <Button asChild className="mt-6">
        <Link to="/cities">Back to all cities</Link>
      </Button>
    </Container>
  ),
  component: CityPage,
});

function CityNotFound() {
  return (
    <Container className="py-16 text-center">
      <h1 className="font-display text-3xl font-semibold">City not found</h1>
      <p className="mt-3 text-muted-foreground">
        We don't track egg rates for that city yet. Browse every city we cover instead.
      </p>
      <Button asChild className="mt-6">
        <Link to="/cities">View all cities</Link>
      </Button>
    </Container>
  );
}

function CityPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(cityPageQuery(slug));
  if (!data) return <CityNotFound />;

  const blocks = buildCityContent(data);
  const faqs = buildCityFaqs(data);
  const insights = buildCityInsights(data);
  const crumbs = [
    { name: "States", href: "/states" },
    { name: data.city.stateName, href: `/state/${data.city.stateSlug}` },
    { name: data.city.name, href: `/city/${data.city.slug}` },
  ];

  return (
    <>
      <AdSlot position="header_banner" className="pt-4" minHeight={90} />

      <CityHero data={data} crumbs={crumbs} />

      <AdSlot position="below_hero" className="pt-8" minHeight={250} />

      <CityChart series={data.series} cityName={data.city.name} />

      <AdSlot position="between_sections" minHeight={250} />

      <CityMarkets markets={data.markets} cityName={data.city.name} />

      <CityAnalyticsSection analytics={data.analytics} cityName={data.city.name} />

      <CityInsights insights={insights} cityName={data.city.name} citySlug={slug} />

      <Section className="py-0">
        <Container className="px-0 sm:px-0">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
            <div className="min-w-0">
              <CityHistory history={data.history} cityName={data.city.name} />
            </div>
            <div className="hidden lg:block lg:sticky lg:top-24 lg:pt-16">
              <AdSlot position="sidebar_desktop" className="px-0" minHeight={600} />
            </div>
          </div>
        </Container>
      </Section>

      <CityCompare
        benchmarks={data.benchmarks}
        nearbyCities={data.nearbyCities}
        cityName={data.city.name}
      />

      <AdSlot position="between_sections" minHeight={250} />

      <StateContent blocks={blocks} />

      <FaqSection faqs={faqs} />

      <CityRelated data={data} />

      <LatestArticles articles={data.articles} />

      <Newsletter />

      <AdSlot position="footer_banner" className="pb-10" minHeight={90} />

      <StickyMobileAd />
    </>
  );
}
