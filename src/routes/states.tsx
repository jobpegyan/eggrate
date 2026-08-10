import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Container, Section, SectionHeading } from "@/components/common/section";
import { PageSkeleton } from "@/components/common/skeletons";
import { stateSlugsQuery } from "@/services/public-queries";
import { buildSeo, breadcrumbSchema } from "@/utils/seo";

const CRUMBS = [{ name: "States", href: "/states" }];

export const Route = createFileRoute("/states")({
  loader: ({ context }) => context.queryClient.ensureQueryData(stateSlugsQuery()),
  pendingComponent: PageSkeleton,
  component: StatesPage,
  head: () =>
    buildSeo({
      title: "Egg Rate by State in India",
      description:
        "State-wise egg rate directory for India — pick a state to see today's wholesale and retail egg prices across its markets, with 1-year price history.",
      path: "/states",
      schema: breadcrumbSchema(CRUMBS),
    }),
});

function StatesPage() {
  const { data: states } = useSuspenseQuery(stateSlugsQuery());

  return (
    <Section>
      <Container>
        <Breadcrumbs items={CRUMBS} />
        <SectionHeading
          className="mt-5"
          as="h1"
          eyebrow="Directory"
          title="Egg rate by state"
          description="Every state and union territory we track. Each page carries today's rate, city and market tables, price history and a local market guide."
        />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {states.map((state) => (
            <li key={state.slug}>
              <Link
                to="/state/$slug"
                params={{ slug: state.slug }}
                className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                  Egg rate in {state.name}
                </span>
                <ChevronRight
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
