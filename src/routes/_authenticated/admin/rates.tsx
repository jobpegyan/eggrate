import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  CopyPlus,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { FilterSheet } from "@/components/admin/filter-sheet";
import { PageHeader } from "@/components/admin/page-header";
import { BoolBadge, StatusBadge } from "@/components/admin/status-badge";
import { TablePagination } from "@/components/admin/table-pagination";
import { StatGridSkeleton, TableSkeleton } from "@/components/common/skeletons";
import { DataTable, type Column } from "@/components/data/data-table";
import { StatCard } from "@/components/data/stat-card";
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
import {
  DEFAULT_RATE_FILTERS,
  eggRateSchema,
  type EggRateInput,
  type EggRateValues,
  type RateFilters,
} from "@/lib/rate-schemas";
import { toast } from "@/lib/toast";
import {
  bulkPublish,
  bulkVerify,
  deleteRows,
  duplicateDay,
  getRateDashboard,
  listAllCities,
  listAllMarkets,
  listAllStates,
  listCategories,
  listRates,
  listSources,
  quickUpdateRate,
  saveRate,
  type EggRateRow,
} from "@/services/rates-admin";
import { formatNumber, formatPrice, toISODate } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/admin/rates")({
  component: RatesPage,
});

const PAGE_SIZE = 20;
const NONE = "none";

function yesterday(): string {
  return toISODate(new Date(Date.now() - 86_400_000));
}

const EMPTY: EggRateInput = {
  stateId: "",
  cityId: "",
  marketId: NONE,
  categoryId: NONE,
  sourceId: NONE,
  eggRate: 0,
  dozenPrice: null,
  trayPrice: null,
  hundredPrice: null,
  petiPrice: null,
  wholesalePrice: null,
  retailPrice: null,
  currency: "INR",
  effectiveDate: toISODate(),
  isVerified: false,
  isPublished: false,
  status: "active",
  notes: "",
};

function RatesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = React.useState<RateFilters>(DEFAULT_RATE_FILTERS);
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EggRateRow | null>(null);
  const [confirming, setConfirming] = React.useState(false);
  const [duplicateOpen, setDuplicateOpen] = React.useState(false);
  const [duplicateSource, setDuplicateSource] = React.useState(yesterday());
  const [duplicateTarget, setDuplicateTarget] = React.useState(toISODate());
  const [quickRow, setQuickRow] = React.useState<EggRateRow | null>(null);
  const [quickValue, setQuickValue] = React.useState("");

  const debouncedSearch = useDebouncedValue(filters.search, 300);
  const appliedFilters = React.useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const states = useQuery({ queryKey: ["admin", "all-states"], queryFn: listAllStates });
  const cities = useQuery({
    queryKey: ["admin", "all-cities", filters.stateId],
    queryFn: () => listAllCities(filters.stateId),
  });
  const markets = useQuery({
    queryKey: ["admin", "all-markets", filters.cityId],
    queryFn: () => listAllMarkets(filters.cityId),
  });
  const sources = useQuery({ queryKey: ["admin", "sources"], queryFn: listSources });
  const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: listCategories });

  const formStateId = "form-state";
  const form = useForm<EggRateInput, unknown, EggRateValues>({
    resolver: zodResolver(eggRateSchema),
    defaultValues: EMPTY,
  });
  const formState = form.watch("stateId");
  const formCity = form.watch("cityId");
  const formCities = useQuery({
    queryKey: ["admin", "all-cities", formState || "all"],
    queryFn: () => listAllCities(formState || "all"),
  });
  const formMarkets = useQuery({
    queryKey: ["admin", "all-markets", formCity || "all"],
    queryFn: () => listAllMarkets(formCity || "all"),
  });

  const stats = useQuery({
    queryKey: ["admin", "rate-dashboard"],
    queryFn: () => getRateDashboard(toISODate()),
  });

  const query = useQuery({
    queryKey: ["admin", "rates", appliedFilters, page],
    queryFn: () => listRates(appliedFilters, page, PAGE_SIZE),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "rates"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "rate-dashboard"] });
  };

  const save = useMutation({
    mutationFn: (values: EggRateValues) => saveRate(values, editing?.id, user?.id),
    onSuccess: async () => {
      toast.success(editing ? "Rate updated" : "Rate added");
      setOpen(false);
      setEditing(null);
      form.reset(EMPTY);
      await invalidate();
    },
    onError: (error: Error) => toast.error("Could not save rate", error.message),
  });

  const publish = useMutation({
    mutationFn: (next: boolean) => bulkPublish(selected, next),
    onSuccess: async () => {
      toast.success("Publication updated");
      setSelected([]);
      await invalidate();
    },
    onError: (error: Error) => toast.error("Could not update rates", error.message),
  });

  const verify = useMutation({
    mutationFn: (next: boolean) => bulkVerify(selected, next, user?.id),
    onSuccess: async () => {
      toast.success("Verification updated");
      setSelected([]);
      await invalidate();
    },
    onError: (error: Error) => toast.error("Could not update rates", error.message),
  });

  const remove = useMutation({
    mutationFn: () => deleteRows("egg_rates", selected),
    onSuccess: async () => {
      toast.success("Rates deleted");
      setSelected([]);
      setConfirming(false);
      await invalidate();
    },
    onError: (error: Error) => toast.error("Could not delete rates", error.message),
  });

  const duplicate = useMutation({
    mutationFn: () => duplicateDay(duplicateSource, duplicateTarget, user?.id),
    onSuccess: async (result) => {
      toast.success(
        `${result.copied} rates copied`,
        result.skipped ? `${result.skipped} already existed and were skipped` : undefined,
      );
      setDuplicateOpen(false);
      await invalidate();
    },
    onError: (error: Error) => toast.error("Could not duplicate the day", error.message),
  });

  const quickUpdate = useMutation({
    mutationFn: () => quickUpdateRate(quickRow?.id ?? "", Number(quickValue), user?.id),
    onSuccess: async () => {
      toast.success("Rate updated");
      setQuickRow(null);
      await invalidate();
    },
    onError: (error: Error) => toast.error("Could not update the rate", error.message),
  });

  const triggerAutoUpdate = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("auto_update_egg_rates");
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      toast.success("Rates Auto-Updated", "Today's rates have been refreshed across all active markets.");
      await invalidate();
    },
    onError: (error: Error) => toast.error("Auto-update failed", error.message),
  });

  const rows = query.data?.rows ?? [];
  const allSelected = rows.length > 0 && rows.every((row) => selected.includes(row.id));

  function patch(next: Partial<RateFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  }

  function openEdit(row: EggRateRow) {
    setEditing(row);
    form.reset({
      stateId: row.state_id,
      cityId: row.city_id,
      marketId: row.market_id ?? NONE,
      categoryId: row.category_id ?? NONE,
      sourceId: row.source_id ?? NONE,
      eggRate: Number(row.egg_rate),
      dozenPrice: row.dozen_price,
      trayPrice: row.tray_price,
      hundredPrice: row.hundred_price,
      petiPrice: row.peti_price,
      wholesalePrice: row.wholesale_price,
      retailPrice: row.retail_price,
      currency: row.currency,
      effectiveDate: row.effective_date,
      isVerified: row.is_verified,
      isPublished: row.is_published,
      status: row.status,
      notes: row.notes ?? "",
    });
    setOpen(true);
  }

  const columns: Column<EggRateRow>[] = [
    {
      key: "select",
      header: "",
      cell: (row) => (
        <Checkbox
          checked={selected.includes(row.id)}
          onCheckedChange={(checked) =>
            setSelected((prev) => (checked ? [...prev, row.id] : prev.filter((id) => id !== row.id)))
          }
          aria-label="Select rate"
        />
      ),
    },
    {
      key: "location",
      header: "Location",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.cities?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            {row.states?.name}
            {row.markets?.name ? ` · ${row.markets.name}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "egg_rate",
      header: "Egg rate",
      align: "right",
      cell: (row) => (
        <button
          type="button"
          className="font-semibold tabular-nums underline-offset-2 hover:underline"
          onClick={() => {
            setQuickRow(row);
            setQuickValue(String(row.egg_rate));
          }}
        >
          {formatPrice(Number(row.egg_rate))}
        </button>
      ),
    },
    {
      key: "tray",
      header: "Tray",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (row.tray_price ? formatPrice(Number(row.tray_price)) : "—"),
    },
    {
      key: "hundred",
      header: "100 eggs",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (row.hundred_price ? formatPrice(Number(row.hundred_price)) : "—"),
    },
    { key: "effective_date", header: "Date", hideOnMobile: true, cell: (row) => row.effective_date },
    {
      key: "verified",
      header: "Verified",
      align: "center",
      cell: (row) => <BoolBadge value={row.is_verified} yes="Verified" no="Unverified" />,
    },
    {
      key: "published",
      header: "Published",
      align: "center",
      cell: (row) => <BoolBadge value={row.is_published} yes="Live" no="Draft" />,
    },
    { key: "status", header: "Status", hideOnMobile: true, cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Edit rate">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Egg rates"
        description="Add, verify and publish daily rates for every city and market."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <FilterSheet activeCount={Object.values(filters).filter(v => v !== 'all' && v !== '' && v !== null).length}>
               <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Search</Label>
                    <Input
                      placeholder="Search city, market, note…"
                      value={filters.search}
                      onChange={(event) => patch({ search: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select
                      value={filters.stateId}
                      onValueChange={(value) => patch({ stateId: value, cityId: "all", marketId: "all" })}
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
                  {/* ... other filters can be added here if needed ... */}
               </div>
            </FilterSheet>
             <Button
               variant="outline"
               size="sm"
               disabled={triggerAutoUpdate.isPending}
               onClick={() => triggerAutoUpdate.mutate()}
             >
               {triggerAutoUpdate.isPending ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                 <RefreshCw className="h-4 w-4" />
               )}
               <span className="hidden xs:inline">Auto update rates</span>
             </Button>
             <Button variant="outline" size="sm" onClick={() => setDuplicateOpen(true)}>
               <CopyPlus className="h-4 w-4" /> <span className="hidden xs:inline">Duplicate day</span>
             </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                form.reset(EMPTY);
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> <span className="hidden xs:inline">Add rate</span>
            </Button>
          </div>
        }
      />

      {stats.isLoading ? (
        <StatGridSkeleton />
      ) : (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Published"
            value={formatNumber(stats.data?.publishedToday ?? 0)}
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
          <StatCard
            label="Pending"
            value={formatNumber(stats.data?.pending ?? 0)}
            icon={<Clock className="h-4 w-4" />}
          />
          <StatCard
            label="Updated"
            value={formatNumber(stats.data?.updatedToday ?? 0)}
            icon={<RefreshCw className="h-4 w-4" />}
          />
          <StatCard
            label="Total"
            value={formatNumber(stats.data?.totalRates ?? 0)}
            icon={<CalendarClock className="h-4 w-4" />}
          />
        </div>
      )}

      <div className="hidden lg:grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1 sm:col-span-2 lg:col-span-1">
          <Label className="text-xs text-muted-foreground sm:hidden">Search</Label>
          <Input
            placeholder="Search city, market, note…"
            value={filters.search}
            onChange={(event) => patch({ search: event.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground sm:hidden">State</Label>
          <Select
            value={filters.stateId}
            onValueChange={(value) => patch({ stateId: value, cityId: "all", marketId: "all" })}
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
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground sm:hidden">City</Label>
          <Select
            value={filters.cityId}
            onValueChange={(value) => patch({ cityId: value, marketId: "all" })}
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
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground sm:hidden">Market</Label>
          <Select value={filters.marketId} onValueChange={(value) => patch({ marketId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Market" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All markets</SelectItem>
              {(markets.data ?? []).map((market) => (
                <SelectItem key={market.id} value={market.id}>
                  {market.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => patch({ dateFrom: event.target.value })}
            className="block"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(event) => patch({ dateTo: event.target.value })}
            className="block"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Min ₹</Label>
            <Input
              type="number"
              step="0.01"
              value={filters.minPrice}
              onChange={(event) => patch({ minPrice: event.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Max ₹</Label>
            <Input
              type="number"
              step="0.01"
              value={filters.maxPrice}
              onChange={(event) => patch({ maxPrice: event.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={filters.published}
            onValueChange={(value) => patch({ published: value as RateFilters["published"] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Published" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any state</SelectItem>
              <SelectItem value="yes">Published</SelectItem>
              <SelectItem value="no">Unpublished</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.verified}
            onValueChange={(value) => patch({ verified: value as RateFilters["verified"] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Verified" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any check</SelectItem>
              <SelectItem value="yes">Verified</SelectItem>
              <SelectItem value="no">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => setSelected(checked ? rows.map((row) => row.id) : [])}
          aria-label="Select all rates"
        />
        <span className="text-xs text-muted-foreground">{selected.length} selected</span>
        {selected.length > 0 ? (
          <>
            <Button size="sm" variant="outline" onClick={() => publish.mutate(true)}>
              Publish
            </Button>
            <Button size="sm" variant="outline" onClick={() => publish.mutate(false)}>
              Unpublish
            </Button>
            <Button size="sm" variant="outline" onClick={() => verify.mutate(true)}>
              <BadgeCheck className="h-4 w-4" /> Verify
            </Button>
            <Button size="sm" variant="outline" onClick={() => verify.mutate(false)}>
              Unverify
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setConfirming(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        ) : null}
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto"
          onClick={() => {
            setFilters(DEFAULT_RATE_FILTERS);
            setPage(1);
          }}
        >
          Reset filters
        </Button>
      </div>

      {query.isLoading ? (
        <TableSkeleton rows={8} columns={8} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            emptyMessage="No rates match these filters yet."
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit rate" : "Add rate"}</DialogTitle>
            <DialogDescription>
              Every save is snapshotted to rate history — previous values are never overwritten.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            noValidate
            onSubmit={form.handleSubmit((values) => save.mutate(values))}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={formStateId}>State</Label>
                <Select
                  value={form.watch("stateId")}
                  onValueChange={(value) => {
                    form.setValue("stateId", value);
                    form.setValue("cityId", "");
                    form.setValue("marketId", NONE);
                  }}
                >
                  <SelectTrigger id={formStateId}>
                    <SelectValue placeholder="State" />
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
              <div className="space-y-2">
                <Label>City</Label>
                <Select
                  value={form.watch("cityId")}
                  onValueChange={(value) => form.setValue("cityId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formCities.data ?? []).map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={form.formState.errors.cityId?.message} />
              </div>
              <div className="space-y-2">
                <Label>Market</Label>
                <Select
                  value={form.watch("marketId") ?? NONE}
                  onValueChange={(value) => form.setValue("marketId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Market" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>City-wide (no market)</SelectItem>
                    {(formMarkets.data ?? []).map((market) => (
                      <SelectItem key={market.id} value={market.id}>
                        {market.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="rate-egg">Egg rate (per piece)</Label>
                <Input id="rate-egg" type="number" step="0.01" {...form.register("eggRate")} />
                <FieldError message={form.formState.errors.eggRate?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-dozen">Dozen price</Label>
                <Input id="rate-dozen" type="number" step="0.01" {...form.register("dozenPrice")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-tray">Tray (30) price</Label>
                <Input id="rate-tray" type="number" step="0.01" {...form.register("trayPrice")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-hundred">100 eggs price</Label>
                <Input id="rate-hundred" type="number" step="0.01" {...form.register("hundredPrice")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-peti">210 eggs (peti)</Label>
                <Input id="rate-peti" type="number" step="0.01" {...form.register("petiPrice")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-currency">Currency</Label>
                <Input id="rate-currency" maxLength={3} {...form.register("currency")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-wholesale">Wholesale price</Label>
                <Input id="rate-wholesale" type="number" step="0.01" {...form.register("wholesalePrice")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-retail">Retail price</Label>
                <Input id="rate-retail" type="number" step="0.01" {...form.register("retailPrice")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-date">Effective date</Label>
                <Input id="rate-date" type="date" {...form.register("effectiveDate")} />
                <FieldError message={form.formState.errors.effectiveDate?.message} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.watch("categoryId") ?? NONE}
                  onValueChange={(value) => form.setValue("categoryId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Not set</SelectItem>
                    {(categories.data ?? []).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select
                  value={form.watch("sourceId") ?? NONE}
                  onValueChange={(value) => form.setValue("sourceId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Not set</SelectItem>
                    {(sources.data ?? []).map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value) => form.setValue("status", value as EggRateValues["status"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate-notes">Notes</Label>
              <Textarea id="rate-notes" rows={2} {...form.register("notes")} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <Label htmlFor="rate-verified">Verified</Label>
                <Switch
                  id="rate-verified"
                  checked={form.watch("isVerified")}
                  onCheckedChange={(checked) => form.setValue("isVerified", checked)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <Label htmlFor="rate-published">Published</Label>
                <Switch
                  id="rate-published"
                  checked={form.watch("isPublished")}
                  onCheckedChange={(checked) => form.setValue("isPublished", checked)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={save.isPending}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save rate"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate a day</DialogTitle>
            <DialogDescription>
              Copies every rate from one date onto another as unpublished drafts. Existing rows are
              skipped.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dup-source">Copy from</Label>
              <Input
                id="dup-source"
                type="date"
                value={duplicateSource}
                onChange={(event) => setDuplicateSource(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dup-target">Copy to</Label>
              <Input
                id="dup-target"
                type="date"
                value={duplicateTarget}
                onChange={(event) => setDuplicateTarget(event.target.value)}
              />
            </div>
          </div>
          <Button onClick={() => duplicate.mutate()} disabled={duplicate.isPending}>
            {duplicate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Duplicate rates"}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(quickRow)} onOpenChange={(next) => !next && setQuickRow(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Quick update</DialogTitle>
            <DialogDescription>
              {quickRow?.cities?.name} · {quickRow?.effective_date}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="quick-rate">Egg rate</Label>
            <Input
              id="quick-rate"
              type="number"
              step="0.01"
              value={quickValue}
              onChange={(event) => setQuickValue(event.target.value)}
            />
          </div>
          <Button onClick={() => quickUpdate.mutate()} disabled={quickUpdate.isPending}>
            {quickUpdate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update rate"}
          </Button>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Delete ${selected.length} rate(s)?`}
        description="History snapshots are kept for the audit trail."
        confirmLabel="Delete"
        onConfirm={() => remove.mutate()}
      />
    </div>
  );
}
