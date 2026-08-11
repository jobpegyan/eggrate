import * as React from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { ADMIN_NAV } from "@/components/admin/admin-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/common/skeletons";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: `Admin console — ${SITE.name}` },
      { name: "description", content: `Manage users, roles, content and settings for ${SITE.name}.` },
      { property: "og:title", content: `Admin console — ${SITE.name}` },
      { property: "og:description", content: `Internal control panel for ${SITE.name}.` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { loading, isStaff, isAdmin, profile, user, roles, hasPermission, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { resolvedTheme, toggleTheme } = useTheme();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => setMobileOpen(false), [pathname]);

  if (loading) return <PageSkeleton />;

  if (!isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <div className="max-w-sm">
          <h1 className="font-display text-xl font-semibold">Access restricted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account does not have permission to open the admin console.
          </p>
          <Button asChild className="mt-5">
            <Link to="/">Back to site</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    await navigate({ to: "/auth", replace: true });
  };

  const visibleGroups = ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.adminOnly && !isAdmin) return false;
      if (item.permission && !isAdmin && !hasPermission(item.permission)) return false;
      return true;
    }),
  })).filter((group) => group.items.length > 0);

  const initials = (profile?.full_name ?? user?.email ?? "?")
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sidebar = (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <Link to="/" className="flex items-center gap-2 px-2 font-display text-lg font-bold">
        {SITE.name}
      </Link>
      {visibleGroups.map((group) => (
        <div key={group.label}>
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          <ul className="mt-2 space-y-1">
            {group.items.map((item) => {
              const active = pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-muted/30 pb-safe">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-card lg:block pt-safe">
        {sidebar}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-border bg-card">
            <div className="flex justify-end p-2">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {sidebar}
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur pt-safe h-[calc(3.5rem+env(safe-area-inset-top))]">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex flex-wrap gap-1">
              {roles.map((role) => (
                <Badge key={role} variant="secondary" className="text-[10px] uppercase">
                  {role.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Link to="/admin" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">
                {profile?.full_name ?? user?.email}
              </span>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 space-y-6 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}