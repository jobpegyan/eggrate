import { Link } from "@tanstack/react-router";
import { ChevronRight, ArrowRight } from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/common/section";
import { TrendPill } from "@/components/home/trend-pill";
import type { RegionRate } from "@/types/home";
import { formatPrice } from "@/utils/format";

export function TopStates({ states }: { states: RegionRate[] }) {
  if (states.length === 0) return null;

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="State wise"
          title="Today's egg rate by state"
          description="Average declared wholesale price per egg across every market we track in each state."
        />
        <ul className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {states.map((state) => (
            <li key={state.slug}>
              <div className="group flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <Link
                  to="/state/$slug"
                  params={{ slug: state.slug }}
                  className="flex items-center justify-between focus-visible:outline-none"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors sm:text-lg">
                      {state.name}
                    </p>
                    <p className="mt-1 flex items-baseline gap-2">
                      <span className="font-display text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
                        {formatPrice(state.perEgg)}
                      </span>
                      <TrendPill change={state.change} size="sm" />
                    </p>
                  </div>
                  <ChevronRight
                    className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>

                <div className="mt-4 border-t border-border/50 pt-4">
                  <Link
                    to="/state/$slug"
                    params={{ slug: state.slug }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    View Cities in {state.name}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
