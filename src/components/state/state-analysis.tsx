import { ArrowDownRight, ArrowUpRight, Activity, ShoppingCart, BrainCircuit } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/common/section";
import { Card, CardContent } from "@/components/ui/card";
import type { StateInsights } from "@/types/state";
import { formatPrice } from "@/utils/format";
import { useMarketInsight } from "@/services/ai-analysis.queries";
import { InsightView } from "@/components/ai/insight-view";
import { Skeleton } from "@/components/ui/skeleton";

function InsightCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden />
        </span>
        <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-display text-xl font-semibold tabular-nums text-foreground">
          {value}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

/** Written insights derived from the state's own rate rows. */
export function StateAnalysis({
  insights,
  stateName,
  stateSlug,
}: {
  insights: StateInsights;
  stateName: string;
  stateSlug?: string;
}) {
  const { data: aiInsight, isLoading: aiLoading } = useMarketInsight('state_analysis', 'state', stateSlug);



  const cards = [
    insights.highestCity
      ? {
          icon: ArrowUpRight,
          label: "Dearest city",
          value: `${insights.highestCity.name} · ${formatPrice(insights.highestCity.perEgg)}`,
          detail: `Highest declared average in ${stateName} today, ${formatPrice(insights.highestCity.perEgg - insights.averageRate)} above the state average.`,
        }
      : null,
    insights.lowestCity
      ? {
          icon: ArrowDownRight,
          label: "Cheapest city",
          value: `${insights.lowestCity.name} · ${formatPrice(insights.lowestCity.perEgg)}`,
          detail: `Lowest declared average in ${stateName} today, ${formatPrice(insights.averageRate - insights.lowestCity.perEgg)} below the state average.`,
        }
      : null,
    insights.mostVolatileCity
      ? {
          icon: Activity,
          label: "Most volatile",
          value: `${insights.mostVolatileCity.name} · ${formatPrice(insights.mostVolatileCity.spread)}`,
          detail: `Gap between the 30-day high and low in ${insights.mostVolatileCity.name}. Timing your purchase matters most here.`,
        }
      : null,
    insights.bestBuyingMarket
      ? {
          icon: ShoppingCart,
          label: "Keenest wholesale",
          value: `${insights.bestBuyingMarket.marketName} · ${formatPrice(insights.bestBuyingMarket.wholesale)}`,
          detail: `Lowest wholesale quote today, at ${insights.bestBuyingMarket.marketName} in ${insights.bestBuyingMarket.cityName}.`,
        }
      : null,
  ].filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (cards.length === 0) return null;

  const week = insights.weeklyTrend;
  const month = insights.monthlyTrend;

  return (
    <Section className="bg-muted/30">
      <Container>
        <SectionHeading
          eyebrow="Price analysis"
          title={`What the ${stateName} numbers say`}
          description={`The state average has moved ${formatPrice(Math.abs(week))} ${week >= 0 ? "up" : "down"} over the last 7 days and ${formatPrice(Math.abs(month))} ${month >= 0 ? "up" : "down"} over the last 30 days.`}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <InsightCard key={card.label} {...card} />
          ))}
        </div>

        {aiLoading ? (
          <div className="mt-12 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : aiInsight ? (
          <div className="mt-12">
            <InsightView insight={aiInsight} showDisclosure={false} />
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
