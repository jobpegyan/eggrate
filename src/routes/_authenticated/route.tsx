import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // Return early during SSR rendering to prevent server-side 500 crashes
    if (typeof window === "undefined") {
      return { user: null };
    }

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        const redirectPath = location?.pathname || "/admin";
        throw redirect({
          to: "/auth",
          search: { redirect: redirectPath },
        });
      }
      return { user: data.user };
    } catch (err: any) {
      if (err?.to) throw err; // Re-throw TanStack redirect
      const redirectPath = location?.pathname || "/admin";
      throw redirect({
        to: "/auth",
        search: { redirect: redirectPath },
      });
    }
  },
  component: () => <Outlet />,
});