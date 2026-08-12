/**
 * Data access layer for the Egg Rate Management System.
 *
 * Every admin read/write goes through this module using the RLS-scoped
 * browser client, so staff permissions are enforced by the database and any
 * future automation (API import, cron, webhook) can reuse the same helpers.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type {
  CityValues,
  DataSourceValues,
  EggRateValues,
  MarketValues,
  RateFilters,
  RecordStatus,
  StateValues,
} from "@/lib/rate-schemas";

type Tables = Database["public"]["Tables"];
export type StateRow = Tables["states"]["Row"];
export type CityRow = Tables["cities"]["Row"] & { states?: { name: string; slug: string } | null };
export type MarketRow = Tables["markets"]["Row"] & {
  cities?: { name: string } | null;
  states?: { name: string } | null;
};
export type DataSourceRow = Tables["data_sources"]["Row"];
export type ImportRow = Tables["imports"]["Row"];
export type ExportRow = Tables["exports"]["Row"];
export type RateHistoryRow = Tables["egg_rate_history"]["Row"];
export type RateLogRow = Tables["rate_logs"]["Row"];
export type EggRateRow = Tables["egg_rates"]["Row"] & {
  states?: { name: string; slug: string } | null;
  cities?: { name: string; slug: string } | null;
  markets?: { name: string } | null;
  data_sources?: { name: string } | null;
};

export interface Page<T> {
  rows: T[];
  total: number;
}

/** Keeps supabase-js from type-parsing long select strings (build performance). */
const sel = (value: string): string => value;

/** Strips PostgREST filter metacharacters so search input cannot alter a query. */
export function sanitize(value: string): string {
  return value.replace(/[%,()*\\]/g, "").trim().slice(0, 80);
}

function nullable(value: string | undefined | null): string | null {
  return value && value !== "none" && value !== "all" ? value : null;
}

function emptyToNull(value: string | undefined | null): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

function range(page: number, pageSize: number): [number, number] {
  const from = (page - 1) * pageSize;
  return [from, from + pageSize - 1];
}

/* ------------------------------------------------------------------ states */

export async function listStates(params: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<Page<StateRow>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const [from, to] = range(page, pageSize);
  let query = supabase
    .from("states")
    .select(sel("*"), { count: "exact" })
    .order("display_order")
    .order("name")
    .range(from, to);

  const search = sanitize(params.search ?? "");
  if (search) query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
  if (params.status && params.status !== "all") query = query.eq("status", params.status as RecordStatus);

  const { data, count, error } = await query.returns<StateRow[]>();
  if (error) throw new Error(error.message);
  return { rows: data ?? [], total: count ?? 0 };
}

export async function listAllStates(): Promise<StateRow[]> {
  const { data, error } = await supabase
    .from("states")
    .select(sel("*"))
    .order("name")
    .returns<StateRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveState(values: StateValues, id?: string, actorId?: string) {
  const payload = {
    name: values.name,
    slug: values.slug,
    code: emptyToNull(values.code),
    seo_title: emptyToNull(values.seoTitle),
    meta_description: emptyToNull(values.metaDescription),
    status: values.status,
    display_order: values.displayOrder,
  };
  const { error } = id
    ? await supabase.from("states").update(payload).eq("id", id)
    : await supabase.from("states").insert({ ...payload, created_by: actorId ?? null });
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ cities */

export async function listCities(params: {
  search?: string;
  stateId?: string;
  status?: string;
  featured?: string;
  page?: number;
  pageSize?: number;
}): Promise<Page<CityRow>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const [from, to] = range(page, pageSize);
  let query = supabase
    .from("cities")
    .select(sel("*, states(name, slug)"), { count: "exact" })
    .order("name")
    .range(from, to);

  const search = sanitize(params.search ?? "");
  if (search) query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
  if (params.stateId && params.stateId !== "all") query = query.eq("state_id", params.stateId);
  if (params.status && params.status !== "all") query = query.eq("status", params.status as RecordStatus);
  if (params.featured === "yes") query = query.eq("is_featured", true);
  if (params.featured === "no") query = query.eq("is_featured", false);

  const { data, count, error } = await query.returns<CityRow[]>();
  if (error) throw new Error(error.message);
  return { rows: data ?? [], total: count ?? 0 };
}

export async function listAllCities(stateId?: string): Promise<CityRow[]> {
  let query = supabase.from("cities").select(sel("*, states(name, slug)")).order("name");
  if (stateId && stateId !== "all") query = query.eq("state_id", stateId);
  const { data, error } = await query.returns<CityRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveCity(values: CityValues, id?: string, actorId?: string) {
  const payload = {
    state_id: values.stateId,
    name: values.name,
    slug: values.slug,
    latitude: values.latitude,
    longitude: values.longitude,
    population: values.population,
    is_featured: values.isFeatured,
    status: values.status,
    seo_title: emptyToNull(values.seoTitle),
    meta_description: emptyToNull(values.metaDescription),
    display_order: values.displayOrder,
  };
  const { error } = id
    ? await supabase.from("cities").update(payload).eq("id", id)
    : await supabase.from("cities").insert({ ...payload, created_by: actorId ?? null });
  if (error) throw new Error(error.message);
}

/** Bulk city upload: "City, State" pairs resolved against existing states. */
export async function bulkCreateCities(
  entries: { name: string; stateName: string }[],
  actorId?: string,
): Promise<{ created: number; skipped: string[] }> {
  const states = await listAllStates();
  const byName = new Map(states.map((state) => [state.name.toLowerCase(), state.id]));
  const existing = new Set((await listAllCities()).map((city) => city.slug));
  const skipped: string[] = [];
  const payload: Tables["cities"]["Insert"][] = [];

  for (const entry of entries) {
    const stateId = byName.get(entry.stateName.toLowerCase());
    const slug = slugify(entry.name);
    if (!stateId) {
      skipped.push(`${entry.name} — unknown state "${entry.stateName}"`);
      continue;
    }
    if (existing.has(slug)) {
      skipped.push(`${entry.name} — already exists`);
      continue;
    }
    existing.add(slug);
    payload.push({ name: entry.name, slug, state_id: stateId, created_by: actorId ?? null });
  }

  if (payload.length) {
    const { error } = await supabase.from("cities").insert(payload);
    if (error) throw new Error(error.message);
  }
  return { created: payload.length, skipped };
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ----------------------------------------------------------------- markets */

export async function listMarkets(params: {
  search?: string;
  stateId?: string;
  cityId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<Page<MarketRow>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const [from, to] = range(page, pageSize);
  let query = supabase
    .from("markets")
    .select(sel("*, cities(name), states(name)"), { count: "exact" })
    .order("name")
    .range(from, to);

  const search = sanitize(params.search ?? "");
  if (search) query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
  if (params.stateId && params.stateId !== "all") query = query.eq("state_id", params.stateId);
  if (params.cityId && params.cityId !== "all") query = query.eq("city_id", params.cityId);
  if (params.status && params.status !== "all") query = query.eq("status", params.status as RecordStatus);

  const { data, count, error } = await query.returns<MarketRow[]>();
  if (error) throw new Error(error.message);
  return { rows: data ?? [], total: count ?? 0 };
}

export async function listAllMarkets(cityId?: string): Promise<MarketRow[]> {
  let query = supabase.from("markets").select(sel("*, cities(name), states(name)")).order("name");
  if (cityId && cityId !== "all") query = query.eq("city_id", cityId);
  const { data, error } = await query.returns<MarketRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveMarket(values: MarketValues, id?: string, actorId?: string) {
  const cities = await listAllCities();
  const city = cities.find((entry) => entry.id === values.cityId);
  if (!city) throw new Error("Select a valid city");

  const payload = {
    name: values.name,
    slug: values.slug,
    city_id: values.cityId,
    state_id: city.state_id,
    market_type: values.marketType,
    supports_wholesale: values.supportsWholesale,
    supports_retail: values.supportsRetail,
    status: values.status,
    seo_title: emptyToNull(values.seoTitle),
    meta_description: emptyToNull(values.metaDescription),
  };
  const { error } = id
    ? await supabase.from("markets").update(payload).eq("id", id)
    : await supabase.from("markets").insert({ ...payload, created_by: actorId ?? null });
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------ data sources */

export async function listSources(): Promise<DataSourceRow[]> {
  const { data, error } = await supabase
    .from("data_sources")
    .select(sel("*"))
    .order("name")
    .returns<DataSourceRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveSource(values: DataSourceValues, id?: string) {
  const payload = {
    key: values.key,
    name: values.name,
    kind: values.kind,
    url: emptyToNull(values.url),
    description: emptyToNull(values.description),
    is_trusted: values.isTrusted,
    status: values.status,
  };
  const { error } = id
    ? await supabase.from("data_sources").update(payload).eq("id", id)
    : await supabase.from("data_sources").insert(payload);
  if (error) throw new Error(error.message);
}

export async function listCategories() {
  const { data, error } = await supabase
    .from("rate_categories")
    .select(sel("id, name, key"))
    .order("display_order")
    .returns<{ id: string; name: string; key: string }[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

/* --------------------------------------------------------------- egg rates */

export async function listRates(
  filters: RateFilters,
  page = 1,
  pageSize = 20,
): Promise<Page<EggRateRow>> {
  const [from, to] = range(page, pageSize);
  let query = supabase
    .from("egg_rates")
    .select(sel("*, states(name, slug), cities(name, slug), markets(name), data_sources(name)"), {
      count: "exact",
    })
    .order("effective_date", { ascending: false })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (filters.stateId !== "all") query = query.eq("state_id", filters.stateId);
  if (filters.cityId !== "all") query = query.eq("city_id", filters.cityId);
  if (filters.marketId !== "all") query = query.eq("market_id", filters.marketId);
  if (filters.dateFrom) query = query.gte("effective_date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("effective_date", filters.dateTo);
  if (filters.minPrice) query = query.gte("egg_rate", Number(filters.minPrice));
  if (filters.maxPrice) query = query.lte("egg_rate", Number(filters.maxPrice));
  if (filters.published !== "all") query = query.eq("is_published", filters.published === "yes");
  if (filters.verified !== "all") query = query.eq("is_verified", filters.verified === "yes");

  const { data, count, error } = await query.returns<EggRateRow[]>();
  if (error) throw new Error(error.message);

  const search = sanitize(filters.search).toLowerCase();
  const rows = search
    ? (data ?? []).filter((row) =>
        [row.cities?.name, row.states?.name, row.markets?.name, row.notes, String(row.egg_rate)]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search)),
      )
    : (data ?? []);

  return { rows, total: count ?? 0 };
}

export function ratePayload(values: EggRateValues, actorId?: string) {
  return {
    state_id: values.stateId,
    city_id: values.cityId,
    market_id: nullable(values.marketId),
    category_id: nullable(values.categoryId),
    source_id: nullable(values.sourceId),
    egg_rate: values.eggRate,
    dozen_price: values.dozenPrice,
    tray_price: values.trayPrice,
    hundred_price: values.hundredPrice,
    peti_price: values.petiPrice,
    wholesale_price: values.wholesalePrice,
    retail_price: values.retailPrice,
    currency: values.currency.toUpperCase(),
    effective_date: values.effectiveDate,
    is_verified: values.isVerified,
    is_published: values.isPublished,
    status: values.status,
    notes: emptyToNull(values.notes),
    updated_by: actorId ?? null,
    published_at: values.isPublished ? new Date().toISOString() : null,
    verified_at: values.isVerified ? new Date().toISOString() : null,
    verified_by: values.isVerified ? (actorId ?? null) : null,
  };
}

export async function saveRate(values: EggRateValues, id?: string, actorId?: string) {
  const payload = ratePayload(values, actorId);
  const { error } = id
    ? await supabase.from("egg_rates").update(payload).eq("id", id)
    : await supabase.from("egg_rates").insert({ ...payload, created_by: actorId ?? null });
  if (error) throw new Error(error.message);

  try {
    const { syncSubCityRatesFromMainCities } = await import("./subcity-sync.server");
    await syncSubCityRatesFromMainCities(values.effectiveDate);
  } catch {
    // Non-blocking sync trigger
  }
}

export async function deleteRows(table: "states" | "cities" | "markets" | "egg_rates" | "data_sources", ids: string[]) {
  if (!ids.length) return;
  const { error } = await supabase.from(table).delete().in("id", ids);
  if (error) throw new Error(error.message);
}

export async function setStatus(
  table: "states" | "cities" | "markets" | "egg_rates" | "data_sources",
  ids: string[],
  status: RecordStatus,
) {
  if (!ids.length) return;
  const { error } = await supabase.from(table).update({ status }).in("id", ids);
  if (error) throw new Error(error.message);
}

export async function bulkPublish(ids: string[], publish: boolean) {
  if (!ids.length) return;
  const { error } = await supabase
    .from("egg_rates")
    .update({ is_published: publish, published_at: publish ? new Date().toISOString() : null })
    .in("id", ids);
  if (error) throw new Error(error.message);
}

export async function bulkVerify(ids: string[], verify: boolean, actorId?: string) {
  if (!ids.length) return;
  const { error } = await supabase
    .from("egg_rates")
    .update({
      is_verified: verify,
      verified_at: verify ? new Date().toISOString() : null,
      verified_by: verify ? (actorId ?? null) : null,
    })
    .in("id", ids);
  if (error) throw new Error(error.message);
}

/** Quick update: change only the headline rate for a row. */
export async function quickUpdateRate(id: string, eggRate: number, actorId?: string) {
  const { error } = await supabase
    .from("egg_rates")
    .update({ egg_rate: eggRate, updated_by: actorId ?? null })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/** Copies every rate from `sourceDate` onto `targetDate`, skipping duplicates. */
export async function duplicateDay(
  sourceDate: string,
  targetDate: string,
  actorId?: string,
): Promise<{ copied: number; skipped: number }> {
  const { data: source, error } = await supabase
    .from("egg_rates")
    .select(sel("*"))
    .eq("effective_date", sourceDate)
    .returns<Tables["egg_rates"]["Row"][]>();
  if (error) throw new Error(error.message);
  if (!source?.length) return { copied: 0, skipped: 0 };

  const { data: existing } = await supabase
    .from("egg_rates")
    .select(sel("city_id, market_id"))
    .eq("effective_date", targetDate)
    .returns<{ city_id: string; market_id: string | null }[]>();
  const taken = new Set((existing ?? []).map((row) => `${row.city_id}:${row.market_id ?? ""}`));

  const payload = source
    .filter((row) => !taken.has(`${row.city_id}:${row.market_id ?? ""}`))
    .map((row) => ({
      state_id: row.state_id,
      city_id: row.city_id,
      market_id: row.market_id,
      category_id: row.category_id,
      source_id: row.source_id,
      egg_rate: row.egg_rate,
      dozen_price: row.dozen_price,
      tray_price: row.tray_price,
      hundred_price: row.hundred_price,
      peti_price: row.peti_price,
      wholesale_price: row.wholesale_price,
      retail_price: row.retail_price,
      currency: row.currency,
      effective_date: targetDate,
      is_verified: false,
      is_published: false,
      status: row.status,
      created_by: actorId ?? null,
      updated_by: actorId ?? null,
    }));

  if (payload.length) {
    const { error: insertError } = await supabase.from("egg_rates").insert(payload);
    if (insertError) throw new Error(insertError.message);
  }
  return { copied: payload.length, skipped: source.length - payload.length };
}

/* ----------------------------------------------------------------- history */

export async function listHistory(params: {
  rateId?: string;
  cityId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}): Promise<Page<RateHistoryRow & { cities?: { name: string } | null; states?: { name: string } | null }>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const [from, to] = range(page, pageSize);
  let query = supabase
    .from("egg_rate_history")
    .select(sel("*, cities(name), states(name)"), { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.rateId) query = query.eq("rate_id", params.rateId);
  if (params.cityId && params.cityId !== "all") query = query.eq("city_id", params.cityId);
  if (params.dateFrom) query = query.gte("effective_date", params.dateFrom);
  if (params.dateTo) query = query.lte("effective_date", params.dateTo);

  const { data, count, error } = await query.returns<
    (RateHistoryRow & { cities?: { name: string } | null; states?: { name: string } | null })[]
  >();
  if (error) throw new Error(error.message);
  return { rows: data ?? [], total: count ?? 0 };
}

/** Restores the prices captured in a history snapshot back onto the live rate. */
export async function restoreHistory(entry: RateHistoryRow, actorId?: string) {
  if (!entry.rate_id) throw new Error("This snapshot is no longer linked to a live rate");
  const { error } = await supabase
    .from("egg_rates")
    .update({
      egg_rate: entry.egg_rate ?? 0,
      dozen_price: entry.dozen_price,
      tray_price: entry.tray_price,
      hundred_price: entry.hundred_price,
      peti_price: entry.peti_price,
      wholesale_price: entry.wholesale_price,
      retail_price: entry.retail_price,
      updated_by: actorId ?? null,
    })
    .eq("id", entry.rate_id);
  if (error) throw new Error(error.message);
}

export async function listRateLogs(limit = 25): Promise<RateLogRow[]> {
  const { data, error } = await supabase
    .from("rate_logs")
    .select(sel("*"))
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<RateLogRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

/* ----------------------------------------------------------------- imports */

export async function listImports(): Promise<ImportRow[]> {
  const { data, error } = await supabase
    .from("imports")
    .select(sel("*"))
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<ImportRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createImportRecord(input: {
  fileName: string;
  fileFormat: "csv" | "xlsx" | "json";
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  errors: unknown;
  preview: unknown;
  sourceId?: string | null;
  actorId?: string;
}): Promise<ImportRow> {
  const { data, error } = await supabase
    .from("imports")
    .insert({
      file_name: input.fileName,
      file_format: input.fileFormat,
      total_rows: input.totalRows,
      valid_rows: input.validRows,
      invalid_rows: input.invalidRows,
      duplicate_rows: input.duplicateRows,
      errors: input.errors as never,
      preview: input.preview as never,
      source_id: input.sourceId ?? null,
      status: "previewed",
      created_by: input.actorId ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ImportRow;
}

export async function commitImport(
  importId: string,
  rows: Tables["egg_rates"]["Insert"][],
): Promise<number> {
  if (rows.length) {
    const { error } = await supabase
      .from("egg_rates")
      .insert(rows.map((row) => ({ ...row, import_id: importId })));
    if (error) {
      await supabase.from("imports").update({ status: "failed" }).eq("id", importId);
      throw new Error(error.message);
    }
  }
  const { error: updateError } = await supabase
    .from("imports")
    .update({ status: "completed", imported_rows: rows.length })
    .eq("id", importId);
  if (updateError) throw new Error(updateError.message);
  return rows.length;
}

/** Removes every rate created by an import and marks the batch rolled back. */
export async function rollbackImport(importId: string) {
  const { error } = await supabase.from("egg_rates").delete().eq("import_id", importId);
  if (error) throw new Error(error.message);
  const { error: updateError } = await supabase
    .from("imports")
    .update({ status: "rolled_back", rolled_back_at: new Date().toISOString(), imported_rows: 0 })
    .eq("id", importId);
  if (updateError) throw new Error(updateError.message);
}

/* ----------------------------------------------------------------- exports */

export async function listExports(): Promise<ExportRow[]> {
  const { data, error } = await supabase
    .from("exports")
    .select(sel("*"))
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<ExportRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function recordExport(input: {
  format: "csv" | "xlsx" | "json";
  filters: unknown;
  rowCount: number;
  actorId?: string;
}) {
  const { error } = await supabase.from("exports").insert({
    file_format: input.format,
    filters: input.filters as never,
    row_count: input.rowCount,
    created_by: input.actorId ?? null,
  });
  if (error) throw new Error(error.message);
}

/** Full result set for an export — no pagination. */
export async function fetchRatesForExport(filters: RateFilters): Promise<EggRateRow[]> {
  const { rows } = await listRates(filters, 1, 1000);
  return rows;
}

/* --------------------------------------------------------------- dashboard */

export async function getRateDashboard(today: string) {
  const [published, pending, updatedToday, states, cities, markets, rates] = await Promise.all([
    supabase
      .from("egg_rates")
      .select("id", { count: "exact", head: true })
      .eq("effective_date", today)
      .eq("is_published", true),
    supabase
      .from("egg_rates")
      .select("id", { count: "exact", head: true })
      .eq("is_published", false),
    supabase
      .from("egg_rates")
      .select("id", { count: "exact", head: true })
      .gte("updated_at", `${today}T00:00:00Z`),
    supabase.from("states").select("id", { count: "exact", head: true }),
    supabase.from("cities").select("id", { count: "exact", head: true }),
    supabase.from("markets").select("id", { count: "exact", head: true }),
    supabase.from("egg_rates").select("id", { count: "exact", head: true }),
  ]);

  return {
    publishedToday: published.count ?? 0,
    pending: pending.count ?? 0,
    updatedToday: updatedToday.count ?? 0,
    states: states.count ?? 0,
    cities: cities.count ?? 0,
    markets: markets.count ?? 0,
    totalRates: rates.count ?? 0,
  };
}
