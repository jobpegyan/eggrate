import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

import { PageTransition } from "@/components/common/page-transition";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/** Routes that render their own chrome (auth screens, admin console). */
const BARE_PREFIXES = ["/auth", "/reset-password", "/admin"];

/** Root layout: skip link, sticky header, main region, footer. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (BARE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
    </div>
  );
}