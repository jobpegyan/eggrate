import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, BadgeCheck } from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MarketRow } from "@/types/state";
import { formatDateTime, formatPrice } from "@/utils/format";

type SortKey = "marketName" | "cityName" | "perEgg" | "wholesale" | "retail";
const PAGE_SIZE = 10;

/** Sortable, paginated market table — client-side over the day's rows. */
export function StateMarkets({ markets, stateName }: { markets: MarketRow[]; stateName: string }) {
  const [sort, setSort] = React.useState<{ key: SortKey; asc: boolean }>({
    key: "marketName",
    asc: true,
  });
  const [page, setPage] = React.useState(1);

  const sorted = React.useMemo(() => {
    const rows = [...markets];
    rows.sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      const result =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right));
      return sort.asc ? result : -result;
    });
    return rows;
  }, [markets, sort]);

  if (markets.length === 0) return null;

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const toggle = (key: SortKey) => {
    setSort((prev) => ({ key, asc: prev.key === key ? !prev.asc : true }));
    setPage(1);
  };

  const header = (key: SortKey, label: string, numeric = false) => (
    <TableHead className={numeric ? "text-right" : undefined}>
      <button
        type="button"
        onClick={() => toggle(key)}
        className="inline-flex items-center gap-1 font-medium hover:text-foreground"
        aria-label={`Sort by ${label}`}
      >
        {label}
        {sort.key !== key ? (
          <ArrowUpDown className="size-3.5 opacity-50" aria-hidden />
        ) : sort.asc ? (
          <ArrowUp className="size-3.5" aria-hidden />
        ) : (
          <ArrowDown className="size-3.5" aria-hidden />
        )}
      </button>
    </TableHead>
  );

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Market table"
          title={`${stateName} market wise egg rates`}
          description="Every declared market rate for today. Sort by any column and page through the full list."
        />
        <div className="mt-8 overflow-hidden rounded-2xl border border-border/70 bg-card">
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  {header("marketName", "Market")}
                  {header("cityName", "City")}
                  {header("perEgg", "Per egg", true)}
                  {header("wholesale", "Wholesale", true)}
                  {header("retail", "Retail", true)}
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        {row.marketName}
                        {row.verified ? (
                          <BadgeCheck className="size-3.5 text-success" aria-label="Verified" />
                        ) : null}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.cityName}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(row.perEgg)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(row.wholesale)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(row.retail)}
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
              {visible.map((row) => (
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
                        {row.cityName}
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
                        {formatPrice(row.wholesale)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2 text-center">
                      <p className="text-[10px] uppercase text-muted-foreground">Retail</p>
                      <p className="font-semibold tabular-nums">
                        {formatPrice(row.retail)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-muted-foreground text-right">
                    Updated {formatDateTime(row.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {pageCount > 1 ? (
            <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-3 text-sm">
              <p className="text-muted-foreground">
                Page {current} of {pageCount} · {sorted.length} markets
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={current === 1}
                  onClick={() => setPage(current - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={current === pageCount}
                  onClick={() => setPage(current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
