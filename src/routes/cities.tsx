import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Container, Section, SectionHeading } from "@/components/common/section";
import { PageSkeleton } from "@/components/common/skeletons";
import { citySlugsQuery } from "@/services/public-queries";
import { breadcrumbSchema, buildSeo } from "@/utils/seo";

const CRUMBS = [{ name: "Cities", href: "/cities" }];

export const Route = createFileRoute("/cities")({
  loader: ({ context }) => context.queryClient.ensureQueryData(citySlugsQuery()),
  pendingComponent: PageSkeleton,
  component: CitiesPage,
  head: () =>
    buildSeo({
      title: "Egg Rate by City in India",
      description:
        "City-wise egg rate directory for India — pick a city to see today's wholesale and retail egg price, market-wise rates, price history and a local buying guide.",
      path: "/cities",
      schema: breadcrumbSchema(CRUMBS),
    }),
});

function CitiesPage() {
  const { data: cities } = useSuspenseQuery(citySlugsQuery());

  const grouped = cities.reduce<Record<string, typeof cities>>((acc, city) => {
    (acc[city.stateName] ??= []).push(city);
    return acc;
  }, {});
  const states = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  return (
    <Section>
      <Container>
        <Breadcrumbs items={CRUMBS} />
        <SectionHeading
          className="mt-5"
          as="h1"
          eyebrow="Directory"
          title="Egg rate by city"
          description="Every city we track, grouped by state. Each page carries today's rate in every unit, market-wise quotes, 1-year history and local analytics."
        />
        <div className="mt-10 space-y-10">
          {states.map((stateName) => (
            <div key={stateName}>
              <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
                {stateName}
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[stateName]!.map((city) => (
                  <li key={city.slug}>
                    <Link
                      to="/city/$slug"
                      params={{ slug: city.slug }}
                      className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                        Egg rate in {city.name}
                      </span>
                      <ChevronRight
                        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
