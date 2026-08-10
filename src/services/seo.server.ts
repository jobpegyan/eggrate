import { supabase } from "@/integrations/supabase/client";

export interface SeoTemplate {
  title_template: string;
  description_template: string;
}

const templateCache = new Map<string, { data: SeoTemplate | null; timestamp: number }>();
const redirectCache = new Map<string, { data: SeoRedirect | null; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds TTL

export async function getSeoTemplate(pageType: string): Promise<SeoTemplate | null> {
  const cached = templateCache.get(pageType);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const { data } = await supabase
    .from("seo_templates")
    .select("title_template, description_template")
    .eq("page_type", pageType)
    .eq("is_active", true)
    .maybeSingle();

  const result = data as SeoTemplate | null;
  templateCache.set(pageType, { data: result, timestamp: Date.now() });
  return result;
}

export function fillTemplate(template: string, vars: Record<string, string>) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{${key}}`, "g"), value);
  }
  return result;
}

export interface SeoRedirect {
  new_url: string;
  status_code: number;
}

export async function getRedirect(path: string): Promise<SeoRedirect | null> {
  const cached = redirectCache.get(path);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const { data } = await supabase
    .from("seo_redirects")
    .select("new_url, status_code")
    .eq("old_url", path)
    .maybeSingle();

  const result = data as SeoRedirect | null;
  redirectCache.set(path, { data: result, timestamp: Date.now() });
  return result;
}
