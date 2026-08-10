import type { Database } from "@/integrations/supabase/types";

/** Role identifiers are a database enum — labels and permissions live in the database. */
export type AppRole = Database["public"]["Enums"]["app_role"];
export type UserStatus = Database["public"]["Enums"]["user_status"];
export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type LogLevel = Database["public"]["Enums"]["log_level"];

export const STAFF_ROLES: AppRole[] = ["editor", "admin", "super_admin"];
export const ADMIN_ROLES: AppRole[] = ["admin", "super_admin"];

export function isStaffRole(roles: AppRole[]): boolean {
  return roles.some((role) => STAFF_ROLES.includes(role));
}

export function isAdminRole(roles: AppRole[]): boolean {
  return roles.some((role) => ADMIN_ROLES.includes(role));
}