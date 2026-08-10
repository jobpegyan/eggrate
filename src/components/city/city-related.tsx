import { Link } from "@tanstack/react-router";

import { Container, Section, SectionHeading } from "@/components/common/section";
import type { CityComparison, CityPageData } from "@/types/city";

function Chip({ to, slug, label }: { to: "/city/$slug" | "/state/$slug"; slug: string; label: string }) {
  return (
    <li>
      <Link
        to={to}
        params={{ slug }}
        className="inline-flex rounded-full border border-border/70 bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        {label}
      </Link>
    </li>
  );
}

/** Internal-link block: sibling cities, nearby states and popular markets. */
export function CityRelated({ data }: { data: CityPageData }) {
  const { city, stateCities, nearbyStates, popularCities } = data;
  const siblings: CityComparison[] = stateCities.filter((entry) => entry.slug !== city.slug);

  return (
    <Section className="bg-muted/30">
      <Container>
        <SectionHeading
          eyebrow="Explore more"
          title="Related egg rate pages"
          description={`Other cities in ${city.stateName}, neighbouring states, and the markets people check most.`}
        />
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Cities in {city.stateName}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {siblings.slice(0, 14).map((entry) => (
                <Chip key={entry.slug} to="/city/$slug" slug={entry.slug} label={`Egg rate in ${entry.name}`} />
              ))}
              <Chip key={city.stateSlug} to="/state/$slug" slug={city.stateSlug} label={`All of ${city.stateName}`} />
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Nearby states
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {nearbyStates.map((entry) => (
                <Chip key={entry.slug} to="/state/$slug" slug={entry.slug} label={`Egg rate in ${entry.name}`} />
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Popular cities
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {popularCities
                .filter((entry) => entry.slug !== city.slug)
                .slice(0, 14)
                .map((entry) => (
                  <Chip key={entry.slug} to="/city/$slug" slug={entry.slug} label={entry.name} />
                ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
