import {
  Activity,
  AlertTriangle,
  Bell,
  BrainCircuit,
  Building2,
  Clock,
  Database,
  Download,
  Egg,
  FileCode2,
  FlaskConical,
  History,
  LayoutDashboard,
  Map,
  MapPin,
  Megaphone,
  Search,
  Settings,
  ShieldCheck,
  Terminal,
  Upload,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AdminNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Permission key required to see the item; undefined means any staff member. */
  permission?: string;
  adminOnly?: boolean;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Access",
    items: [
      { label: "Users", to: "/admin/users", icon: Users, permission: "users.view" },
      { label: "Roles & permissions", to: "/admin/roles", icon: ShieldCheck, adminOnly: true },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Announcements", to: "/admin/announcements", icon: Bell },
      { label: "Pages", to: "/admin/pages", icon: FileCode2 },
      { label: "Ad Management", to: "/admin/ads", icon: Megaphone },
    ],
  },
  {
    label: "Egg rates",
    items: [
      { label: "Egg rates", to: "/admin/rates", icon: Egg },
      { label: "Rate history", to: "/admin/rate-history", icon: History },
      { label: "Imports", to: "/admin/imports", icon: Upload },
      { label: "Exports", to: "/admin/exports", icon: Download },
      { label: "Data sources", to: "/admin/sources", icon: Database },
    ],
  },
  {
    label: "Locations",
    items: [
      { label: "States", to: "/admin/states", icon: Map },
      { label: "Cities", to: "/admin/cities", icon: MapPin },
      { label: "Markets", to: "/admin/markets", icon: Building2 },
    ],
  },
  {
    label: "Configuration",
    items: [
      { label: "Website settings", to: "/admin/settings", icon: Settings, adminOnly: true },
      { label: "SEO settings", to: "/admin/seo", icon: Search, adminOnly: true },
    ],
  },
  {
    label: "Automation",
    items: [
      { label: "Data Pipeline", to: "/admin", icon: Activity },
      { label: "Diagnostics", to: "/admin/diagnostics", icon: Activity, adminOnly: true },
      { label: "Pipeline Simulation", to: "/admin/simulation", icon: FlaskConical, adminOnly: true },
      { label: "Data Quality", to: "/admin/quality", icon: ShieldCheck, adminOnly: true },
      { label: "Conflicts", to: "/admin/conflicts", icon: AlertTriangle, adminOnly: true },
      { label: "AI Analysis", to: "/admin/ai", icon: BrainCircuit, adminOnly: true },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { label: "Activity logs", to: "/admin/activity-logs", icon: Clock },
      { label: "System logs", to: "/admin/system-logs", icon: Terminal, adminOnly: true },
    ],
  },
];