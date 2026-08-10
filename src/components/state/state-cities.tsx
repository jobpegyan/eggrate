import { Link } from "@tanstack/react-router";

import { Container, Section, SectionHeading } from "@/components/common/section";
import { TrendPill } from "@/components/home/trend-pill";
import type { RegionRate } from "@/types/home";
import { formatPrice } from "@/utils/format";

export function StateCities({ cities, stateName }: { cities: RegionRate[]; stateName: string }) {
  if (cities.length === 0) return null;

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="City wise"
          title={`Egg rate in ${stateName} cities`}
          description={`Today's average price per egg in each of the ${cities.length} cities we track across ${stateName}.`}
        />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <li key={city.slug}>
              <Link
                to="/city/$slug"
                params={{ slug: city.slug }}
                className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground text-sm sm:text-base">{city.name}</p>
                  <p className="mt-1 text-[10px] xs:text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                    {formatPrice(city.perDozen)} / doz · {formatPrice(city.perTray)} / tray
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-base sm:text-lg font-semibold tabular-nums text-foreground">
                    {formatPrice(city.perEgg)}
                  </p>
                  <TrendPill change={city.change} percent={city.changePercent} size="sm" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
