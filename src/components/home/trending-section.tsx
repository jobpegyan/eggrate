import { Flame, Search, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/common/section";
import { TrendPill } from "@/components/home/trend-pill";
import type { RegionRate, TrendingHighlights } from "@/types/home";
import { formatPrice } from "@/utils/format";

function HighlightCard({
  icon: Icon,
  label,
  city,
}: {
  icon: LucideIcon;
  label: string;
  city: RegionRate | null;
}) {
  if (!city) return null;
  return (
    <a
      href={`/city/${city.slug}`}
      className="flex flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5 text-primary" aria-hidden />
        {label}
      </span>
      <span className="mt-2 truncate font-medium text-foreground">{city.name}</span>
      <span className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">
        {formatPrice(city.perEgg)}
      </span>
      <TrendPill change={city.change} className="mt-2 self-start" size="sm" />
    </a>
  );
}

export function TrendingSection({ trending }: { trending: TrendingHighlights }) {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Trending today"
          title="Where prices are moving"
          description="The extremes of today's market, refreshed with every published rate."
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          <HighlightCard icon={TrendingUp} label="Highest today" city={trending.highest} />
          <HighlightCard icon={TrendingDown} label="Lowest today" city={trending.lowest} />
          <HighlightCard icon={Search} label="Most searched" city={trending.mostSearched} />
          <HighlightCard icon={Flame} label="Biggest increase" city={trending.biggestIncrease} />
          <div className="col-span-2 lg:col-span-1">
            <HighlightCard icon={TrendingDown} label="Biggest drop" city={trending.biggestDrop} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
