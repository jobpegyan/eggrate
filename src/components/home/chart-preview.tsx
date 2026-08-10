import { Link } from "@tanstack/react-router";
import * as React from "react";

import { ChartSkeleton } from "@/components/common/skeletons";
import { Container, Section, SectionHeading } from "@/components/common/section";
import { ChartWrapper } from "@/components/data/chart-wrapper";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ChartPoint } from "@/types/home";

/** Recharts is heavy — load it only after hydration on the client. */
const RateChart = React.lazy(() => import("@/components/home/rate-chart"));

export function ChartPreview({ points }: { points: ChartPoint[] }) {
  const [range, setRange] = React.useState<"7" | "30">("7");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (points.length === 0) return null;

  const visible = range === "7" ? points.slice(-7) : points;

  return (
    <Section className="bg-muted/30">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Price chart"
            title="National average trend"
            description="How the average declared egg rate has moved across all tracked markets."
            className="w-full sm:max-w-2xl"
          />
          <Button asChild variant="outline">
            <Link to="/trends">View full chart</Link>
          </Button>
        </div>

        <div className="mt-8">
          <ChartWrapper
            title={`Last ${range} days`}
            description="Average price per egg, all India"
            actions={
              <Tabs value={range} onValueChange={(value) => setRange(value as "7" | "30")}>
                <TabsList aria-label="Chart range">
                  <TabsTrigger value="7">7 days</TabsTrigger>
                  <TabsTrigger value="30">30 days</TabsTrigger>
                </TabsList>
              </Tabs>
            }
          >
            {mounted ? (
              <React.Suspense fallback={<ChartSkeleton className="h-full" />}>
                <RateChart points={visible} />
              </React.Suspense>
            ) : (
              <ChartSkeleton className="h-full" />
            )}
          </ChartWrapper>
        </div>
      </Container>
    </Section>
  );
}
