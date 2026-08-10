import { Link } from "@tanstack/react-router";

import { Container, Section, SectionHeading } from "@/components/common/section";
import type { RegionRate } from "@/types/home";
import type { StateComparison } from "@/types/state";

/** Internal-link block: sibling states plus this state's own cities. */
export function StateRelated({
  states,
  cities,
  stateName,
}: {
  states: StateComparison[];
  cities: RegionRate[];
  stateName: string;
}) {
  if (states.length === 0 && cities.length === 0) return null;

  return (
    <Section className="bg-muted/30">
      <Container>
        <SectionHeading
          eyebrow="Explore more"
          title="Related egg rate pages"
          description={`Jump to other states, or browse every city we track in ${stateName}.`}
        />
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Other states
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {states.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    to="/state/$slug"
                    params={{ slug: entry.slug }}
                    className="inline-flex rounded-full border border-border/70 bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    Egg rate in {entry.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Cities in {stateName}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {cities.slice(0, 16).map((city) => (
                <li key={city.slug}>
                  <Link
                    to="/city/$slug"
                    params={{ slug: city.slug }}
                    className="inline-flex rounded-full border border-border/70 bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {city.name} egg rate
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
