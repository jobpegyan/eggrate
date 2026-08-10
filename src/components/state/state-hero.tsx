import { BadgeCheck, Clock3, Egg, MapPin } from "lucide-react";

import { Breadcrumbs, type Crumb } from "@/components/common/breadcrumbs";
import { Container } from "@/components/common/section";
import { ShareButton } from "@/components/common/share-button";
import { TrendPill } from "@/components/home/trend-pill";
import { Card, CardContent } from "@/components/ui/card";
import type { StatePageData } from "@/types/state";
import { formatDateLong, formatNumber, formatPrice, formatPriceCompact } from "@/utils/format";


function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-display text-lg font-semibold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}

export function StateHero({ data, crumbs }: { data: StatePageData; crumbs: Crumb[] }) {
  const { state, summary, stats } = data;

  return (
    <header className="border-b border-border/60 bg-gradient-to-b from-primary/8 via-background to-background">
      <Container className="py-6 sm:py-10">
        <Breadcrumbs items={crumbs} />

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <MapPin className="size-3.5" aria-hidden />
                {state.name}
                {state.code ? ` · ${state.code}` : ""}
              </p>
              <ShareButton
                title={`Egg Rate in ${state.name} today`}
                text={`Check out today's egg rate in ${state.name}: ${summary ? formatPrice(summary.perEgg) : "Live rates"}`}
                url={`/state/${state.slug}`}
                className="lg:hidden"
              />
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Egg rate today in {state.name}
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              {summary
                ? `The average declared egg price across ${state.name} is ${formatPrice(summary.perEgg)} per egg for ${formatDateLong(summary.effectiveDate)}. Compare every tracked city and market below, and follow the 7-day to 1-year price history.`
                : `Live wholesale and retail egg prices for every tracked market in ${state.name}, updated each morning as markets declare.`}
            </p>

            <dl className="mt-6 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted-foreground">Cities</dt>
                <dd className="font-display text-xl font-semibold tabular-nums">
                  {formatNumber(stats.citiesCount)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Markets</dt>
                <dd className="font-display text-xl font-semibold tabular-nums">
                  {formatNumber(stats.marketsCount)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Highest</dt>
                <dd className="font-display text-xl font-semibold tabular-nums">
                  {formatPrice(stats.highestRate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Lowest</dt>
                <dd className="font-display text-xl font-semibold tabular-nums">
                  {formatPrice(stats.lowestRate)}
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
                      {state.name} average today
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
                  <Metric label="Per dozen" value={formatPrice(summary.perDozen)} />
                  <Metric label="Tray (30)" value={formatPriceCompact(summary.perTray)} />
                  <Metric label="Peti (210)" value={formatPriceCompact(summary.perPeti)} />
                  <Metric label="100 eggs" value={formatPriceCompact(summary.perHundred)} />
                  <Metric label="Wholesale" value={formatPrice(summary.wholesale)} />
                  <Metric label="Retail" value={formatPrice(summary.retail)} />
                </dl>

                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5" aria-hidden />
                    {formatDateLong(summary.effectiveDate)}
                  </span>
                  {summary.verified ? (
                    <span className="inline-flex items-center gap-1.5 text-success">
                      <BadgeCheck className="size-3.5" aria-hidden />
                      Verified by our team
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
