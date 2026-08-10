import { Link } from "@tanstack/react-router";

import { Container, Section, SectionHeading } from "@/components/common/section";
import type { StateComparison } from "@/types/state";
import { formatNumber, formatPrice } from "@/utils/format";

/** Nearby states ranked by centroid distance from the current state. */
export function StateCompare({
  comparisons,
  stateName,
}: {
  comparisons: StateComparison[];
  stateName: string;
}) {
  if (comparisons.length === 0) return null;

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Compare"
          title={`${stateName} vs nearby states`}
          description="Distance is measured between state centroids, so the closest trading neighbours appear first."
        />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {comparisons.map((entry) => {
            const cheaper = entry.difference > 0;
            return (
              <li key={entry.slug}>
                <Link
                  to="/state/$slug"
                  params={{ slug: entry.slug }}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{entry.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatNumber(entry.distanceKm)} km away ·{" "}
                      {entry.difference === 0
                        ? "same rate"
                        : `${formatPrice(Math.abs(entry.difference))} ${cheaper ? "cheaper" : "dearer"} than ${stateName}`}
                    </p>
                  </div>
                  <span className="font-display text-lg font-semibold tabular-nums text-foreground">
                    {formatPrice(entry.perEgg)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
