import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { TablePagination } from "@/components/admin/table-pagination";
import { TableSkeleton } from "@/components/common/skeletons";
import { DataTable, type Column } from "@/components/data/data-table";
import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { toast } from "@/lib/toast";
import { stateSchema, type StateValues } from "@/lib/rate-schemas";
import { deleteRows, listStates, saveState, setStatus, slugify, type StateRow } from "@/services/rates-admin";
import { formatDate } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/admin/states")({
  component: StatesPage,
});

const PAGE_SIZE = 20;

const EMPTY: StateValues = {
  name: "",
  slug: "",
  code: "",
  seoTitle: "",
  metaDescription: "",
  status: "active",
  displayOrder: 0,
};

function StatesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [status, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [editing, setEditing] = React.useState<StateRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const debounced = useDebouncedValue(search, 300);

  const query = useQuery({
    queryKey: ["admin", "states", debounced, status, page],
    queryFn: () => listStates({ search: debounced, status, page, pageSize: PAGE_SIZE }),
  });

  const form = useForm<StateValues>({ resolver: zodResolver(stateSchema), defaultValues: EMPTY });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "states"] });

  const save = useMutation({
    mutationFn: (values: StateValues) => saveState(values, editing?.id, user?.id),
    onSuccess: async () => {
      toast.success(editing ? "State updated" : "State created");
      setOpen(false);
      setEditing(null);
      form.reset(EMPTY);
      await invalidate();
    },
    onError: (error: Error) => toast.error("Could not save state", error.message),
  });

  const bulkStatus = useMutation({
    mutationFn: (next: "active" | "inactive") => setStatus("states", selected, next),
    onSuccess: async () => {
      toast.success("Status updated");
      setSelected([]);
      await invalidate();
    },
    onError: (error: Error) => toast.error("Could not update status", error.message),
  });

  const remove = useMutation({
    mutationFn: () => deleteRows("states", selected),
    onSuccess: async () => {
      toast.success("States deleted");
      setSelected([]);
      setConfirming(false);
      await invalidate();
    },
    onError: (error: Error) => toast.error("Could not delete", error.message),
  });

  const toggleStatus = useMutation({
    mutationFn: (row: StateRow) =>
      setStatus("states", [row.id], row.status === "active" ? "inactive" : "active"),
    onSuccess: invalidate,
    onError: (error: Error) => toast.error("Could not update status", error.message),
  });

  const rows = query.data?.rows ?? [];
  const allSelected = rows.length > 0 && rows.every((row) => selected.includes(row.id));

  function openEdit(row: StateRow) {
    setEditing(row);
    form.reset({
      name: row.name,
      slug: row.slug,
      code: row.code ?? "",
      seoTitle: row.seo_title ?? "",
      metaDescription: row.meta_description ?? "",
      status: row.status,
      displayOrder: row.display_order,
    });
    setOpen(true);
  }

  const columns: Column<StateRow>[] = [
    {
      key: "select",
      header: "",
      cell: (row) => (
        <Checkbox
          checked={selected.includes(row.id)}
          onCheckedChange={(checked) =>
            setSelected((prev) =>
              checked ? [...prev, row.id] : prev.filter((id) => id !== row.id),
            )
          }
          aria-label={`Select ${row.name}`}
        />
      ),
    },
    {
      key: "name",
      header: "State",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">/state/{row.slug}</p>
        </div>
      ),
    },
    { key: "code", header: "Code", hideOnMobile: true, cell: (row) => row.code ?? "—" },
    {
      key: "display_order",
      header: "Order",
      align: "center",
      hideOnMobile: true,
      cell: (row) => row.display_order,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <button type="button" onClick={() => toggleStatus.mutate(row)}>
          <StatusBadge status={row.status} />
        </button>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      hideOnMobile: true,
      cell: (row) => formatDate(row.created_at),
    },
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
        title="States"
        description="Every Indian state or union territory the platform publishes rates for."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              form.reset(EMPTY);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New state
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search states…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) =>
              setSelected(checked ? rows.map((row) => row.id) : [])
            }
            aria-label="Select all"
          />
          <span className="text-xs text-muted-foreground">{selected.length} selected</span>
        </div>
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-muted/40 p-3">
          <Button size="sm" variant="outline" onClick={() => bulkStatus.mutate("active")}>
            Activate
          </Button>
          <Button size="sm" variant="outline" onClick={() => bulkStatus.mutate("inactive")}>
            Deactivate
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setConfirming(true)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      ) : null}

      {query.isLoading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            emptyMessage="No states yet. Add your first state to begin."
          />
          <TablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={query.data?.total ?? 0}
            onPageChange={setPage}
          />
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit state" : "New state"}</DialogTitle>
            <DialogDescription>
              Slug drives the public URL, SEO fields drive the meta tags.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            noValidate
            onSubmit={form.handleSubmit((values) => save.mutate(values))}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="state-name">State name</Label>
                <Input
                  id="state-name"
                  {...form.register("name")}
                  onBlur={(event) => {
                    if (!form.getValues("slug")) form.setValue("slug", slugify(event.target.value));
                  }}
                />
                <FieldError message={form.formState.errors.name?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state-slug">Slug</Label>
                <Input id="state-slug" {...form.register("slug")} />
                <FieldError message={form.formState.errors.slug?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state-code">Code</Label>
                <Input id="state-code" placeholder="MH" {...form.register("code")} />
                <FieldError message={form.formState.errors.code?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state-order">Display order</Label>
                <Input id="state-order" type="number" {...form.register("displayOrder")} />
                <FieldError message={form.formState.errors.displayOrder?.message} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state-seo">SEO title</Label>
              <Input id="state-seo" {...form.register("seoTitle")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state-meta">Meta description</Label>
              <Textarea id="state-meta" rows={3} {...form.register("metaDescription")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value) => form.setValue("status", value as StateValues["status"])}
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
            </div>
            <Button type="submit" className="w-full" disabled={save.isPending}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save state"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Delete ${selected.length} state(s)?`}
        description="Cities, markets and rates linked to them will also be removed."
        confirmLabel="Delete"
        onConfirm={() => remove.mutate()}
      />
    </div>
  );
}
