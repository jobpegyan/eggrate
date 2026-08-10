import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, RotateCcw } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { TablePagination } from "@/components/admin/table-pagination";
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
import { toast } from "@/lib/toast";
import {
  listAllCities,
  listHistory,
  listRateLogs,
  restoreHistory,
  type RateHistoryRow,
} from "@/services/rates-admin";
import { formatDateTime, formatPrice } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/admin/rate-history")({
  component: RateHistoryPage,
});

const PAGE_SIZE = 20;

type HistoryRow = RateHistoryRow & {
  cities?: { name: string } | null;
  states?: { name: string } | null;
};

function RateHistoryPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cityId, setCityId] = React.useState("all");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [restoring, setRestoring] = React.useState<HistoryRow | null>(null);
  const [compareA, setCompareA] = React.useState("");
  const [compareB, setCompareB] = React.useState("");

  const cities = useQuery({ queryKey: ["admin", "all-cities", "all"], queryFn: () => listAllCities() });
  const query = useQuery({
    queryKey: ["admin", "rate-history", cityId, dateFrom, dateTo, page],
    queryFn: () => listHistory({ cityId, dateFrom, dateTo, page, pageSize: PAGE_SIZE }),
  });
  const logs = useQuery({ queryKey: ["admin", "rate-logs"], queryFn: () => listRateLogs(15) });

  const compareLeft = useQuery({
    queryKey: ["admin", "history-compare", compareA],
    queryFn: () => listHistory({ dateFrom: compareA, dateTo: compareA, pageSize: 100 }),
    enabled: Boolean(compareA),
  });
  const compareRight = useQuery({
    queryKey: ["admin", "history-compare", compareB],
    queryFn: () => listHistory({ dateFrom: compareB, dateTo: compareB, pageSize: 100 }),
    enabled: Boolean(compareB),
  });

  const restore = useMutation({
    mutationFn: () => restoreHistory(restoring as HistoryRow, user?.id),
    onSuccess: async () => {
      toast.success("Rate restored from history");
      setRestoring(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "rates"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "rate-history"] });
    },
    onError: (error: Error) => toast.error("Could not restore", error.message),
  });

  const columns: Column<HistoryRow>[] = [
    {
      key: "created_at",
      header: "Captured",
      cell: (row) => (
        <div>
          <p className="font-medium">{formatDateTime(row.created_at)}</p>
          <p className="text-xs text-muted-foreground">for {row.effective_date ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      cell: (row) => (
        <div>
          <p>{row.cities?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{row.states?.name ?? ""}</p>
        </div>
      ),
    },
    { key: "action", header: "Action", cell: (row) => <Badge variant="outline">{row.action}</Badge> },
    {
      key: "egg_rate",
      header: "Egg rate",
      align: "right",
      cell: (row) => (row.egg_rate === null ? "—" : formatPrice(Number(row.egg_rate))),
    },
    {
      key: "tray_price",
      header: "Tray",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (row.tray_price === null ? "—" : formatPrice(Number(row.tray_price))),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={!row.rate_id}
          onClick={() => setRestoring(row)}
        >
          <RotateCcw className="h-4 w-4" /> Restore
        </Button>
      ),
    },
  ];

  const comparison = React.useMemo(() => {
    const left = compareLeft.data?.rows ?? [];
    const right = compareRight.data?.rows ?? [];
    const byCity = new Map<string, { city: string; a?: number; b?: number }>();
    for (const row of left) {
      const key = row.cities?.name ?? row.city_id ?? "—";
      byCity.set(key, { city: key, a: row.egg_rate === null ? undefined : Number(row.egg_rate) });
    }
    for (const row of right) {
      const key = row.cities?.name ?? row.city_id ?? "—";
      const entry = byCity.get(key) ?? { city: key };
      entry.b = row.egg_rate === null ? undefined : Number(row.egg_rate);
      byCity.set(key, entry);
    }
    return [...byCity.values()];
  }, [compareLeft.data, compareRight.data]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rate history"
        description="Immutable snapshots of every rate change, with restore and audit trail."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Select value={cityId} onValueChange={(value) => { setCityId(value); setPage(1); }}>
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
          <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        </div>
      </div>

      {query.isLoading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={query.data?.rows ?? []}
            rowKey={(row) => row.id}
            emptyMessage="No history captured yet."
          />
          <TablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={query.data?.total ?? 0}
            onPageChange={setPage}
          />
        </>
      )}

      <section className="space-y-3 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Compare two dates</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Date A</Label>
            <Input type="date" value={compareA} onChange={(event) => setCompareA(event.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Date B</Label>
            <Input type="date" value={compareB} onChange={(event) => setCompareB(event.target.value)} />
          </div>
        </div>
        {comparison.length ? (
          <DataTable
            columns={[
              { key: "city", header: "City", cell: (row: { city: string }) => row.city },
              {
                key: "a",
                header: "Date A",
                align: "right",
                cell: (row: { a?: number }) => (row.a === undefined ? "—" : formatPrice(row.a)),
              },
              {
                key: "b",
                header: "Date B",
                align: "right",
                cell: (row: { b?: number }) => (row.b === undefined ? "—" : formatPrice(row.b)),
              },
              {
                key: "delta",
                header: "Change",
                align: "right",
                cell: (row: { a?: number; b?: number }) =>
                  row.a === undefined || row.b === undefined
                    ? "—"
                    : formatPrice(Number((row.b - row.a).toFixed(2))),
              },
            ]}
            rows={comparison}
            rowKey={(row) => row.city}
            emptyMessage="Pick two dates to compare."
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Pick two dates to see how each city moved between them.
          </p>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <History className="h-4 w-4" aria-hidden /> Audit log
        </h2>
        {logs.isLoading ? (
          <TableSkeleton rows={5} columns={3} />
        ) : (
          <ul className="divide-y divide-border text-sm">
            {(logs.data ?? []).map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-3 py-2">
                <div>
                  <p className="font-medium">{log.description ?? log.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.entity_type} · {formatDateTime(log.created_at)}
                  </p>
                </div>
                <Badge variant="outline">{log.action}</Badge>
              </li>
            ))}
            {(logs.data ?? []).length === 0 ? (
              <li className="py-3 text-muted-foreground">No rate activity recorded yet.</li>
            ) : null}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(restoring)}
        onOpenChange={(next) => !next && setRestoring(null)}
        title="Restore this snapshot?"
        description="The live rate will be reset to the prices captured in this history entry."
        confirmLabel="Restore"
        onConfirm={() => restore.mutate()}
      />
    </div>
  );
}
