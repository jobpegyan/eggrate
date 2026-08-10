import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import type { AppRole } from "@/lib/rbac";

type Client = SupabaseClient<Database>;

/** In-memory fixed-window rate limiter for privileged mutations. */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (bucket.count >= limit) {
    throw new Error("Too many requests. Please slow down and try again shortly.");
  }
  bucket.count += 1;
}

/** Verifies the caller holds an admin-level role. Uses the caller's RLS-scoped client. */
export async function assertAdmin(supabase: Client, userId: string) {
  const { data, error } = await supabase.rpc("is_admin", { _user_id: userId });
  if (error) throw new Error("Unable to verify permissions");
  if (!data) throw new Error("Forbidden: admin access required");
}

/** Verifies the caller holds a staff-level role (editor and above). */
export async function assertStaff(supabase: Client, userId: string) {
  const { data, error } = await supabase.rpc("is_staff", { _user_id: userId });
  if (error) throw new Error("Unable to verify permissions");
  if (!data) throw new Error("Forbidden: staff access required");
}

export async function assertPermission(supabase: Client, userId: string, permission: string) {
  const { data, error } = await supabase.rpc("has_permission", {
    _user_id: userId,
    _permission: permission,
  });
  if (error) throw new Error("Unable to verify permissions");
  if (!data) throw new Error(`Forbidden: missing permission "${permission}"`);
}

export async function recordActivity(input: {
  actorId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("activity_logs").insert({
    user_id: input.actorId,
    action: input.action,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    description: input.description ?? null,
    metadata: (input.metadata ?? {}) as never,
  });
}

export async function recordSystemLog(input: {
  level: Database["public"]["Enums"]["log_level"];
  source: string;
  message: string;
  context?: Record<string, unknown>;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("system_logs").insert({
    level: input.level,
    source: input.source,
    message: input.message,
    context: (input.context ?? {}) as never,
  });
}

export function sanitizeSearch(value: string): string {
  // Strip PostgREST filter metacharacters so search input can never alter the query.
  return value.replace(/[%,()*\\]/g, "").trim().slice(0, 80);
}

export const ROLE_RANK: Record<AppRole, number> = {
  guest: 0,
  user: 10,
  editor: 50,
  admin: 90,
  super_admin: 100,
};