import * as React from "react";
import { Download } from "lucide-react";

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
import { downloadCsv, downloadJson, downloadXlsx } from "@/lib/file-io";
import { cn } from "@/lib/utils";
import type { CityHistoryRow } from "@/types/city";
import { formatDateLong, formatDelta, formatPrice } from "@/utils/format";

const PAGE_SIZE = 15;

/** Day-by-day rate history with pagination and CSV / Excel / JSON export. */
export function CityHistory({ history, cityName }: { history: CityHistoryRow[]; cityName: string }) {
  const [page, setPage] = React.useState(1);
  if (history.length === 0) return null;

  const pageCount = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = history.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const base = `${cityName.toLowerCase().replace(/\s+/g, "-")}-egg-rate-history`;
  const rows = history.map((row) => ({
    date: row.date,
    per_egg: row.perEgg,
    wholesale: row.wholesale,
    retail: row.retail,
    change: row.difference,
    change_percent: row.changePercent,
  }));

  return (
    <Section className="bg-muted/30">
      <Container>
        <SectionHeading
          eyebrow="Price history"
          title={`${cityName} egg rate day by day`}
          description="Every declared rate we hold for this city, newest first. Export the full record in one click."
        />
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadCsv(rows, `${base}.csv`)}>
            <Download className="size-3.5" aria-hidden />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => void downloadXlsx(rows, `${base}.xlsx`)}>
            <Download className="size-3.5" aria-hidden />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadJson(rows, `${base}.json`)}>
            <Download className="size-3.5" aria-hidden />
            JSON
          </Button>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Per egg</TableHead>
                  <TableHead className="text-right">Wholesale</TableHead>
                  <TableHead className="text-right">Retail</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell className="font-medium">{formatDateLong(row.date)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(row.perEgg)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(row.wholesale)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(row.retail)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        row.difference > 0
                          ? "text-destructive"
                          : row.difference < 0
                            ? "text-success"
                            : "text-muted-foreground",
                      )}
                    >
                      {row.difference === 0
                        ? "—"
                        : `${formatDelta(row.difference)} (${row.changePercent.toFixed(2)}%)`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {pageCount > 1 ? (
            <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-3 text-sm">
              <p className="text-muted-foreground">
                Page {current} of {pageCount} · {history.length} days
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
