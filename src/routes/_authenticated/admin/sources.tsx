import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Pencil, Plus, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { BoolBadge, StatusBadge } from "@/components/admin/status-badge";
import { TableSkeleton } from "@/components/common/skeletons";
import { DataTable, type Column } from "@/components/data/data-table";
import { FieldError } from "@/components/forms/field-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { dataSourceSchema, type DataSourceValues } from "@/lib/rate-schemas";
import { toast } from "@/lib/toast";
import { listSources, saveSource, type DataSourceRow } from "@/services/rates-admin";

export const Route = createFileRoute("/_authenticated/admin/sources")({
  component: SourcesPage,
});

const EMPTY: DataSourceValues = {
  key: "",
  name: "",
  kind: "manual",
  url: "",
  description: "",
  isTrusted: true,
  status: "active",
};

function SourcesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<DataSourceRow | null>(null);

  const query = useQuery({ queryKey: ["admin", "sources"], queryFn: listSources });
  const form = useForm<DataSourceValues>({
    resolver: zodResolver(dataSourceSchema),
    defaultValues: EMPTY,
  });

  const save = useMutation({
    mutationFn: (values: DataSourceValues) => saveSource(values, editing?.id),
    onSuccess: async () => {
      toast.success(editing ? "Source updated" : "Source created");
      setOpen(false);
      setEditing(null);
      form.reset(EMPTY);
      await queryClient.invalidateQueries({ queryKey: ["admin", "sources"] });
    },
    onError: (error: Error) => toast.error("Could not save source", error.message),
  });

  function openEdit(row: DataSourceRow) {
    setEditing(row);
    form.reset({
      key: row.key,
      name: row.name,
      kind: row.kind,
      url: row.url ?? "",
      description: row.description ?? "",
      isTrusted: row.is_trusted,
      status: row.status,
    });
    setOpen(true);
  }

  const columns: Column<DataSourceRow>[] = [
    {
      key: "name",
      header: "Source",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.key}</p>
        </div>
      ),
    },
    { key: "kind", header: "Channel", cell: (row) => <Badge variant="outline">{row.kind}</Badge> },
    {
      key: "url",
      header: "Endpoint",
      hideOnMobile: true,
      cell: (row) => <span className="line-clamp-1 text-xs">{row.url ?? "—"}</span>,
    },
    {
      key: "trusted",
      header: "Trusted",
      align: "center",
      cell: (row) => <BoolBadge value={row.is_trusted} yes="Trusted" no="Unverified" />,
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data sources"
        description="Every channel rates can arrive through — manual entry, CSV, API, cron or webhook."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              form.reset(EMPTY);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New source
          </Button>
        }
      />

      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          Sources make the pipeline pluggable: a future API importer, cron job or webhook simply
          records its rows against its own source, and every rate keeps a verifiable origin.
        </p>
      </div>

      {query.isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : (
        <DataTable
          columns={columns}
          rows={query.data ?? []}
          rowKey={(row) => row.id}
          emptyMessage="No sources configured yet."
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit source" : "New source"}</DialogTitle>
            <DialogDescription>Sources are attached to rates and import batches.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            noValidate
            onSubmit={form.handleSubmit((values) => save.mutate(values))}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="source-name">Name</Label>
                <Input id="source-name" {...form.register("name")} />
                <FieldError message={form.formState.errors.name?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source-key">Key</Label>
                <Input id="source-key" placeholder="necc_api" {...form.register("key")} />
                <FieldError message={form.formState.errors.key?.message} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select
                value={form.watch("kind")}
                onValueChange={(value) => form.setValue("kind", value as DataSourceValues["kind"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual entry</SelectItem>
                  <SelectItem value="csv">CSV upload</SelectItem>
                  <SelectItem value="excel">Excel upload</SelectItem>
                  <SelectItem value="api">API import</SelectItem>
                  <SelectItem value="cron">Cron job</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="scrape">Scrape</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-url">Endpoint URL</Label>
              <Input id="source-url" placeholder="https://…" {...form.register("url")} />
              <FieldError message={form.formState.errors.url?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-desc">Description</Label>
              <Textarea id="source-desc" rows={3} {...form.register("description")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value) =>
                    form.setValue("status", value as DataSourceValues["status"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source-trusted">Trusted source</Label>
                <div className="flex h-10 items-center">
                  <Switch
                    id="source-trusted"
                    checked={form.watch("isTrusted")}
                    onCheckedChange={(checked) => form.setValue("isTrusted", checked)}
                  />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={save.isPending}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save source"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
