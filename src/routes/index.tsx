import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { AdSlot, StickyMobileAd } from "@/components/ads/ad-slot";
import { AIMarketSummary } from "@/components/home/ai-summary-card";
import { ChartPreview } from "@/components/home/chart-preview";
import { FaqSection } from "@/components/home/faq-section";
import { HeroSection } from "@/components/home/hero-section";
import { LatestArticles } from "@/components/home/latest-articles";
import { MarketUpdates } from "@/components/home/market-updates";
import { Newsletter } from "@/components/home/newsletter";
import { TopCities } from "@/components/home/top-cities";
import { TopStates } from "@/components/home/top-states";
import { TrendingSection } from "@/components/home/trending-section";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { PageSkeleton } from "@/components/common/skeletons";
import { SITE } from "@/lib/constants";
import { homepageQuery } from "@/services/public-queries";
import { fetchSeoTemplate } from "@/services/seo.functions";
import { formatPrice } from "@/utils/format";
import {
  breadcrumbSchema,
  buildSeo,
  faqSchema,
  fillTemplate,
  organizationSchema,
  productRateSchema,
  websiteSchema,
} from "@/utils/seo";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const [data, seoTemplate] = await Promise.all([
      context.queryClient.ensureQueryData(homepageQuery()),
      fetchSeoTemplate({ data: { pageType: "homepage" } }),
    ]);
    return { ...data, seoTemplate };
  },
  pendingComponent: PageSkeleton,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-6xl px-4 py-20 text-sm text-muted-foreground">
      Could not load today's rates: {error.message}
    </div>
  ),
  head: ({ loaderData }) => {
    const national = loaderData?.national ?? null;
    const template = loaderData?.seoTemplate;

    const vars = {
      date: national?.effectiveDate ?? new Date().toISOString().slice(0, 10),
      rate: national ? formatPrice(national.perEgg) : "",
    };

    const title = template?.title_template
      ? fillTemplate(template.title_template, vars)
      : "Today's Egg Rate in India — Live NECC Rates by State & City";

    const description = template?.description_template
      ? fillTemplate(template.description_template, vars)
      : `Today's national average egg rate is ${vars.rate} per egg. ${SITE.description}`;

    return buildSeo({
      title,
      description: description.slice(0, 158),
      path: "/",
      schema: [
        organizationSchema(),
        websiteSchema(),
        breadcrumbSchema([{ name: "Home", href: "/" }]),
        ...(loaderData?.faqs?.length ? [faqSchema(loaderData.faqs)] : []),
        ...(national
          ? [
              productRateSchema({
                name: "Egg (single piece) — India average",
                price: national.perEgg,
                areaServed: "India",
                validFrom: national.effectiveDate,
              }),
            ]
          : []),
      ],
    });
  },
  component: HomePage,
});

function HomePage() {
  const { data } = useSuspenseQuery(homepageQuery());

  return (
    <>
      <AdSlot position="header_banner" className="pt-4" minHeight={90} />

      <h1 className="sr-only">
        Today's egg rate in India — live NECC prices for every state and city
      </h1>

      <HeroSection summary={data.national} popularCities={data.cities} />

      <AdSlot position="below_hero" className="py-6" minHeight={250} />

      <div className="container py-4">
        <AIMarketSummary />
      </div>

      <TopStates states={data.states} />
      <TopCities cities={data.cities} />

      <AdSlot position="between_sections" className="py-6" minHeight={250} />

      <TrendingSection trending={data.trending} />
      <ChartPreview points={data.chart} />
      <MarketUpdates updates={data.updates} />

      <AdSlot position="in_content" className="py-6" minHeight={250} />

      <WhyChooseUs summary={data.national} />
      <FaqSection faqs={data.faqs} />
      <LatestArticles articles={data.articles} />
      <Newsletter />

      <AdSlot position="footer_banner" className="pb-10" minHeight={90} />
      <StickyMobileAd />
    </>
  );
}
