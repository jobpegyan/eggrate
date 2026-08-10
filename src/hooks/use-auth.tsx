import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { isAdminRole, isStaffRole, type AppRole } from "@/lib/rbac";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  permissions: string[];
  loading: boolean;
  isAuthenticated: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  emailVerified: boolean;
  hasRole: (role: AppRole) => boolean;
  hasPermission: (permission: string) => boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

async function loadAccess(userId: string) {
  const [profileResult, rolesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);

  const roles = (rolesResult.data ?? []).map((row) => row.role);
  let permissions: string[] = [];

  if (roles.length > 0) {
    const { data } = await supabase
      .from("role_permissions")
      .select("permission:permissions(key)")
      .in("role", roles);
    permissions = Array.from(
      new Set(
        (data ?? [])
          .map((row) => (row.permission as { key: string } | null)?.key)
          .filter((key): key is string => Boolean(key)),
      ),
    );
  }

  return { profile: profileResult.data ?? null, roles, permissions };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [roles, setRoles] = React.useState<AppRole[]>([]);
  const [permissions, setPermissions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  const hydrate = React.useCallback(async (nextSession: Session | null) => {
    if (!nextSession?.user) {
      setProfile(null);
      setRoles([]);
      setPermissions([]);
      return;
    }
    const access = await loadAccess(nextSession.user.id);
    setProfile(access.profile);
    setRoles(access.roles);
    setPermissions(access.permissions);
  }, []);

  React.useEffect(() => {
    let active = true;

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      // Never call other Supabase APIs synchronously inside this callback.
      void Promise.resolve().then(() => hydrate(nextSession));
    });

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await hydrate(data.session);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [hydrate]);

  const refresh = React.useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    await hydrate(data.session);
  }, [hydrate]);

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setRoles([]);
    setPermissions([]);
  }, []);

  const value = React.useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    return {
      session,
      user,
      profile,
      roles,
      permissions,
      loading,
      isAuthenticated: Boolean(user),
      isStaff: isStaffRole(roles),
      isAdmin: isAdminRole(roles),
      emailVerified: Boolean(user?.email_confirmed_at),
      hasRole: (role) => roles.includes(role),
      hasPermission: (permission) => permissions.includes(permission),
      refresh,
      signOut,
    };
  }, [session, profile, roles, permissions, loading, refresh, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}