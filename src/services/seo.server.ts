import { supabase } from "@/integrations/supabase/client";

export interface SeoTemplate {
  title_template: string;
  description_template: string;
}

export async function getSeoTemplate(pageType: string): Promise<SeoTemplate | null> {
  const { data } = await supabase
    .from("seo_templates")
    .select("title_template, description_template")
    .eq("page_type", pageType)
    .eq("is_active", true)
    .maybeSingle();

  return data as SeoTemplate | null;
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
  const { data } = await supabase
    .from("seo_redirects")
    .select("new_url, status_code")
    .eq("old_url", path)
    .maybeSingle();

  return data as SeoRedirect | null;
}
