import { Link } from "@tanstack/react-router";

import { Container, Section, SectionHeading } from "@/components/common/section";
import { Card, CardContent } from "@/components/ui/card";
import type { CityBenchmark, CityComparison } from "@/types/city";
import { formatNumber, formatPrice } from "@/utils/format";

/** City vs nearby cities, its own state average, and the national average. */
export function CityCompare({
  benchmarks,
  nearbyCities,
  cityName,
}: {
  benchmarks: CityBenchmark[];
  nearbyCities: CityComparison[];
  cityName: string;
}) {
  if (benchmarks.length === 0 && nearbyCities.length === 0) return null;

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Compare"
          title={`${cityName} vs nearby markets`}
          description="How this city's rate sits against its closest markets, its state average and the national average."
        />

        {benchmarks.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {benchmarks.map((benchmark) => (
              <Card key={benchmark.label} className="border-border/70">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {benchmark.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {benchmark.difference === 0
                        ? `${cityName} matches this average`
                        : `${cityName} is ${formatPrice(Math.abs(benchmark.difference))} (${Math.abs(benchmark.differencePercent).toFixed(2)}%) ${benchmark.difference > 0 ? "dearer" : "cheaper"}`}
                    </p>
                  </div>
                  <span className="font-display text-2xl font-semibold tabular-nums text-foreground">
                    {formatPrice(benchmark.perEgg)}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {nearbyCities.length > 0 ? (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {nearbyCities.map((entry) => (
              <li key={entry.slug}>
                <Link
                  to="/city/$slug"
                  params={{ slug: entry.slug }}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{entry.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatNumber(entry.distanceKm)} km away ·{" "}
                      {entry.difference === 0
                        ? "same rate"
                        : `${formatPrice(Math.abs(entry.difference))} ${entry.difference > 0 ? "cheaper" : "dearer"} than ${cityName}`}
                    </p>
                  </div>
                  <span className="font-display text-lg font-semibold tabular-nums text-foreground">
                    {formatPrice(entry.perEgg)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </Section>
  );
}
