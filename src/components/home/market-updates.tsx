import { BadgeCheck } from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/common/section";
import { TrendPill } from "@/components/home/trend-pill";
import type { MarketUpdate } from "@/types/home";
import { formatPrice, formatRelativeDay } from "@/utils/format";

export function MarketUpdates({ updates }: { updates: MarketUpdate[] }) {
  if (updates.length === 0) return null;

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Latest market updates"
          title="Most recently published rates"
          description="Every change is timestamped and archived, so nothing is ever overwritten."
        />
        <div className="mt-8 overflow-hidden rounded-2xl border border-border/70 bg-card">
          <table className="w-full text-sm">
            <caption className="sr-only">Recently published egg rates by city</caption>
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">City</th>
                <th scope="col" className="px-4 py-3 font-medium">Rate</th>
                <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">Change</th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {updates.map((update) => (
                <tr key={update.citySlug} className="transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <a
                      href={`/city/${update.citySlug}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {update.cityName}
                    </a>
                    <span className="block text-xs text-muted-foreground">{update.stateName}</span>
                  </td>
                  <td className="px-4 py-3 font-medium tabular-nums text-foreground">
                    {formatPrice(update.perEgg)}
                    {update.verified ? (
                      <BadgeCheck
                        className="ml-1 inline size-3.5 text-success"
                        aria-label="Verified"
                      />
                    ) : null}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <TrendPill change={update.change} />
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                    {formatRelativeDay(update.effectiveDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
}
