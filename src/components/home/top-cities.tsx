import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/common/section";
import { TrendPill } from "@/components/home/trend-pill";
import type { RegionRate } from "@/types/home";
import { formatPrice, formatPriceCompact } from "@/utils/format";

export function TopCities({ cities }: { cities: RegionRate[] }) {
  if (cities.length === 0) return null;

  return (
    <Section className="bg-muted/30">
      <Container>
        <SectionHeading
          eyebrow="City wise"
          title="Egg rate in top Indian cities"
          description="Compare today's price with yesterday, plus the tray price you'll pay locally."
        />
        <ul className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <li key={city.slug}>
              <Link
                to="/city/$slug"
                params={{ slug: city.slug }}
                className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-semibold text-foreground sm:text-lg">
                      {city.name}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">{city.stateName}</p>
                  </div>
                  <TrendPill change={city.change} size="sm" />
                </div>

                <p className="mt-4 font-display text-3xl font-semibold tabular-nums text-foreground">
                  {formatPrice(city.perEgg)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">/ egg</span>
                </p>

                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <dt>Yesterday</dt>
                    <dd className="font-medium tabular-nums text-foreground">
                      {formatPrice(city.previousPerEgg)}
                    </dd>
                  </div>
                  <div>
                    <dt>Tray (30)</dt>
                    <dd className="font-medium tabular-nums text-foreground">
                      {formatPriceCompact(city.perTray)}
                    </dd>
                  </div>
                </dl>

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open {city.name} page
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
