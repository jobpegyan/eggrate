import { BadgeCheck, Clock3, Egg, MapPin } from "lucide-react";

import { Breadcrumbs, type Crumb } from "@/components/common/breadcrumbs";
import { Container } from "@/components/common/section";
import { ShareButton } from "@/components/common/share-button";
import { TrendPill } from "@/components/home/trend-pill";
import { Card, CardContent } from "@/components/ui/card";
import type { CityPageData } from "@/types/city";
import { formatDateLong, formatDateTime, formatNumber, formatPrice } from "@/utils/format";


function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-display text-lg font-semibold tabular-nums text-foreground">
        {value}
      </dd>
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Hero + live price card: every unit the market actually quotes in. */
export function CityHero({ data, crumbs }: { data: CityPageData; crumbs: Crumb[] }) {
  const { city, summary, analytics, markets } = data;

  return (
    <header className="border-b border-border/60 bg-gradient-to-b from-primary/8 via-background to-background">
      <Container className="py-6 sm:py-10">
        <Breadcrumbs items={crumbs} />

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <MapPin className="size-3.5" aria-hidden />
                {city.name} · {city.stateName}
              </p>
              <ShareButton
                title={`Egg Rate in ${city.name} today`}
                text={`Check out today's egg rate in ${city.name}: ${summary ? formatPrice(summary.perEgg) : "Live rates"}`}
                url={`/city/${city.slug}`}
                className="lg:hidden"
              />
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Egg rate today in {city.name}
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              {summary
                ? `Today's egg rate in ${city.name} is ${formatPrice(summary.perEgg)} per egg, ${
                    summary.change === 0
                      ? "unchanged from"
                      : `${formatPrice(Math.abs(summary.change))} ${summary.change > 0 ? "higher" : "lower"} than`
                  } ${summary.previousDate ? formatDateLong(summary.previousDate) : "the previous session"}. Wholesale, retail, tray and peti prices below are declared for ${formatDateLong(summary.effectiveDate)}.`
                : `Live wholesale and retail egg prices for every tracked market in ${city.name}, updated each morning as the market declares.`}
            </p>

            <dl className="mt-6 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted-foreground">Markets</dt>
                <dd className="font-display text-xl font-semibold tabular-nums">
                  {formatNumber(markets.length)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">7-day avg</dt>
                <dd className="font-display text-xl font-semibold tabular-nums">
                  {formatPrice(analytics.weeklyAverage)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">90-day high</dt>
                <dd className="font-display text-xl font-semibold tabular-nums">
                  {formatPrice(analytics.highest)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">90-day low</dt>
                <dd className="font-display text-xl font-semibold tabular-nums">
                  {formatPrice(analytics.lowest)}
                </dd>
              </div>
            </dl>
          </div>

          {summary ? (
            <Card className="overflow-hidden border-border/70 shadow-lg shadow-primary/5">
              <CardContent className="p-5 sm:p-6">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      {city.name} live rate
                    </p>
                    <div className="mt-2 flex flex-wrap items-end gap-3">
                      <span className="font-display text-5xl font-semibold leading-none tabular-nums text-foreground">
                        {formatPrice(summary.perEgg)}
                      </span>
                      <span className="pb-1 text-sm text-muted-foreground">per egg</span>
                      <TrendPill change={summary.change} percent={summary.changePercent} size="md" />
                    </div>
                  </div>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Egg className="size-5" aria-hidden />
                  </span>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  <Metric label="Per dozen" value={formatPrice(summary.perDozen)} hint="12 eggs" />
                  <Metric label="Per tray" value={formatPrice(summary.perTray)} hint="30 eggs" />
                  <Metric label="Per 100" value={formatPrice(summary.perHundred)} hint="100 eggs" />
                  <Metric label="Per peti" value={formatPrice(summary.perPeti)} hint="210 eggs" />
                  <Metric label="Wholesale" value={formatPrice(summary.wholesale)} hint="per egg" />
                  <Metric label="Retail" value={formatPrice(summary.retail)} hint="per egg" />
                </dl>

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5" aria-hidden />
                    Updated {formatDateTime(summary.lastUpdated)}
                  </span>
                  {summary.verified ? (
                    <span className="inline-flex items-center gap-1.5 text-success">
                      <BadgeCheck className="size-3.5" aria-hidden />
                      Verified rate
                    </span>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </Container>
    </header>
  );
}
