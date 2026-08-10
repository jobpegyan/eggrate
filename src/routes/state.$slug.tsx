import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { AdSlot, StickyMobileAd } from "@/components/ads/ad-slot";
import { PageSkeleton } from "@/components/common/skeletons";
import { Container, Section } from "@/components/common/section";
import { FaqSection } from "@/components/home/faq-section";
import { LatestArticles } from "@/components/home/latest-articles";
import { Newsletter } from "@/components/home/newsletter";
import { Button } from "@/components/ui/button";
import { StateAnalysis } from "@/components/state/state-analysis";
import { StateChart } from "@/components/state/state-chart";
import { StateCities } from "@/components/state/state-cities";
import { StateCompare } from "@/components/state/state-compare";
import { StateContent } from "@/components/state/state-content";
import { StateHero } from "@/components/state/state-hero";
import { StateMarkets } from "@/components/state/state-markets";
import { StateRelated } from "@/components/state/state-related";
import { buildStateContent } from "@/lib/state-content";
import { buildStateFaqs } from "@/lib/state-faqs";
import { statePageQuery } from "@/services/public-queries";
import type { StatePageData } from "@/types/state";
import { fetchSeoTemplate } from "@/services/seo.functions";
import { formatDateLong, formatPrice } from "@/utils/format";
import {
  breadcrumbSchema,
  buildSeo,
  datasetSchema,
  faqSchema,
  fillTemplate,
  organizationSchema,
  productRateSchema,
  webPageSchema,
} from "@/utils/seo";

/** Meta text is generated from the state's own record — never hardcoded per state. */
function seoTexts(data: StatePageData) {
  const { state, summary, stats } = data;
  const title =
    state.seoTitle ??
    (summary
      ? `Egg Rate Today in ${state.name} — ${formatPrice(summary.perEgg)} per Egg`
      : `Egg Rate Today in ${state.name}`);
  const description =
    state.metaDescription ??
    (summary
      ? `Today's egg rate in ${state.name} is ${formatPrice(summary.perEgg)} per egg, ${formatPrice(summary.perDozen)} per dozen and ${formatPrice(summary.perTray)} per tray. Compare ${stats.citiesCount} cities and ${stats.marketsCount} markets with 1-year price history.`
      : `Live wholesale and retail egg prices across ${stats.citiesCount} cities and ${stats.marketsCount} markets in ${state.name}, updated daily.`);
  return { title, description };
}

export const Route = createFileRoute("/state/$slug")({
  loader: async ({ context, params }) => {
    const [data, seoTemplate] = await Promise.all([
      context.queryClient.ensureQueryData(statePageQuery(params.slug)),
      fetchSeoTemplate({ data: { pageType: "state" } }),
    ]);
    if (!data) throw notFound();
    return { ...data, seoTemplate };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "State not found | EggRateToday" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const data = loaderData;
    const path = `/state/${params.slug}`;
    const { title: fallbackTitle, description: fallbackDescription } = seoTexts(data);
    const template = (data as any).seoTemplate;

    const vars = {
      state: data.state.name,
      rate: data.summary ? formatPrice(data.summary.perEgg) : "",
      cities: String(data.stats.citiesCount),
      markets: String(data.stats.marketsCount),
    };

    const title = template?.title_template
      ? fillTemplate(template.title_template, vars)
      : fallbackTitle;

    const description = template?.description_template
      ? fillTemplate(template.description_template, vars)
      : fallbackDescription;

    const faqs = buildStateFaqs(data);
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
          ...(data.stats.lastUpdated ? { modifiedAt: data.stats.lastUpdated } : {}),
        }),
        breadcrumbSchema([
          { name: "States", href: "/states" },
          { name: data.state.name, href: path },
        ]),
        datasetSchema({
          name: `Daily egg prices in ${data.state.name}`,
          description: `Daily wholesale and retail egg price observations for markets across ${data.state.name}, India.`,
          path,
          areaServed: `${data.state.name}, India`,
          temporalCoverage: data.series.d365[0]
            ? `${data.series.d365[0].date}/${data.summary?.effectiveDate ?? data.series.d365.at(-1)?.date}`
            : undefined,
          ...(data.stats.lastUpdated ? { modifiedAt: data.stats.lastUpdated } : {}),
        }),
        ...(data.summary
          ? [
              productRateSchema({
                name: `Egg rate in ${data.state.name}`,
                price: data.summary.perEgg,
                areaServed: `${data.state.name}, India`,
                validFrom: data.summary.effectiveDate,
              }),
            ]
          : []),
        faqSchema(faqs),
      ],
    });
  },
  pendingComponent: PageSkeleton,
  notFoundComponent: StateNotFound,
  errorComponent: ({ error }) => (
    <Container className="py-16">
      <h1 className="font-display text-2xl font-semibold">Could not load this state</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <Button asChild className="mt-6">
        <Link to="/states">Back to all states</Link>
      </Button>
    </Container>
  ),
  component: StatePage,
});

function StateNotFound() {
  return (
    <Container className="py-16 text-center">
      <h1 className="font-display text-3xl font-semibold">State not found</h1>
      <p className="mt-3 text-muted-foreground">
        We don't track egg rates for that state yet. Browse every state we cover instead.
      </p>
      <Button asChild className="mt-6">
        <Link to="/states">View all states</Link>
      </Button>
    </Container>
  );
}

function StatePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(statePageQuery(slug));
  if (!data) return <StateNotFound />;

  const blocks = buildStateContent(data);
  const faqs = buildStateFaqs(data);
  const crumbs = [
    { name: "States", href: "/states" },
    { name: data.state.name, href: `/state/${data.state.slug}` },
  ];

  return (
    <>
      <AdSlot position="header_banner" className="pt-4" minHeight={90} />

      <StateHero data={data} crumbs={crumbs} />

      <AdSlot position="below_hero" className="pt-8" minHeight={250} />

      <StateChart series={data.series} stateName={data.state.name} />

      <StateCities cities={data.cities} stateName={data.state.name} />

      <AdSlot position="between_sections" minHeight={250} />

      <StateMarkets markets={data.markets} stateName={data.state.name} />

      <StateAnalysis insights={data.insights} stateName={data.state.name} stateSlug={slug} />

      {data.summary ? (
        <Section>
          <Container>
            <div className="grid gap-4 rounded-2xl border border-border/70 bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Cities tracked", value: String(data.stats.citiesCount) },
                { label: "Markets tracked", value: String(data.stats.marketsCount) },
                { label: "30-day high", value: formatPrice(data.summary.highest) },
                { label: "30-day low", value: formatPrice(data.summary.lowest) },
                { label: "7-day average", value: formatPrice(data.summary.weeklyAverage) },
                { label: "30-day average", value: formatPrice(data.summary.monthlyAverage) },
                { label: "Wholesale today", value: formatPrice(data.summary.wholesale) },
                { label: "Retail today", value: formatPrice(data.summary.retail) },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Statistics for {data.state.name}, last updated{" "}
              {data.stats.lastUpdated ? formatDateLong(data.stats.lastUpdated) : "recently"}.
            </p>
          </Container>
        </Section>
      ) : null}

      <StateCompare comparisons={data.comparisons} stateName={data.state.name} />

      <AdSlot position="between_sections" minHeight={250} />

      <StateContent blocks={blocks} />

      <FaqSection faqs={faqs} />

      <StateRelated
        states={data.relatedStates}
        cities={data.cities}
        stateName={data.state.name}
      />

      <LatestArticles articles={data.articles} />

      <Newsletter />

      <AdSlot position="footer_banner" className="pb-10" minHeight={90} />

      <StickyMobileAd />
    </>
  );
}
