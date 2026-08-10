import * as React from "react";
import { BadgeCheck } from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/common/section";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CityMarketRow } from "@/types/city";
import { formatDateTime, formatNumber, formatPrice } from "@/utils/format";

type Filter = "all" | "wholesale" | "retail";

/** Market list for the city, filterable by the trade each market supports. */
export function CityMarkets({
  markets,
  cityName,
}: {
  markets: CityMarketRow[];
  cityName: string;
}) {
  const [filter, setFilter] = React.useState<Filter>("all");
  if (markets.length === 0) return null;

  const rows = markets.filter((market) =>
    filter === "wholesale"
      ? market.supportsWholesale
      : filter === "retail"
        ? market.supportsRetail
        : true,
  );

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Markets"
          title={`Egg markets in ${cityName}`}
          description="Wholesale and retail quotes for each market, with distance from the city centre where we have coordinates."
        />
        <div className="mt-6">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
            <TabsList aria-label="Filter markets">
              <TabsTrigger value="all">All markets</TabsTrigger>
              <TabsTrigger value="wholesale">Wholesale</TabsTrigger>
              <TabsTrigger value="retail">Retail</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-card">
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Market</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Per egg</TableHead>
                  <TableHead className="text-right">Wholesale</TableHead>
                  <TableHead className="text-right">Retail</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        {row.marketName}
                        {row.verified ? (
                          <BadgeCheck className="size-3.5 text-success" aria-label="Verified" />
                        ) : null}
                      </span>
                      {row.distanceKm !== null ? (
                        <span className="block text-xs text-muted-foreground">
                          {formatNumber(row.distanceKm)} km from centre
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {row.marketType}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(row.perEgg)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.supportsWholesale ? formatPrice(row.wholesale) : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.supportsRetail ? formatPrice(row.retail) : "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDateTime(row.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Mobile Cards */}
            <div className="divide-y divide-border/70 md:hidden">
              {rows.map((row) => (
                <div key={row.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        {row.marketName}
                        {row.verified ? (
                          <BadgeCheck className="size-3.5 text-success" aria-label="Verified" />
                        ) : null}
                      </span>
                      <p className="text-xs text-muted-foreground capitalize">
                        {row.marketType} · {row.distanceKm !== null ? `${formatNumber(row.distanceKm)} km` : "Centre"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-semibold tabular-nums">
                        {formatPrice(row.perEgg)}
                      </p>
                      <p className="text-[10px] uppercase text-muted-foreground">Per Egg</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/30 p-2 text-center">
                      <p className="text-[10px] uppercase text-muted-foreground">Wholesale</p>
                      <p className="font-semibold tabular-nums">
                        {row.supportsWholesale ? formatPrice(row.wholesale) : "—"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2 text-center">
                      <p className="text-[10px] uppercase text-muted-foreground">Retail</p>
                      <p className="font-semibold tabular-nums">
                        {row.supportsRetail ? formatPrice(row.retail) : "—"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-muted-foreground">
                    Updated {formatDateTime(row.updatedAt)}
                  </p>
                </div>
              ))}
            </div>

            {rows.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No {filter} markets are tracked in {cityName} yet.
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
