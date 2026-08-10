import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { PageHeader } from "@/components/admin/page-header";
import { TablePagination } from "@/components/admin/table-pagination";
import { TableSkeleton } from "@/components/common/skeletons";
import { DataTable, type Column } from "@/components/data/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listSystemLogs } from "@/services/admin.functions";
import { formatDateTime } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/admin/system-logs")({
  component: SystemLogsPage,
});

interface SystemLogRow {
  id: string;
  level: string;
  source: string | null;
  message: string;
  created_at: string;
}

const PAGE_SIZE = 20;
const LEVELS = ["all", "debug", "info", "warning", "error", "critical"] as const;

const LEVEL_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  debug: "outline",
  info: "secondary",
  warning: "default",
  error: "destructive",
  critical: "destructive",
};

function SystemLogsPage() {
  const fetchLogs = useServerFn(listSystemLogs);
  const [page, setPage] = React.useState(1);
  const [level, setLevel] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useQuery({
    queryKey: ["admin", "system-logs", page, debounced, level],
    queryFn: () => fetchLogs({ data: { page, pageSize: PAGE_SIZE, search: debounced, level } }),
    placeholderData: keepPreviousData,
  });

  const columns: Column<SystemLogRow>[] = [
    {
      key: "level",
      header: "Level",
      cell: (row) => (
        <Badge variant={LEVEL_VARIANT[row.level] ?? "outline"}>{row.level}</Badge>
      ),
    },
    {
      key: "message",
      header: "Message",
      cell: (row) => (
        <div>
          <p className="line-clamp-2 text-sm">{row.message}</p>
          <p className="text-xs text-muted-foreground">{row.source ?? "app"}</p>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "When",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{formatDateTime(row.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System logs"
        description="Application-level diagnostics captured by the backend."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search messages…"
          className="sm:max-w-xs"
        />
        <Select
          value={level}
          onValueChange={(value) => {
            setLevel(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEVELS.map((item) => (
              <SelectItem key={item} value={item}>
                {item === "all" ? "All levels" : item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {query.isLoading ? (
        <TableSkeleton rows={8} columns={3} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={(query.data?.logs ?? []) as unknown as SystemLogRow[]}
            rowKey={(row) => row.id}
            emptyMessage="No system logs recorded."
          />
          <TablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={query.data?.total ?? 0}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}