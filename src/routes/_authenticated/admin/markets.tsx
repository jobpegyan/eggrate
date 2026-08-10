import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { FilterSheet } from "@/components/admin/filter-sheet";
import { PageHeader } from "@/components/admin/page-header";
import { BoolBadge, StatusBadge } from "@/components/admin/status-badge";
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
import { marketSchema, type MarketValues } from "@/lib/rate-schemas";
import { toast } from "@/lib/toast";
import {
  deleteRows,
  listAllCities,
  listAllStates,
  listMarkets,
  saveMarket,
  setStatus,
  slugify,
  type MarketRow,
} from "@/services/rates-admin";

export const Route = createFileRoute("/_authenticated/admin/markets")({
  component: MarketsPage,
});

const PAGE_SIZE = 20;

const EMPTY: MarketValues = {
  name: "",
  slug: "",
  cityId: "",
  marketType: "both",
  supportsWholesale: true,
  supportsRetail: true,
  status: "active",
  seoTitle: "",
  metaDescription: "",
};

function MarketsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [stateId, setStateId] = React.useState("all");
  const [cityId, setCityId] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [editing, setEditing] = React.useState<MarketRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const debounced = useDebouncedValue(search, 300);

  const states = useQuery({ queryKey: ["admin", "all-states"], queryFn: listAllStates });
  const cities = useQuery({
    queryKey: ["admin", "all-cities", stateId],
    queryFn: () => listAllCities(stateId),
  });
  const formCities = useQuery({ queryKey: ["admin", "all-cities", "all"], queryFn: () => listAllCities() });

  const query = useQuery({
    queryKey: ["admin", "markets", debounced, stateId, cityId, page],
    queryFn: () => listMarkets({ search: debounced, stateId, cityId, page, pageSize: PAGE_SIZE }),
  });

  const form = useForm<MarketValues>({ resolver: zodResolver(marketSchema), defaultValues: EMPTY });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "markets"] });

  const save = useMutation({
    mutationFn: (values: MarketValues) => saveMarket(values, editing?.id, user?.id),
    onSuccess: async () => {
      toast.success(editing ? "Market updated" : "Market created");
      setOpen(false);
      setEditing(null);
      form.reset(EMPTY);
      await invalidate();
    },
    onError: (error: Error) => toast.error("Could not save market", error.message),
  });

  const bulkStatus = useMutation({
    mutationFn: (next: "active" | "inactive") => setStatus("markets", selected, next),
    onSuccess: async () => {
      toast.success("Status updated");
      setSelected([]);
      await invalidate();
    },
    onError: (error: Error) => toast.error("Could not update status", error.message),
  });

  const remove = useMutation({
    mutationFn: () => deleteRows("markets", selected),
    onSuccess: async () => {
      toast.success("Markets deleted");
      setSelected([]);
      setConfirming(false);
      await invalidate();
    },
    onError: (error: Error) => toast.error("Could not delete", error.message),
  });

  const rows = query.data?.rows ?? [];
  const allSelected = rows.length > 0 && rows.every((row) => selected.includes(row.id));

  function openEdit(row: MarketRow) {
    setEditing(row);
    form.reset({
      name: row.name,
      slug: row.slug,
      cityId: row.city_id,
      marketType: row.market_type,
      supportsWholesale: row.supports_wholesale,
      supportsRetail: row.supports_retail,
      status: row.status,
      seoTitle: row.seo_title ?? "",
      metaDescription: row.meta_description ?? "",
    });
    setOpen(true);
  }

  const columns: Column<MarketRow>[] = [
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
      header: "Market",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">/market/{row.slug}</p>
        </div>
      ),
    },
    { key: "city", header: "City", hideOnMobile: true, cell: (row) => row.cities?.name ?? "—" },
    { key: "state", header: "State", hideOnMobile: true, cell: (row) => row.states?.name ?? "—" },
    {
      key: "wholesale",
      header: "Wholesale",
      align: "center",
      hideOnMobile: true,
      cell: (row) => <BoolBadge value={row.supports_wholesale} yes="Yes" no="No" />,
    },
    {
      key: "retail",
      header: "Retail",
      align: "center",
      hideOnMobile: true,
      cell: (row) => <BoolBadge value={row.supports_retail} yes="Yes" no="No" />,
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
        title="Markets"
        description="Physical mandis and trading points that publish their own rates."
        actions={
          <div className="flex items-center gap-2">
            <FilterSheet activeCount={(search ? 1 : 0) + (stateId !== 'all' ? 1 : 0) + (cityId !== 'all' ? 1 : 0)}>
               <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Search</Label>
                    <Input
                      placeholder="Search markets…"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select
                      value={stateId}
                      onValueChange={(value) => {
                        setStateId(value);
                        setCityId("all");
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All states" />
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
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Select value={cityId} onValueChange={(value) => { setCityId(value); setPage(1); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="All cities" />
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
                  </div>
               </div>
            </FilterSheet>
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                form.reset(EMPTY);
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> <span className="hidden xs:inline">New market</span>
            </Button>
          </div>
        }
      />

      <div className="hidden lg:grid gap-4 sm:grid-cols-3">
        <Input
          placeholder="Search markets…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Select
          value={stateId}
          onValueChange={(value) => {
            setStateId(value);
            setCityId("all");
            setPage(1);
          }}
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
            emptyMessage="No markets match these filters."
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
            <DialogTitle>{editing ? "Edit market" : "New market"}</DialogTitle>
            <DialogDescription>
              The state is derived automatically from the selected city.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            noValidate
            onSubmit={form.handleSubmit((values) => save.mutate(values))}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="market-name">Market name</Label>
                <Input
                  id="market-name"
                  {...form.register("name")}
                  onBlur={(event) => {
                    if (!form.getValues("slug")) form.setValue("slug", slugify(event.target.value));
                  }}
                />
                <FieldError message={form.formState.errors.name?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="market-slug">Slug</Label>
                <Input id="market-slug" {...form.register("slug")} />
                <FieldError message={form.formState.errors.slug?.message} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Select
                value={form.watch("cityId")}
                onValueChange={(value) => form.setValue("cityId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a city" />
                </SelectTrigger>
                <SelectContent>
                  {(formCities.data ?? []).map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name} — {city.states?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={form.formState.errors.cityId?.message} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Market type</Label>
                <Select
                  value={form.watch("marketType")}
                  onValueChange={(value) =>
                    form.setValue("marketType", value as MarketValues["marketType"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Wholesale & retail</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value) => form.setValue("status", value as MarketValues["status"])}
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
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <Label htmlFor="market-wholesale">Wholesale prices</Label>
                <Switch
                  id="market-wholesale"
                  checked={form.watch("supportsWholesale")}
                  onCheckedChange={(checked) => form.setValue("supportsWholesale", checked)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <Label htmlFor="market-retail">Retail prices</Label>
                <Switch
                  id="market-retail"
                  checked={form.watch("supportsRetail")}
                  onCheckedChange={(checked) => form.setValue("supportsRetail", checked)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-seo">SEO title</Label>
              <Input id="market-seo" {...form.register("seoTitle")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-meta">Meta description</Label>
              <Textarea id="market-meta" rows={3} {...form.register("metaDescription")} />
            </div>
            <Button type="submit" className="w-full" disabled={save.isPending}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save market"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Delete ${selected.length} market(s)?`}
        description="Rates recorded against them will also be removed."
        confirmLabel="Delete"
        onConfirm={() => remove.mutate()}
      />
    </div>
  );
}
