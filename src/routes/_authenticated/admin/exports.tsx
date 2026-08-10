import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileJson, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/common/skeletons";
import { DataTable, type Column } from "@/components/data/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { downloadCsv, downloadJson, downloadXlsx, type SheetRow } from "@/lib/file-io";
import { DEFAULT_RATE_FILTERS, type ExportFormat, type RateFilters } from "@/lib/rate-schemas";
import { toast } from "@/lib/toast";
import {
  fetchRatesForExport,
  listAllCities,
  listAllStates,
  listExports,
  recordExport,
  type ExportRow,
} from "@/services/rates-admin";
import { formatDateTime, toISODate } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/admin/exports")({
  component: ExportsPage,
});

const COLUMNS = [
  "state",
  "city",
  "market",
  "effective_date",
  "egg_rate",
  "dozen_price",
  "tray_price",
  "hundred_price",
  "peti_price",
  "wholesale_price",
  "retail_price",
  "currency",
  "is_verified",
  "is_published",
];

function ExportsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = React.useState<RateFilters>({
    ...DEFAULT_RATE_FILTERS,
    dateFrom: toISODate(new Date(Date.now() - 7 * 86_400_000)),
    dateTo: toISODate(),
  });

  const states = useQuery({ queryKey: ["admin", "all-states"], queryFn: listAllStates });
  const cities = useQuery({
    queryKey: ["admin", "all-cities", filters.stateId],
    queryFn: () => listAllCities(filters.stateId),
  });
  const history = useQuery({ queryKey: ["admin", "exports"], queryFn: listExports });

  const run = useMutation({
    mutationFn: async (format: ExportFormat) => {
      const rates = await fetchRatesForExport(filters);
      if (!rates.length) throw new Error("No rates match these filters");

      const rows: SheetRow[] = rates.map((rate) => ({
        state: rate.states?.name ?? "",
        city: rate.cities?.name ?? "",
        market: rate.markets?.name ?? "",
        effective_date: rate.effective_date,
        egg_rate: Number(rate.egg_rate),
        dozen_price: rate.dozen_price,
        tray_price: rate.tray_price,
        hundred_price: rate.hundred_price,
        peti_price: rate.peti_price,
        wholesale_price: rate.wholesale_price,
        retail_price: rate.retail_price,
        currency: rate.currency,
        is_verified: String(rate.is_verified),
        is_published: String(rate.is_published),
      }));

      const stamp = toISODate();
      if (format === "csv") downloadCsv(rows, `egg-rates-${stamp}.csv`, COLUMNS);
      else if (format === "json") downloadJson(rows, `egg-rates-${stamp}.json`);
      else await downloadXlsx(rows, `egg-rates-${stamp}.xlsx`, "Egg rates");

      await recordExport({ format, filters, rowCount: rows.length, actorId: user?.id });
      return rows.length;
    },
    onSuccess: async (count) => {
      toast.success(`${count} rows exported`);
      await queryClient.invalidateQueries({ queryKey: ["admin", "exports"] });
    },
    onError: (error: Error) => toast.error("Export failed", error.message),
  });

  const columns: Column<ExportRow>[] = [
    {
      key: "created_at",
      header: "Generated",
      cell: (row) => formatDateTime(row.created_at),
    },
    { key: "format", header: "Format", cell: (row) => <Badge variant="outline">{row.file_format}</Badge> },
    { key: "rows", header: "Rows", align: "right", cell: (row) => row.row_count },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exports"
        description="Download filtered rate data as CSV, Excel or JSON."
      />

      <section className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          value={filters.stateId}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, stateId: value, cityId: "all" }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            {(states.data ?? []).map((state) => (
              <SelectItem key={state.id} value={state.id}>
                {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.cityId}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, cityId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {(cities.data ?? []).map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value }))}
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => run.mutate("csv")} disabled={run.isPending}>
          {run.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          CSV
        </Button>
        <Button variant="outline" onClick={() => run.mutate("xlsx")} disabled={run.isPending}>
          <FileSpreadsheet className="h-4 w-4" /> Excel
        </Button>
        <Button variant="outline" onClick={() => run.mutate("json")} disabled={run.isPending}>
          <FileJson className="h-4 w-4" /> JSON
        </Button>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Download className="h-3 w-3" /> Up to 1,000 rows per export
        </span>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Export log</h2>
        {history.isLoading ? (
          <TableSkeleton rows={5} columns={3} />
        ) : (
          <DataTable
            columns={columns}
            rows={history.data ?? []}
            rowKey={(row) => row.id}
            emptyMessage="No exports yet."
          />
        )}
      </section>
    </div>
  );
}
