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
import { listActivityLogs } from "@/services/admin.functions";
import { formatDateTime } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/admin/activity-logs")({
  component: ActivityLogsPage,
});

interface ActivityLogRow {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  ip_address: string | null;
  created_at: string;
  profile?: { full_name: string | null; email: string | null } | null;
}

const PAGE_SIZE = 20;

function ActivityLogsPage() {
  const fetchLogs = useServerFn(listActivityLogs);
  const [page, setPage] = React.useState(1);
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
    queryKey: ["admin", "activity-logs", page, debounced],
    queryFn: () =>
      fetchLogs({ data: { page, pageSize: PAGE_SIZE, search: debounced, level: "all" } }),
    placeholderData: keepPreviousData,
  });

  const columns: Column<ActivityLogRow>[] = [
    {
      key: "action",
      header: "Action",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.action}</p>
          <p className="text-xs text-muted-foreground">
            {row.profile?.full_name ?? row.profile?.email ?? "System"}
          </p>
        </div>
      ),
    },
    {
      key: "entity_type",
      header: "Entity",
      hideOnMobile: true,
      cell: (row) =>
        row.entity_type ? (
          <Badge variant="outline">
            {row.entity_type}
            {row.entity_id ? ` · ${row.entity_id.slice(0, 8)}` : ""}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "ip_address",
      header: "IP",
      hideOnMobile: true,
      cell: (row) => <span className="text-xs">{row.ip_address ?? "—"}</span>,
    },
    {
      key: "created_at",
      header: "When",
      align: "right",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{formatDateTime(row.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity logs"
        description="Audit trail of every privileged action taken in the admin console."
      />

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search actions…"
        className="sm:max-w-xs"
      />

      {query.isLoading ? (
        <TableSkeleton rows={8} columns={4} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={(query.data?.logs ?? []) as ActivityLogRow[]}
            rowKey={(row) => row.id}
            emptyMessage="No activity recorded yet."
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