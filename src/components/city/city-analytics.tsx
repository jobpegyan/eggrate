import { Activity, ArrowDownRight, ArrowUpRight, Gauge, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/common/section";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CityAnalytics } from "@/types/city";
import { formatDateLong, formatPrice } from "@/utils/format";

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  meter,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  meter?: number;
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
        {meter !== undefined ? (
          <Progress value={meter} className="mt-3 h-1.5" aria-label={`${label} index`} />
        ) : null}
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

/** Volatility, demand and supply readings computed from the city's own history. */
export function CityAnalyticsSection({
  analytics,
  cityName,
}: {
  analytics: CityAnalytics;
  cityName: string;
}) {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Analytics"
          title={`${cityName} price analytics`}
          description="Averages, swing and market pressure, all derived from the declared rates on this page."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Activity}
            label="Volatility"
            value={`${analytics.volatility.toFixed(2)}% · ${analytics.volatilityLabel}`}
            detail={`Standard deviation of the last 30 daily averages. ${analytics.daysUp} up days against ${analytics.daysDown} down days.`}
          />
          <StatCard
            icon={Gauge}
            label="Demand pressure"
            value={`${analytics.demandIndex}/100 · ${analytics.demandLabel}`}
            meter={analytics.demandIndex}
            detail={`Inferred from sustained price direction over the last month in ${cityName}.`}
          />
          <StatCard
            icon={Truck}
            label="Supply position"
            value={`${analytics.supplyIndex}/100 · ${analytics.supplyLabel}`}
            meter={analytics.supplyIndex}
            detail="Read from how quickly quotes soften when arrivals exceed local offtake."
          />
          <StatCard
            icon={ArrowUpRight}
            label="90-day high"
            value={formatPrice(analytics.highest)}
            detail={
              analytics.highestDate
                ? `Reached on ${formatDateLong(analytics.highestDate)}.`
                : "Highest declared average in the tracked window."
            }
          />
          <StatCard
            icon={ArrowDownRight}
            label="90-day low"
            value={formatPrice(analytics.lowest)}
            detail={
              analytics.lowestDate
                ? `Reached on ${formatDateLong(analytics.lowestDate)}.`
                : "Lowest declared average in the tracked window."
            }
          />
          <StatCard
            icon={Activity}
            label="7-day average"
            value={formatPrice(analytics.weeklyAverage)}
            detail="A better buying reference than any single day's quote."
          />
          <StatCard
            icon={Activity}
            label="30-day average"
            value={formatPrice(analytics.monthlyAverage)}
            detail="The medium-term level the market keeps returning to."
          />
          <StatCard
            icon={Activity}
            label="90-day average"
            value={formatPrice(analytics.quarterlyAverage)}
            detail="Use this when budgeting bulk purchases over a quarter."
          />
        </div>
      </Container>
    </Section>
  );
}
