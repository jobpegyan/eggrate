import { Link } from "@tanstack/react-router";
import { BadgeCheck, CalendarClock, Radio, Zap, History, Map, TrendingUp } from "lucide-react";

import { LiveRateCard } from "@/components/home/live-rate-card";
import { RateSearch } from "@/components/home/rate-search";
import { Container, Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import type { NationalSummary, RegionRate } from "@/types/home";
import { formatDateLong } from "@/utils/format";

const TRUST_BADGES = [
  { icon: BadgeCheck, label: "Editor verified" },
  { icon: CalendarClock, label: "Updated every morning" },
  { icon: Zap, label: "Loads in under a second" },
];

export function HeroSection({
  summary,
  popularCities,
}: {
  summary: NationalSummary | null;
  popularCities: RegionRate[];
}) {
  const popular = popularCities.slice(0, 6).map((city) => ({
    label: city.name,
    href: `/city/${city.slug}`,
  }));

  return (
    <Section className="border-b border-border/70 bg-gradient-to-b from-accent/45 via-background to-background pt-6 pb-10 sm:py-14">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground sm:px-3 sm:text-xs">
              <Radio className="size-3 animate-pulse text-success" aria-hidden />
              <span>Live · updated today</span>
              {summary ? (
                <span className="ml-1 hidden opacity-80 xs:inline">
                  · {formatDateLong(summary.effectiveDate)}
                </span>
              ) : null}
            </p>

            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground xs:text-4xl sm:text-5xl md:leading-[1.08]">
              Today's egg rate in India
            </h1>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
              Verified NECC wholesale and retail egg prices for every major state and city, with
              per-egg, dozen, tray and peti pricing refreshed every single morning.
            </p>

            <div className="mt-6 max-w-xl">
              <RateSearch popular={popular} />
              {popular.length > 0 ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Popular:</span>
                  {popular.map((city) => (
                    <a
                      key={city.href}
                      href={city.href}
                      className="rounded-full border border-border bg-card px-2.5 py-1 font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      {city.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-7 flex flex-col gap-3 xs:flex-row xs:items-center">
              <Button asChild size="lg" className="w-full xs:w-auto">
                <Link to="/states">View all state rates</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full xs:w-auto">
                <Link to="/trends">See price history</Link>
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-4">
              <Link to="/trends" className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent/50 sm:p-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  <History className="size-4" />
                </div>
                <span>History</span>
              </Link>
              <Link to="/states" className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent/50 sm:p-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Map className="size-4" />
                </div>
                <span>All States</span>
              </Link>
              <Link to="/egg-market-analysis" className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent/50 sm:p-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                  <TrendingUp className="size-4" />
                </div>
                <span>AI Analysis</span>
              </Link>
              <Link to="/compare/$slug" params={{ slug: "mumbai-vs-pune" }} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent/50 sm:p-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                  <Zap className="size-4" />
                </div>
                <span>Compare</span>
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted-foreground sm:text-xs">
              {TRUST_BADGES.map((badge) => (
                <li key={badge.label} className="inline-flex items-center gap-1.5">
                  <badge.icon className="size-3.5 text-primary sm:size-4" aria-hidden />
                  {badge.label}
                </li>
              ))}
            </ul>
          </div>

          {summary ? <LiveRateCard summary={summary} /> : null}
        </div>
      </Container>
    </Section>
  );
}
