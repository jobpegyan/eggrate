import {
  BadgeCheck,
  CalendarClock,
  Gauge,
  History,
  LineChart,
  Map,
  MapPin,
  Radio,
  Search,
} from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/common/section";
import type { NationalSummary } from "@/types/home";
import { formatNumber } from "@/utils/format";

const REASONS = [
  { icon: Radio, title: "Live data", body: "Rates land the moment a market declares, not hours later." },
  { icon: CalendarClock, title: "Daily updates", body: "Every tracked market is refreshed each morning, seven days a week." },
  { icon: History, title: "Historical prices", body: "Nothing is overwritten — every published rate stays queryable." },
  { icon: BadgeCheck, title: "Verified information", body: "An editor matches each rate against its declaring source before it goes live." },
  { icon: Gauge, title: "Fast website", body: "Server-rendered pages, lazy media and a tiny bundle keep it instant on 3G." },
];

const FEATURES = [
  { icon: Radio, label: "Today's rates" },
  { icon: History, label: "Historical data" },
  { icon: LineChart, label: "Price charts" },
  { icon: Map, label: "State wise rates" },
  { icon: MapPin, label: "City wise rates" },
  { icon: Search, label: "Instant search" },
  { icon: CalendarClock, label: "Daily updates" },
];

export function WhyChooseUs({ summary }: { summary: NationalSummary | null }) {
  return (
    <Section className="bg-muted/30">
      <Container>
        <SectionHeading
          eyebrow="Why choose us"
          title="Built for people who trade on the price"
          description={
            summary
              ? `Tracking ${formatNumber(summary.marketsCount)} markets across ${formatNumber(summary.citiesCount)} cities and ${formatNumber(summary.statesCount)} states.`
              : undefined
          }
        />

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((reason) => (
            <li
              key={reason.title}
              className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <reason.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-display text-base font-semibold text-foreground">
                {reason.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{reason.body}</p>
            </li>
          ))}
        </ul>

        <ul className="mt-6 flex flex-wrap gap-2">
          {FEATURES.map((feature) => (
            <li
              key={feature.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <feature.icon className="size-3.5 text-primary" aria-hidden />
              {feature.label}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
