import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/constants";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const { data } = await supabase
          .from("seo_settings")
          .select("value")
          .eq("key", "robots_txt")
          .single();

        let content = data?.value;

        if (!content) {
          content = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /_authenticated/

Sitemap: ${SITE.baseUrl}/sitemap.xml`;
        }

        return new Response(content, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
