import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { FieldError } from "@/components/forms/field-error";
import { TableSkeleton } from "@/components/common/skeletons";
import { DataTable, type Column } from "@/components/data/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/lib/toast";
import { announcementSchema, type AnnouncementValues } from "@/lib/validation";

export const Route = createFileRoute("/_authenticated/admin/announcements")({
  component: AnnouncementsPage,
});

interface AnnouncementRow {
  id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
  is_active: boolean;
  created_at: string;
}

function AnnouncementsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<AnnouncementRow | null>(null);

  const query = useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as AnnouncementRow[];
    },
  });

  const form = useForm<AnnouncementValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { title: "", message: "", type: "info", isActive: true },
  });

  const create = useMutation({
    mutationFn: async (values: AnnouncementValues) => {
      const { error } = await supabase.from("announcements").insert({
        title: values.title,
        message: values.message,
        type: values.type,
        is_active: values.isActive,
        created_by: user?.id ?? null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      toast.success("Announcement published");
      form.reset();
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
    onError: (error: Error) => toast.error("Could not save announcement", error.message),
  });

  const toggle = useMutation({
    mutationFn: async (row: AnnouncementRow) => {
      const { error } = await supabase
        .from("announcements")
        .update({ is_active: !row.is_active })
        .eq("id", row.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] }),
    onError: (error: Error) => toast.error("Could not update announcement", error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      toast.success("Announcement deleted");
      setDeleting(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
    onError: (error: Error) => toast.error("Could not delete announcement", error.message),
  });

  const columns: Column<AnnouncementRow>[] = [
    {
      key: "title",
      header: "Announcement",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{row.message}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      hideOnMobile: true,
      cell: (row) => <Badge variant="outline">{row.type}</Badge>,
    },
    {
      key: "is_active",
      header: "Live",
      align: "center",
      cell: (row) => (
        <Switch checked={row.is_active} onCheckedChange={() => toggle.mutate(row)} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <Button variant="ghost" size="icon" onClick={() => setDeleting(row)} aria-label="Delete">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Site-wide messages shown to visitors and signed-in users."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New announcement
          </Button>
        }
      />

      {query.isLoading ? (
        <TableSkeleton rows={5} columns={4} />
      ) : (
        <DataTable
          columns={columns}
          rows={query.data ?? []}
          rowKey={(row) => row.id}
          emptyMessage="No announcements yet."
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New announcement</DialogTitle>
            <DialogDescription>Publish a message to everyone on the site.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            noValidate
            onSubmit={form.handleSubmit((values) => create.mutate(values))}
          >
            <div className="space-y-2">
              <Label htmlFor="announcement-title">Title</Label>
              <Input id="announcement-title" {...form.register("title")} />
              <FieldError message={form.formState.errors.title?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-message">Message</Label>
              <Textarea id="announcement-message" rows={4} {...form.register("message")} />
              <FieldError message={form.formState.errors.message?.message} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(value) =>
                    form.setValue("type", value as AnnouncementValues["type"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-active">Publish immediately</Label>
                <div className="flex h-10 items-center">
                  <Switch
                    id="announcement-active"
                    checked={form.watch("isActive")}
                    onCheckedChange={(checked) => form.setValue("isActive", checked)}
                  />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={create.isPending}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(next) => !next && setDeleting(null)}
        title="Delete this announcement?"
        description="It will be removed from the site immediately."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleting) remove.mutate(deleting.id);
        }}
      />
    </div>
  );
}