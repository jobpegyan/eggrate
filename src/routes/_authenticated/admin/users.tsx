import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { TablePagination } from "@/components/admin/table-pagination";
import { FieldError } from "@/components/forms/field-error";
import { TableSkeleton } from "@/components/common/skeletons";
import { DataTable, type Column } from "@/components/data/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/lib/toast";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserValues,
  type UpdateUserValues,
} from "@/lib/validation";
import { createUser, deleteUser, listUsers, updateUser } from "@/services/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersPage,
});

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  language: string;
  timezone: string;
  status: "active" | "suspended" | "pending";
  created_at: string;
  roles: string[];
}

const PAGE_SIZE = 10;

function UsersPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const fetchUsers = useServerFn(listUsers);
  const [search, setSearch] = React.useState("");
  const [role, setRole] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<UserRow | null>(null);
  const [deleting, setDeleting] = React.useState<UserRow | null>(null);

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("roles").select("*").order("level");
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const usersQuery = useQuery({
    queryKey: ["admin", "users", { search, role, status, page }],
    queryFn: () =>
      fetchUsers({ data: { search, role, status, page, pageSize: PAGE_SIZE } }),
  });

  const removeUser = useMutation({
    mutationFn: (userId: string) => deleteUser({ data: { userId } }),
    onSuccess: async () => {
      toast.success("User deleted");
      setDeleting(null);
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error: Error) => toast.error("Could not delete user", error.message),
  });

  const columns: Column<UserRow>[] = [
    {
      key: "name",
      header: "User",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.full_name ?? "Unnamed"}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      key: "roles",
      header: "Roles",
      hideOnMobile: true,
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.length === 0 ? (
            <span className="text-xs text-muted-foreground">—</span>
          ) : (
            row.roles.map((entry) => (
              <Badge key={entry} variant="secondary" className="text-[10px] uppercase">
                {entry.replace("_", " ")}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      hideOnMobile: true,
      cell: (row) => (
        <Badge variant={row.status === "active" ? "default" : "outline"}>{row.status}</Badge>
      ),
    },
    {
      key: "created_at",
      header: "Joined",
      hideOnMobile: true,
      cell: (row) => new Date(row.created_at).toLocaleDateString("en-IN"),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (row) =>
        isAdmin ? (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => setEditing(row)} aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleting(row)}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">View only</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Search accounts, manage roles and control access."
        actions={
          isAdmin ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New user
            </Button>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          className="sm:max-w-xs"
        />
        <Select
          value={role}
          onValueChange={(value) => {
            setPage(1);
            setRole(value);
          }}
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {(rolesQuery.data ?? []).map((entry) => (
              <SelectItem key={entry.key} value={entry.key}>
                {entry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(value) => {
            setPage(1);
            setStatus(value);
          }}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {usersQuery.isLoading ? (
        <TableSkeleton rows={PAGE_SIZE} columns={5} />
      ) : usersQuery.isError ? (
        <p className="text-sm text-destructive">{(usersQuery.error as Error).message}</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={(usersQuery.data?.users ?? []) as unknown as UserRow[]}
            rowKey={(row) => row.id}
            emptyMessage="No users match these filters."
          />
          <TablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={usersQuery.data?.total ?? 0}
            onPageChange={setPage}
          />
        </>
      )}

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        roles={(rolesQuery.data ?? []).map((entry) => ({ key: entry.key, name: entry.name }))}
      />
      <EditUserDialog
        user={editing}
        onClose={() => setEditing(null)}
        roles={(rolesQuery.data ?? []).map((entry) => ({ key: entry.key, name: entry.name }))}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this user?"
        description={`${deleting?.email ?? "This account"} will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete user"
        onConfirm={() => {
          if (deleting) removeUser.mutate(deleting.id);
        }}
      />
    </div>
  );
}

interface RoleOption {
  key: string;
  name: string;
}

function CreateUserDialog({
  open,
  onOpenChange,
  roles,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: RoleOption[];
}) {
  const queryClient = useQueryClient();
  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { fullName: "", email: "", password: "", role: "user", status: "active" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createUser({ data: values });
      toast.success("User created");
      form.reset();
      onOpenChange(false);
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    } catch (error) {
      toast.error("Could not create user", error instanceof Error ? error.message : undefined);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New user</DialogTitle>
          <DialogDescription>
            The account is created verified and can sign in immediately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="create-name">Full name</Label>
            <Input id="create-name" {...form.register("fullName")} />
            <FieldError message={form.formState.errors.fullName?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-email">Email</Label>
            <Input id="create-email" type="email" {...form.register("email")} />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-password">Temporary password</Label>
            <Input id="create-password" type="password" {...form.register("password")} />
            <FieldError message={form.formState.errors.password?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.watch("role")}
                onValueChange={(value) =>
                  form.setValue("role", value as CreateUserValues["role"], { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((entry) => (
                    <SelectItem key={entry.key} value={entry.key}>
                      {entry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) =>
                  form.setValue("status", value as CreateUserValues["status"], {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create user"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({
  user,
  onClose,
  roles,
}: {
  user: UserRow | null;
  onClose: () => void;
  roles: RoleOption[];
}) {
  const queryClient = useQueryClient();
  const form = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      userId: "",
      fullName: "",
      phone: "",
      language: "en",
      timezone: "Asia/Kolkata",
      status: "active",
      role: "user",
    },
  });

  React.useEffect(() => {
    if (!user) return;
    form.reset({
      userId: user.id,
      fullName: user.full_name ?? "",
      phone: user.phone ?? "",
      language: user.language,
      timezone: user.timezone,
      status: user.status,
      role: (user.roles[0] ?? "user") as UpdateUserValues["role"],
    });
  }, [user, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateUser({ data: values });
      toast.success("User updated");
      onClose();
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    } catch (error) {
      toast.error("Could not update user", error instanceof Error ? error.message : undefined);
    }
  });

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>Update profile details, status and role.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="edit-name">Full name</Label>
            <Input id="edit-name" {...form.register("fullName")} />
            <FieldError message={form.formState.errors.fullName?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" {...form.register("phone")} />
              <FieldError message={form.formState.errors.phone?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-timezone">Timezone</Label>
              <Input id="edit-timezone" {...form.register("timezone")} />
              <FieldError message={form.formState.errors.timezone?.message} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.watch("role")}
                onValueChange={(value) =>
                  form.setValue("role", value as UpdateUserValues["role"], { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((entry) => (
                    <SelectItem key={entry.key} value={entry.key}>
                      {entry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) =>
                  form.setValue("status", value as UpdateUserValues["status"], {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save changes"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}