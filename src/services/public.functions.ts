/** Thin public server functions. All logic lives in public.server.ts. */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  getArticle,
  getHomepageData,
  getStaticPage,
  listAdSlots,
  getRegionHistory,
  listArticles,
  listFaqs,
  searchPublicRegions,
  subscribeEmail,
} from "@/services/public.server";
import { getCityPageData, listCitySlugs } from "@/services/city.server";
import { getStatePageData, listStateSlugs } from "@/services/state.server";
import type { Result } from "@/types";

export const fetchHomepage = createServerFn({ method: "GET" }).handler(() => getHomepageData());

export const fetchAdSlots = createServerFn({ method: "GET" }).handler(() => listAdSlots());

export const fetchFaqs = createServerFn({ method: "GET" }).handler(() => listFaqs());

export const fetchArticles = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ limit: z.number().int().min(1).max(50).optional() }).parse(data ?? {}),
  )
  .handler(({ data }) => listArticles(data.limit ?? 12));

export const fetchArticle = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(data))
  .handler(({ data }) => getArticle(data.slug));

export const fetchStaticPage = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(data))
  .handler(({ data }) => getStaticPage(data.slug));

export const fetchStatePage = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(data))
  .handler(({ data }) => getStatePageData(data.slug));

export const fetchStateSlugs = createServerFn({ method: "GET" }).handler(() => listStateSlugs());

export const fetchCityPage = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(data))
  .handler(({ data }) => getCityPageData(data.slug));

export const fetchCitySlugs = createServerFn({ method: "GET" }).handler(() => listCitySlugs());

export const searchPublic = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ query: z.string().max(80) }).parse(data))
  .handler(({ data }) => searchPublicRegions(data.query));

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        email: z.string().trim().email().max(160),
        citySlug: z.string().trim().max(80).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<Result<{ email: string }>> => {
    try {
      await subscribeEmail(data.email, data.citySlug);
      return { ok: true, data: { email: data.email } };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Subscription failed" };
    }
  });

export const fetchRegionHistory = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z
      .object({
        type: z.enum(["national", "state", "city"]),
        slug: z.string().optional(),
        days: z.number().int().min(1).max(365).optional(),
      })
      .parse(data),
  )
  .handler(({ data }) => getRegionHistory(data.type, data.slug, data.days));

