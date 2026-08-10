import { z } from "zod";

/**
 * Validation for the Egg Rate Management System.
 * Shared by admin forms, bulk import parsing and any future automation entry
 * point (API import, cron, webhook) so every path validates identically.
 */

export const recordStatusSchema = z.enum(["active", "inactive", "draft", "archived"]);
export const marketTypeSchema = z.enum(["wholesale", "retail", "both"]);
export const sourceKindSchema = z.enum([
  "manual",
  "csv",
  "excel",
  "api",
  "cron",
  "webhook",
  "scrape",
]);
export const exportFormatSchema = z.enum(["csv", "xlsx", "json"]);

export type RecordStatus = z.infer<typeof recordStatusSchema>;
export type MarketType = z.infer<typeof marketTypeSchema>;
export type SourceKind = z.infer<typeof sourceKindSchema>;
export type ExportFormat = z.infer<typeof exportFormatSchema>;

const slug = z
  .string()
  .trim()
  .min(2, "Slug is required")
  .max(90)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only");

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const optionalNumber = z
  .union([z.null(), z.literal(""), z.coerce.number()])
  .optional()
  .transform((value) =>
    value === "" || value === null || value === undefined || Number.isNaN(value)
      ? null
      : Number(value),
  );

export const stateSchema = z.object({
  name: z.string().trim().min(2, "State name is required").max(120),
  slug,
  code: optionalText(10),
  seoTitle: optionalText(160),
  metaDescription: optionalText(320),
  status: recordStatusSchema,
  displayOrder: z.coerce.number().int().min(0).max(9999),
});
export type StateValues = z.infer<typeof stateSchema>;

export const citySchema = z.object({
  stateId: z.string().uuid("Choose a state"),
  name: z.string().trim().min(2, "City name is required").max(120),
  slug,
  latitude: optionalNumber,
  longitude: optionalNumber,
  population: optionalNumber,
  isFeatured: z.boolean(),
  status: recordStatusSchema,
  seoTitle: optionalText(160),
  metaDescription: optionalText(320),
  displayOrder: z.coerce.number().int().min(0).max(9999),
});
export type CityValues = z.output<typeof citySchema>;
export type CityInput = z.input<typeof citySchema>;

export const marketSchema = z.object({
  name: z.string().trim().min(2, "Market name is required").max(120),
  slug,
  cityId: z.string().uuid("Choose a city"),
  marketType: marketTypeSchema,
  supportsWholesale: z.boolean(),
  supportsRetail: z.boolean(),
  status: recordStatusSchema,
  seoTitle: optionalText(160),
  metaDescription: optionalText(320),
});
export type MarketValues = z.infer<typeof marketSchema>;

export const eggRateSchema = z.object({
  stateId: z.string().uuid("Choose a state"),
  cityId: z.string().uuid("Choose a city"),
  marketId: z.string().optional(),
  categoryId: z.string().optional(),
  sourceId: z.string().optional(),
  eggRate: z.coerce.number().min(0, "Rate must be positive").max(100000),
  dozenPrice: optionalNumber,
  trayPrice: optionalNumber,
  hundredPrice: optionalNumber,
  petiPrice: optionalNumber,
  wholesalePrice: optionalNumber,
  retailPrice: optionalNumber,
  currency: z.string().trim().length(3),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date"),
  isVerified: z.boolean(),
  isPublished: z.boolean(),
  status: recordStatusSchema,
  notes: optionalText(500),
});
export type EggRateValues = z.output<typeof eggRateSchema>;
export type EggRateInput = z.input<typeof eggRateSchema>;

export const dataSourceSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, "Key is required")
    .max(60)
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers and underscores"),
  name: z.string().trim().min(2, "Name is required").max(120),
  kind: sourceKindSchema,
  url: z.string().trim().url("Enter a valid URL").max(400).optional().or(z.literal("")),
  description: optionalText(400),
  isTrusted: z.boolean(),
  status: recordStatusSchema,
});
export type DataSourceValues = z.infer<typeof dataSourceSchema>;

/** One parsed row from a CSV/Excel upload, before it becomes an egg_rates row. */
export const importRowSchema = z.object({
  state: z.string().trim().min(2, "State is required").max(120),
  city: z.string().trim().min(2, "City is required").max(120),
  market: z.string().trim().max(120).optional(),
  egg_rate: z.coerce.number().min(0).max(100000),
  dozen_price: optionalNumber,
  tray_price: optionalNumber,
  hundred_price: optionalNumber,
  peti_price: optionalNumber,
  wholesale_price: optionalNumber,
  retail_price: optionalNumber,
  effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});
export type ImportRowValues = z.infer<typeof importRowSchema>;

export const IMPORT_TEMPLATE_COLUMNS = [
  "state",
  "city",
  "market",
  "egg_rate",
  "dozen_price",
  "tray_price",
  "hundred_price",
  "peti_price",
  "wholesale_price",
  "retail_price",
  "effective_date",
] as const;

export const rateFilterSchema = z.object({
  search: z.string().max(120).default(""),
  stateId: z.string().default("all"),
  cityId: z.string().default("all"),
  marketId: z.string().default("all"),
  dateFrom: z.string().default(""),
  dateTo: z.string().default(""),
  minPrice: z.string().default(""),
  maxPrice: z.string().default(""),
  published: z.enum(["all", "yes", "no"]).default("all"),
  verified: z.enum(["all", "yes", "no"]).default("all"),
});
export type RateFilters = z.infer<typeof rateFilterSchema>;

export const DEFAULT_RATE_FILTERS: RateFilters = rateFilterSchema.parse({});
