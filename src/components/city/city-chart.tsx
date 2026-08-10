import { Download } from "lucide-react";
import * as React from "react";

import { ChartSkeleton } from "@/components/common/skeletons";
import { Container, Section, SectionHeading } from "@/components/common/section";
import { ChartWrapper } from "@/components/data/chart-wrapper";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCsv } from "@/lib/file-io";
import type { CitySeries } from "@/types/city";

const RateChart = React.lazy(() => import("@/components/home/rate-chart"));

const RANGES = [
  { key: "d7", label: "7 days" },
  { key: "d30", label: "30 days" },
  { key: "d90", label: "90 days" },
  { key: "d365", label: "1 year" },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

/** Price trend with range tabs and a CSV download of the visible series. */
export function CityChart({ series, cityName }: { series: CitySeries; cityName: string }) {
  const [range, setRange] = React.useState<RangeKey>("d30");
  const points = series[range];
  if (series.d7.length === 0) return null;

  const exportCsv = () => {
    downloadCsv(
      points.map((point) => ({ date: point.date, price_per_egg: point.perEgg })),
      `${cityName.toLowerCase().replace(/\s+/g, "-")}-egg-rate-${range}.csv`,
    );
  };

  return (
    <Section className="bg-muted/30" as="section">
      <Container>
        <SectionHeading
          eyebrow="Price trend"
          title={`${cityName} egg price history`}
          description="Average declared price per egg across every tracked market in the city."
        />
        <div className="mt-8">
          <ChartWrapper
            title={RANGES.find((entry) => entry.key === range)?.label ?? ""}
            description={`Average price per egg, ${cityName}`}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <Tabs value={range} onValueChange={(value) => setRange(value as RangeKey)}>
                  <TabsList aria-label="Chart range">
                    {RANGES.map((entry) => (
                      <TabsTrigger key={entry.key} value={entry.key}>
                        {entry.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <Button variant="outline" size="sm" onClick={exportCsv}>
                  <Download className="size-3.5" aria-hidden />
                  CSV
                </Button>
              </div>
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
