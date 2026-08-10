import * as React from "react";

import { ChartSkeleton } from "@/components/common/skeletons";
import { Container, Section, SectionHeading } from "@/components/common/section";
import { ChartWrapper } from "@/components/data/chart-wrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StateSeries } from "@/types/state";

const RateChart = React.lazy(() => import("@/components/home/rate-chart"));

const RANGES = [
  { key: "d7", label: "7 days" },
  { key: "d30", label: "30 days" },
  { key: "d90", label: "90 days" },
  { key: "d365", label: "1 year" },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

export function StateChart({ series, stateName }: { series: StateSeries; stateName: string }) {
  const [range, setRange] = React.useState<RangeKey>("d30");
  const points = series[range];
  if (series.d7.length === 0) return null;

  return (
    <Section className="bg-muted/30" as="section">
      <Container>
        <SectionHeading
          eyebrow="Price history"
          title={`${stateName} egg price history`}
          description="Average declared price per egg across all tracked markets in the state."
        />
        <div className="mt-8">
          <ChartWrapper
            title={RANGES.find((entry) => entry.key === range)?.label ?? ""}
            description={`Average price per egg, ${stateName}`}
            actions={
              <Tabs value={range} onValueChange={(value) => setRange(value as RangeKey)}>
                <TabsList aria-label="Chart range">
                  {RANGES.map((entry) => (
                    <TabsTrigger key={entry.key} value={entry.key}>
                      {entry.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            }
          >
            <React.Suspense fallback={<ChartSkeleton className="h-full" />}>
              <RateChart points={points} />
            </React.Suspense>
          </ChartWrapper>
        </div>
      </Container>
    </Section>
  );
}
