import { BadgeCheck, Clock3, Egg } from "lucide-react";

import { TrendPill } from "@/components/home/trend-pill";
import { Card, CardContent } from "@/components/ui/card";
import type { NationalSummary } from "@/types/home";
import { formatDateLong, formatPrice, formatPriceCompact, toISODate } from "@/utils/format";

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

/** Today's national average — the page's primary answer box. */
export function LiveRateCard({ summary }: { summary: NationalSummary }) {
  const todayStr = toISODate();
  const displayDate = summary.effectiveDate && summary.effectiveDate >= todayStr
    ? summary.effectiveDate
    : todayStr;

  return (
    <Card className="overflow-hidden border-border/70 shadow-lg shadow-primary/5">
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Today's national average
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-2 sm:gap-3">
              <span className="font-display text-3xl font-semibold leading-none tabular-nums text-foreground xs:text-4xl sm:text-5xl">
                {formatPrice(summary.perEgg)}
              </span>
              <span className="text-sm text-muted-foreground">/ egg</span>
              <TrendPill change={summary.change} percent={summary.changePercent} size="sm" />
            </div>

          </div>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Egg className="size-5" aria-hidden />
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
          <Metric label="Per dozen" value={formatPrice(summary.perDozen)} />
          <Metric label="Tray (30)" value={formatPriceCompact(summary.perTray)} />
          <Metric label="Peti (210)" value={formatPriceCompact(summary.perPeti)} />
          <Metric label="100 eggs" value={formatPriceCompact(summary.perHundred)} />
          <Metric label="Wholesale" value={formatPrice(summary.wholesale)} />
          <Metric label="Retail" value={formatPrice(summary.retail)} />
        </dl>

        <div className="mt-5 flex flex-col gap-2 border-t border-border/70 pt-4 text-[11px] text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2 sm:text-xs">
          {summary.verified ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-success">
              <BadgeCheck className="size-3.5 sm:size-4" aria-hidden />
              Verified by our editors
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5 sm:size-4" aria-hidden />
            <time dateTime={summary.lastUpdated || displayDate}>
              Updated {formatDateLong(displayDate)}
            </time>
          </span>
          <span>
            4,600+ cities · 36 states
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
