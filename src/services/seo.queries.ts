import { queryOptions } from "@tanstack/react-query";
import { fetchSeoTemplate, fetchRedirect } from "./seo.functions";

export const seoKeys = {
  all: ["seo"] as const,
  templates: () => [...seoKeys.all, "templates"] as const,
  template: (pageType: string) => [...seoKeys.templates(), pageType] as const,
  redirects: () => [...seoKeys.all, "redirects"] as const,
  redirect: (path: string) => [...seoKeys.redirects(), path] as const,
};

export const seoTemplateQuery = (pageType: string) =>
  queryOptions({
    queryKey: seoKeys.template(pageType),
    queryFn: () => fetchSeoTemplate({ data: { pageType } }),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

export const redirectQuery = (path: string) =>
  queryOptions({
    queryKey: seoKeys.redirect(path),
    queryFn: () => fetchRedirect({ data: { path } }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
