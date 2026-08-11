import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createUserSchema, updateUserSchema } from "@/lib/validation";
import { z } from "zod";

const listUsersSchema = z.object({
  search: z.string().max(120).default(""),
  role: z.string().max(30).default("all"),
  status: z.string().max(30).default("all"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(5).max(100).default(10),
});

export const listUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => listUsersSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertStaff, sanitizeSearch } = await import("./admin.server");
    await assertStaff(context.supabase, context.userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const from = (data.page - 1) * data.pageSize;

    let query = supabaseAdmin
      .from("profiles")
      .select("*, user_roles(role)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + data.pageSize - 1);

    const search = sanitizeSearch(data.search);
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    if (data.status !== "all") query = query.eq("status", data.status as never);

    const { data: rows, count, error } = await query;
    if (error) throw new Error(error.message);

    const users = (rows ?? []).map((row) => {
      const { user_roles: userRoles, ...profile } = row as typeof row & {
        user_roles: { role: string }[];
      };
      return { ...profile, roles: (userRoles ?? []).map((entry) => entry.role) };
    });

    const filtered =
      data.role === "all" ? users : users.filter((user) => user.roles.includes(data.role));

    return { users: filtered, total: count ?? 0, page: data.page, pageSize: data.pageSize };
  });

export const createUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => createUserSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, enforceRateLimit, recordActivity, ROLE_RANK } = await import(
      "./admin.server"
    );
    await assertAdmin(context.supabase, context.userId);
    enforceRateLimit(`create-user:${context.userId}`, 10, 60_000);

    if (data.role === "super_admin") {
      const { data: isSuper } = await context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: "super_admin",
      });
      if (!isSuper) throw new Error("Only a super admin can create super admins");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create the user");

    await supabaseAdmin
      .from("profiles")
      .update({ full_name: data.fullName, status: data.status })
      .eq("id", created.user.id);

    if (ROLE_RANK[data.role] > ROLE_RANK["user"]) {
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: created.user.id, role: data.role });
    }

    await recordActivity({
      actorId: context.userId,
      action: "user.created",
      entityType: "user",
      entityId: created.user.id,
      description: `Created user ${data.email} with role ${data.role}`,
    });

    return { id: created.user.id };
  });

export const updateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => updateUserSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, enforceRateLimit, recordActivity } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    enforceRateLimit(`update-user:${context.userId}`, 40, 60_000);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: data.fullName,
        phone: data.phone ?? null,
        language: data.language,
        timezone: data.timezone,
        status: data.status,
      })
      .eq("id", data.userId);

    if (error) throw new Error(error.message);

    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    if (data.role !== "user") {
      await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role });
    }

    await recordActivity({
      actorId: context.userId,
      action: "user.updated",
      entityType: "user",
      entityId: data.userId,
      description: `Updated profile details and set role to ${data.role}`,
    });

    return { ok: true };
  });

export const setUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      userId: z.string().uuid(),
      password: z.string().min(8, "Password must be at least 8 characters").max(72),
    })
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, enforceRateLimit, recordActivity } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    enforceRateLimit(`set-password:${context.userId}`, 10, 60_000);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.password,
    });
    if (error) throw new Error(error.message);

    await recordActivity({
      actorId: context.userId,
      action: "user.password_reset",
      entityType: "user",
      entityId: data.userId,
      description: `Updated password for user ${data.userId}`,
    });

    return { success: true };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, enforceRateLimit, recordActivity } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    enforceRateLimit(`delete-user:${context.userId}`, 10, 60_000);
    if (data.userId === context.userId) throw new Error("You cannot delete your own account");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);

    await recordActivity({
      actorId: context.userId,
      action: "user.deleted",
      entityType: "user",
      entityId: data.userId,
      description: "Deleted a user account",
    });

    return { ok: true };
  });

export const getDashboardStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertStaff } = await import("./admin.server");
    await assertStaff(context.supabase, context.userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [total, active, recent, activity, errors] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
      supabaseAdmin
        .from("activity_logs")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
      supabaseAdmin
        .from("system_logs")
        .select("id", { count: "exact", head: true })
        .in("level", ["error", "critical"])
        .gte("created_at", since),
    ]);

    return {
      totalUsers: total.count ?? 0,
      activeUsers: active.count ?? 0,
      newUsers: recent.count ?? 0,
      activityEvents: activity.count ?? 0,
      errorEvents: errors.count ?? 0,
    };
  });

const logsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(5).max(100).default(20),
  search: z.string().max(120).default(""),
  level: z.string().max(20).default("all"),
});

export const listActivityLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => logsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertStaff, sanitizeSearch } = await import("./admin.server");
    await assertStaff(context.supabase, context.userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const from = (data.page - 1) * data.pageSize;
    let query = supabaseAdmin
      .from("activity_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + data.pageSize - 1);

    const search = sanitizeSearch(data.search);
    if (search) query = query.ilike("action", `%${search}%`);

    const { data: rows, count, error } = await query;
    if (error) throw new Error(error.message);

    const userIds = Array.from(
      new Set((rows ?? []).map((row) => row.user_id).filter((id): id is string => Boolean(id))),
    );
    const profiles = userIds.length
      ? (await supabaseAdmin.from("profiles").select("id, full_name, email").in("id", userIds)).data
      : [];

    const logs = (rows ?? []).map((row) => {
      const profile = (profiles ?? []).find((entry) => entry.id === row.user_id) ?? null;
      return {
        ...row,
        profile: profile ? { full_name: profile.full_name, email: profile.email } : null,
      };
    });

    return { logs, total: count ?? 0 };
  });

export const listSystemLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => logsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, sanitizeSearch } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const from = (data.page - 1) * data.pageSize;
    let query = supabaseAdmin
      .from("system_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + data.pageSize - 1);

    const search = sanitizeSearch(data.search);
    if (search) query = query.ilike("message", `%${search}%`);
    if (data.level !== "all") query = query.eq("level", data.level as never);

    const { data: rows, count, error } = await query;
    if (error) throw new Error(error.message);
    return { logs: rows ?? [], total: count ?? 0 };
  });