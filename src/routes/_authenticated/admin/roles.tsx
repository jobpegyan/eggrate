import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/common/skeletons";
import { DataTable, type Column } from "@/components/data/data-table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/roles")({
  component: RolesPage,
});

interface RoleRow {
  id: string;
  key: string;
  name: string;
  description: string | null;
  level: number;
  is_system: boolean;
  permissions: string[];
}

function RolesPage() {
  const query = useQuery({
    queryKey: ["admin", "roles-matrix"],
    queryFn: async () => {
      const [rolesResult, permissionsResult, mappingResult] = await Promise.all([
        supabase.from("roles").select("*").order("level", { ascending: false }),
        supabase.from("permissions").select("*").order("category"),
        supabase.from("role_permissions").select("role, permission_key"),
      ]);
      if (rolesResult.error) throw new Error(rolesResult.error.message);
      if (permissionsResult.error) throw new Error(permissionsResult.error.message);
      if (mappingResult.error) throw new Error(mappingResult.error.message);

      const roles: RoleRow[] = (rolesResult.data ?? []).map((role) => ({
        ...role,
        permissions: (mappingResult.data ?? [])
          .filter((entry) => entry.role === role.key)
          .map((entry) => entry.permission_key),
      }));
      return { roles, permissions: permissionsResult.data ?? [] };
    },
  });

  const columns: Column<RoleRow>[] = [
    {
      key: "name",
      header: "Role",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.description ?? row.key}</p>
        </div>
      ),
    },
    { key: "level", header: "Level", align: "center", hideOnMobile: true },
    {
      key: "permissions",
      header: "Permissions",
      hideOnMobile: true,
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.permissions.length === 0 ? (
            <span className="text-xs text-muted-foreground">No permissions</span>
          ) : (
            row.permissions.slice(0, 6).map((permission) => (
              <Badge key={permission} variant="outline" className="text-[10px]">
                {permission}
              </Badge>
            ))
          )}
          {row.permissions.length > 6 ? (
            <Badge variant="secondary" className="text-[10px]">
              +{row.permissions.length - 6}
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      key: "is_system",
      header: "Type",
      align: "right",
      cell: (row) => (
        <Badge variant={row.is_system ? "secondary" : "outline"}>
          {row.is_system ? "System" : "Custom"}
        </Badge>
      ),
    },
  ];

  const categories = Array.from(
    new Set((query.data?.permissions ?? []).map((permission) => permission.category)),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & permissions"
        description="Role definitions and their permission grants, loaded from the database."
      />

      {query.isLoading ? (
        <TableSkeleton rows={5} columns={4} />
      ) : (
        <DataTable
          columns={columns}
          rows={query.data?.roles ?? []}
          rowKey={(row) => row.id}
          emptyMessage="No roles defined."
        />
      )}

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Permission catalogue</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {category}
              </p>
              <ul className="mt-3 space-y-2">
                {(query.data?.permissions ?? [])
                  .filter((permission) => permission.category === category)
                  .map((permission) => (
                    <li key={permission.key} className="text-sm">
                      <span className="font-medium">{permission.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{permission.key}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}