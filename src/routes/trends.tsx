import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Container, Section, SectionHeading } from "@/components/common/section";
import { ChartWrapper } from "@/components/data/chart-wrapper";
import { AlertBanner } from "@/components/ui/alert-banner";
import { regionHistoryQuery } from "@/services/public-queries";
import { breadcrumbSchema, buildSeo } from "@/utils/seo";

const RateChart = React.lazy(() => import("@/components/home/rate-chart"));

const CRUMBS = [{ name: "Trends", href: "/trends" }];

export const Route = createFileRoute("/trends")({
  loader: ({ context }) => context.queryClient.ensureQueryData(regionHistoryQuery("national")),
  component: TrendsPage,
  head: () =>
    buildSeo({
      title: "Egg Price Trends & History in India",
      description:
        "Historical egg price charts for Indian markets — track daily, weekly and monthly movement in wholesale egg rates.",
      path: "/trends",
      schema: breadcrumbSchema(CRUMBS),
    }),
});

function TrendsPage() {
  const { data: history } = useSuspenseQuery(regionHistoryQuery("national"));

  return (
    <Section>
      <Container>
        <Breadcrumbs items={CRUMBS} />
        <SectionHeading
          className="mt-5"
          eyebrow="Analytics"
          title="Egg price trends"
          description="Historical price movement of eggs across India, showing the national average over the last 30 days."
        />
        
        <ChartWrapper
          className="mt-8"
          title="National 30-day rate history"
          description="Average price per egg across all tracked Indian markets."
        >
          <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-muted/50 rounded-lg" />}>
            <RateChart points={history} />
          </React.Suspense>
        </ChartWrapper>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <AlertBanner tone="info" title="Market Insight">
            Prices are aggregated daily from wholesale markets nationwide to provide a reliable baseline for the Indian poultry industry.
          </AlertBanner>
          <AlertBanner tone="warning" title="Data Updates">
            Historical trends are updated daily at 6:30 AM IST. Major price corrections are verified by our team before publishing.
          </AlertBanner>
        </div>
      </Container>
    </Section>
  );
}