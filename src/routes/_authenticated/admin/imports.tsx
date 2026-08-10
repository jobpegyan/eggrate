import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Download, Loader2, RotateCcw, Upload } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
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
import { downloadCsv, fileFormatOf, readSpreadsheet } from "@/lib/file-io";
import { IMPORT_TEMPLATE_COLUMNS, importRowSchema } from "@/lib/rate-schemas";
import { toast } from "@/lib/toast";
import {
  commitImport,
  createImportRecord,
  listAllCities,
  listImports,
  listSources,
  rollbackImport,
  type ImportRow,
} from "@/services/rates-admin";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/admin/imports")({
  component: ImportsPage,
});

interface PreparedRow {
  line: number;
  city: string;
  state: string;
  market: string;
  effective_date: string;
  egg_rate: number;
  payload: Record<string, unknown> | null;
  error?: string;
  duplicate?: boolean;
}

function ImportsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [prepared, setPrepared] = React.useState<PreparedRow[] | null>(null);
  const [fileName, setFileName] = React.useState("");
  const [fileFormat, setFileFormat] = React.useState<"csv" | "xlsx">("csv");
  const [sourceId, setSourceId] = React.useState("none");
  const [rollingBack, setRollingBack] = React.useState<ImportRow | null>(null);

  const history = useQuery({ queryKey: ["admin", "imports"], queryFn: listImports });
  const sources = useQuery({ queryKey: ["admin", "sources"], queryFn: listSources });

  const parse = useMutation({
    mutationFn: async (file: File) => {
      const rows = await readSpreadsheet(file);
      if (!rows.length) throw new Error("The file has no data rows");

      const cities = await listAllCities();
      const cityIndex = new Map(
        cities.map((city) => [
          `${city.name.toLowerCase()}|${(city.states?.name ?? "").toLowerCase()}`,
          city,
        ]),
      );

      const { data: existing } = await supabase
        .from("egg_rates")
        .select("city_id, effective_date")
        .returns<{ city_id: string; effective_date: string }[]>();
      const taken = new Set((existing ?? []).map((row) => `${row.city_id}|${row.effective_date}`));

      return rows.map((raw, index): PreparedRow => {
        const parsed = importRowSchema.safeParse(raw);
        const base = {
          line: index + 2,
          city: String(raw["city"] ?? ""),
          state: String(raw["state"] ?? ""),
          market: String(raw["market"] ?? ""),
          effective_date: String(raw["effective_date"] ?? ""),
          egg_rate: Number(raw["egg_rate"] ?? 0),
          payload: null,
        };
        if (!parsed.success) {
          return { ...base, error: parsed.error.issues[0]?.message ?? "Invalid row" };
        }
        const city = cityIndex.get(
          `${parsed.data.city.toLowerCase()}|${parsed.data.state.toLowerCase()}`,
        );
        if (!city) {
          return { ...base, error: `Unknown city "${parsed.data.city}" in ${parsed.data.state}` };
        }
        const key = `${city.id}|${parsed.data.effective_date}`;
        if (taken.has(key)) return { ...base, duplicate: true };
        taken.add(key);

        return {
          ...base,
          payload: {
            state_id: city.state_id,
            city_id: city.id,
            egg_rate: parsed.data.egg_rate,
            dozen_price: parsed.data.dozen_price,
            tray_price: parsed.data.tray_price,
            hundred_price: parsed.data.hundred_price,
            peti_price: parsed.data.peti_price,
            wholesale_price: parsed.data.wholesale_price,
            retail_price: parsed.data.retail_price,
            effective_date: parsed.data.effective_date,
            source_id: sourceId === "none" ? null : sourceId,
            is_published: false,
            is_verified: false,
            created_by: user?.id ?? null,
            updated_by: user?.id ?? null,
          },
        };
      });
    },
    onSuccess: (rows) => setPrepared(rows),
    onError: (error: Error) => toast.error("Could not read the file", error.message),
  });

  const commit = useMutation({
    mutationFn: async () => {
      const rows = prepared ?? [];
      const valid = rows.filter((row) => row.payload);
      const record = await createImportRecord({
        fileName,
        fileFormat,
        totalRows: rows.length,
        validRows: valid.length,
        invalidRows: rows.filter((row) => row.error).length,
        duplicateRows: rows.filter((row) => row.duplicate).length,
        errors: rows.filter((row) => row.error).map((row) => ({ line: row.line, error: row.error })),
        preview: valid.slice(0, 10).map((row) => row.payload),
        sourceId: sourceId === "none" ? null : sourceId,
        actorId: user?.id,
      });
      return commitImport(record.id, valid.map((row) => row.payload) as never);
    },
    onSuccess: async (count) => {
      toast.success(`${count} rates imported as drafts`);
      setPrepared(null);
      setFileName("");
      await queryClient.invalidateQueries({ queryKey: ["admin", "imports"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "rates"] });
    },
    onError: (error: Error) => toast.error("Import failed", error.message),
  });

  const rollback = useMutation({
    mutationFn: () => rollbackImport(rollingBack?.id ?? ""),
    onSuccess: async () => {
      toast.success("Import rolled back");
      setRollingBack(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "imports"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "rates"] });
    },
    onError: (error: Error) => toast.error("Rollback failed", error.message),
  });

  const previewColumns: Column<PreparedRow>[] = [
    { key: "line", header: "Row", cell: (row) => row.line },
    { key: "city", header: "City", cell: (row) => `${row.city}, ${row.state}` },
    { key: "date", header: "Date", cell: (row) => row.effective_date },
    { key: "rate", header: "Rate", align: "right", cell: (row) => row.egg_rate },
    {
      key: "state",
      header: "Result",
      cell: (row) =>
        row.error ? (
          <Badge className="border-transparent bg-destructive/15 text-destructive">{row.error}</Badge>
        ) : row.duplicate ? (
          <Badge className="border-transparent bg-warning/15 text-warning">Duplicate — skipped</Badge>
        ) : (
          <Badge className="border-transparent bg-success/15 text-success">Ready</Badge>
        ),
    },
  ];

  const historyColumns: Column<ImportRow>[] = [
    {
      key: "file_name",
      header: "File",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.file_name}</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(row.created_at)}</p>
        </div>
      ),
    },
    { key: "format", header: "Format", hideOnMobile: true, cell: (row) => row.file_format },
    {
      key: "rows",
      header: "Rows",
      align: "right",
      cell: (row) => `${row.imported_rows}/${row.total_rows}`,
    },
    {
      key: "issues",
      header: "Issues",
      align: "right",
      hideOnMobile: true,
      cell: (row) => `${row.invalid_rows} invalid · ${row.duplicate_rows} dupes`,
    },
    { key: "status", header: "Status", cell: (row) => <Badge variant="outline">{row.status}</Badge> },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={row.status !== "completed"}
          onClick={() => setRollingBack(row)}
        >
          <RotateCcw className="h-4 w-4" /> Rollback
        </Button>
      ),
    },
  ];

  const validCount = (prepared ?? []).filter((row) => row.payload).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Imports"
        description="Bulk upload rates from CSV or Excel with validation, preview and rollback."
        actions={
          <Button
            variant="outline"
            onClick={() =>
              downloadCsv(
                [Object.fromEntries(IMPORT_TEMPLATE_COLUMNS.map((column) => [column, ""]))],
                "eggrate-import-template.csv",
                [...IMPORT_TEMPLATE_COLUMNS],
              )
            }
          >
            <Download className="h-4 w-4" /> Template
          </Button>
        }
      />

      <section className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="import-file">CSV or Excel file</Label>
          <Input
            id="import-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setFileName(file.name);
              setFileFormat(fileFormatOf(file));
              parse.mutate(file);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>Data source</Label>
          <Select value={sourceId} onValueChange={setSourceId}>
            <SelectTrigger>
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not set</SelectItem>
              {(sources.data ?? []).map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {parse.isPending ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Validating rows…
        </p>
      ) : null}

      {prepared ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {prepared.length} rows read · {validCount} ready ·{" "}
              {prepared.filter((row) => row.duplicate).length} duplicates ·{" "}
              {prepared.filter((row) => row.error).length} invalid
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setPrepared(null)}>
                Cancel
              </Button>
              <Button onClick={() => commit.mutate()} disabled={!validCount || commit.isPending}>
                {commit.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Import {validCount} rows
                  </>
                )}
              </Button>
            </div>
          </div>
          <DataTable
            columns={previewColumns}
            rows={prepared.slice(0, 100)}
            rowKey={(row) => String(row.line)}
            emptyMessage="Nothing to preview."
          />
          {prepared.length > 100 ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3" /> Showing the first 100 rows — all rows will be
              imported.
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Import log</h2>
        {history.isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : (
          <DataTable
            columns={historyColumns}
            rows={history.data ?? []}
            rowKey={(row) => row.id}
            emptyMessage="No imports yet."
          />
        )}
      </section>

      <ConfirmDialog
        open={Boolean(rollingBack)}
        onOpenChange={(next) => !next && setRollingBack(null)}
        title="Roll back this import?"
        description="Every rate created by this batch will be deleted."
        confirmLabel="Roll back"
        onConfirm={() => rollback.mutate()}
      />
    </div>
  );
}
