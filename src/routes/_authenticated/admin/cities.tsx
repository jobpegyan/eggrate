import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Pencil, Plus, Star, Trash2, Upload } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { readSpreadsheet } from "@/lib/file-io";
import { citySchema, type CityInput, type CityValues } from "@/lib/rate-schemas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";
import {
  bulkCreateCities,
  deleteRows,
  listAllStates,
  listCities,
  saveCity,
  setStatus,
  slugify,
  type CityRow,
} from "@/services/rates-admin";
import { formatNumber } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/admin/cities")({
  component: CitiesPage,
});

const PAGE_SIZE = 20;

const EMPTY: CityInput = {
  stateId: "",
  name: "",
  slug: "",
  latitude: null,
  longitude: null,
  population: null,
  isFeatured: false,
  status: "active",
  seoTitle: "",
  metaDescription: "",
  displayOrder: 0,
};

function CitiesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [stateId, setStateId] = React.useState("all");
  const [status, setStatusFilter] = React.useState("all");
  const [featured, setFeatured] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [editing, setEditing] = React.useState<CityRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const debounced = useDebouncedValue(search, 300);

  const states = useQuery({ queryKey: ["admin", "all-states"], queryFn: listAllStates });
  const query = useQuery({
    queryKey: ["admin", "cities", debounced, stateId, status, featured, page],
    queryFn: () =>
      listCities({ search: debounced, stateId, status, featured, page, pageSize: PAGE_SIZE }),
  });

  const form = useForm<CityInput, unknown, CityValues>({
    resolver: zodResolver(citySchema),
    defaultValues: EMPTY,
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "cities"] });

  const save = useMutation({
    mutationFn: (values: CityValues) => saveCity(values, editing?.id, user?.id),
    onSuccess: async () => {
      toast.success(editing ? "City updated" : "City created");
      setOpen(false);
      setEditing(null);
      form.reset(EMPTY);
      await invalidate();
    },
    onError: (error: Error) => toast.error("Could not save city", error.message),
  });

  const bulkStatus = useMutation({
    mutationFn: (next: "active" | "inactive") => setStatus("cities", selected, next),
    onSuccess: async () => {
      toast.success("Status updated");
      setSelected([]);
      await invalidate();
    },
    onError: (error: Error) => toast.error("Could not update status", error.message),
  });

  const remove = useMutation({
    mutationFn: () => deleteRows("cities", selected),
    onSuccess: async () => {
      toast.success("Cities deleted");
      setSelected([]);
      setConfirming(false);
      await invalidate();
    },
    onError: (error: Error) => toast.error("Could not delete", error.message),
  });

  const toggleFeatured = useMutation({
    mutationFn: async (row: CityRow) => {
      const { error } = await supabase
        .from("cities")
        .update({ is_featured: !row.is_featured })
        .eq("id", row.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: (error: Error) => toast.error("Could not update city", error.message),
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const rows = await readSpreadsheet(file);
      const entries = rows
        .map((row) => ({
          name: String(row["city"] ?? row["name"] ?? "").trim(),
          stateName: String(row["state"] ?? "").trim(),
        }))
        .filter((entry) => entry.name && entry.stateName);
      if (!entries.length) throw new Error("No rows with 'city' and 'state' columns were found");
      return bulkCreateCities(entries, user?.id);
    },
    onSuccess: async (result) => {
      toast.success(`${result.created} cities added`, result.skipped.slice(0, 3).join(" · "));
      setUploadOpen(false);
      await invalidate();
    },
    onError: (error: Error) => toast.error("Bulk upload failed", error.message),
  });

  const rows = query.data?.rows ?? [];
  const allSelected = rows.length > 0 && rows.every((row) => selected.includes(row.id));

  function openEdit(row: CityRow) {
    setEditing(row);
    form.reset({
      stateId: row.state_id,
      name: row.name,
      slug: row.slug,
      latitude: row.latitude,
      longitude: row.longitude,
      population: row.population,
      isFeatured: row.is_featured,
      status: row.status,
      seoTitle: row.seo_title ?? "",
      metaDescription: row.meta_description ?? "",
      displayOrder: row.display_order,
    });
    setOpen(true);
  }

  const columns: Column<CityRow>[] = [
    {
      key: "select",
      header: "",
      cell: (row) => (
        <Checkbox
          checked={selected.includes(row.id)}
          onCheckedChange={(checked) =>
            setSelected((prev) => (checked ? [...prev, row.id] : prev.filter((id) => id !== row.id)))
          }
          aria-label={`Select ${row.name}`}
        />
      ),
    },
    {
      key: "name",
      header: "City",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">/city/{row.slug}</p>
        </div>
      ),
    },
    { key: "state", header: "State", hideOnMobile: true, cell: (row) => row.states?.name ?? "—" },
    {
      key: "population",
      header: "Population",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (row.population ? formatNumber(row.population) : "—"),
    },
    {
      key: "featured",
      header: "Featured",
      align: "center",
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFeatured.mutate(row)}
          aria-label="Toggle featured"
        >
          <Star
            className={`h-4 w-4 ${row.is_featured ? "fill-warning text-warning" : "text-muted-foreground"}`}
          />
        </Button>
      ),
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
        title="Cities"
        description="City-level markets, coordinates and SEO metadata."
        actions={
          <>
            <Button variant="outline" onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4" /> Bulk upload
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                form.reset(EMPTY);
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> New city
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Search cities…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Select value={stateId} onValueChange={(value) => { setStateId(value); setPage(1); }}>
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
        <Select value={status} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
          <SelectTrigger>
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
        <Select value={featured} onValueChange={(value) => { setFeatured(value); setPage(1); }}>
          <SelectTrigger>
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Featured & standard</SelectItem>
            <SelectItem value="yes">Featured only</SelectItem>
            <SelectItem value="no">Not featured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => setSelected(checked ? rows.map((row) => row.id) : [])}
          aria-label="Select all"
        />
        <span className="text-xs text-muted-foreground">{selected.length} selected</span>
        {selected.length > 0 ? (
          <>
            <Button size="sm" variant="outline" onClick={() => bulkStatus.mutate("active")}>
              Activate
            </Button>
            <Button size="sm" variant="outline" onClick={() => bulkStatus.mutate("inactive")}>
              Deactivate
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setConfirming(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        ) : null}
      </div>

      {query.isLoading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            emptyMessage="No cities match these filters."
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
            <DialogTitle>{editing ? "Edit city" : "New city"}</DialogTitle>
            <DialogDescription>Cities belong to a state and can host many markets.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            noValidate
            onSubmit={form.handleSubmit((values) => save.mutate(values))}
          >
            <div className="space-y-2">
              <Label>State</Label>
              <Select
                value={form.watch("stateId")}
                onValueChange={(value) => form.setValue("stateId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a state" />
                </SelectTrigger>
                <SelectContent>
                  {(states.data ?? []).map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={form.formState.errors.stateId?.message} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city-name">City name</Label>
                <Input
                  id="city-name"
                  {...form.register("name")}
                  onBlur={(event) => {
                    if (!form.getValues("slug")) form.setValue("slug", slugify(event.target.value));
                  }}
                />
                <FieldError message={form.formState.errors.name?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city-slug">Slug</Label>
                <Input id="city-slug" {...form.register("slug")} />
                <FieldError message={form.formState.errors.slug?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city-lat">Latitude</Label>
                <Input id="city-lat" type="number" step="any" {...form.register("latitude")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city-lng">Longitude</Label>
                <Input id="city-lng" type="number" step="any" {...form.register("longitude")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city-pop">Population</Label>
                <Input id="city-pop" type="number" {...form.register("population")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city-order">Display order</Label>
                <Input id="city-order" type="number" {...form.register("displayOrder")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city-seo">SEO title</Label>
              <Input id="city-seo" {...form.register("seoTitle")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city-meta">Meta description</Label>
              <Textarea id="city-meta" rows={3} {...form.register("metaDescription")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value) => form.setValue("status", value as CityValues["status"])}
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
                <Label htmlFor="city-featured">Featured city</Label>
                <div className="flex h-10 items-center">
                  <Switch
                    id="city-featured"
                    checked={form.watch("isFeatured")}
                    onCheckedChange={(checked) => form.setValue("isFeatured", checked)}
                  />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={save.isPending}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save city"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk upload cities</DialogTitle>
            <DialogDescription>
              CSV or Excel with <code>city</code> and <code>state</code> columns. Existing cities are
              skipped automatically.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) upload.mutate(file);
            }}
          />
          {upload.isPending ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </p>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Delete ${selected.length} city(ies)?`}
        description="Markets and rates linked to them will also be removed."
        confirmLabel="Delete"
        onConfirm={() => remove.mutate()}
      />
    </div>
  );
}
