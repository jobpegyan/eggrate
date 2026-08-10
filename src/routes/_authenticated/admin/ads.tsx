import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  Code2,
  Loader2,
  Layout,
  Search,
} from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { FieldError } from "@/components/forms/field-error";
import { TableSkeleton } from "@/components/common/skeletons";
import { DataTable, type Column } from "@/components/data/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";
import { adSlotSchema, type AdSlotValues } from "@/lib/validation";

export const Route = createFileRoute("/_authenticated/admin/ads")({
  component: AdManagementPage,
});

interface AdSlotRow {
  id: string;
  position: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  code: string | null;
  created_at: string;
  updated_at: string;
}

function AdManagementPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editingSlot, setEditingSlot] = React.useState<AdSlotRow | null>(null);
  const [previewSlot, setPreviewSlot] = React.useState<AdSlotRow | null>(null);
  const [deletingSlot, setDeletingSlot] = React.useState<AdSlotRow | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Fetch ad slots from Supabase
  const query = useQuery({
    queryKey: ["admin", "ad_slots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_slots")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw new Error(error.message);
      return data as AdSlotRow[];
    },
  });

  const slots = query.data ?? [];
  const filteredSlots = React.useMemo(() => {
    if (!searchTerm.trim()) return slots;
    const term = searchTerm.toLowerCase();
    return slots.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.position.toLowerCase().includes(term) ||
        (s.description ?? "").toLowerCase().includes(term)
    );
  }, [slots, searchTerm]);

  const activeCount = slots.filter((s) => s.is_enabled).length;
  const configuredCount = slots.filter((s) => Boolean(s.code && s.code.trim().length > 0)).length;

  // Form for creating/editing ad slots
  const form = useForm<AdSlotValues>({
    resolver: zodResolver(adSlotSchema),
    defaultValues: {
      position: "",
      name: "",
      description: "",
      isEnabled: true,
      code: "",
    },
  });

  // Populate form when editing an existing slot
  React.useEffect(() => {
    if (editingSlot) {
      form.reset({
        position: editingSlot.position,
        name: editingSlot.name,
        description: editingSlot.description ?? "",
        isEnabled: editingSlot.is_enabled,
        code: editingSlot.code ?? "",
      });
    } else {
      form.reset({
        position: "",
        name: "",
        description: "",
        isEnabled: true,
        code: "",
      });
    }
  }, [editingSlot, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: AdSlotValues) => {
      const { error } = await supabase.from("ad_slots").insert({
        position: values.position.trim().toLowerCase().replace(/\s+/g, "_"),
        name: values.name.trim(),
        description: values.description?.trim() || null,
        is_enabled: values.isEnabled,
        code: values.code?.trim() || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      toast.success("Ad Slot Created", "New ad placement slot has been registered.");
      form.reset();
      setCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin", "ad_slots"] });
    },
    onError: (error: Error) => toast.error("Could not create ad slot", error.message),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: AdSlotValues) => {
      if (!editingSlot) return;
      const { error } = await supabase
        .from("ad_slots")
        .update({
          position: values.position.trim().toLowerCase().replace(/\s+/g, "_"),
          name: values.name.trim(),
          description: values.description?.trim() || null,
          is_enabled: values.isEnabled,
          code: values.code?.trim() || null,
        })
        .eq("id", editingSlot.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      toast.success("Ad Slot Saved", "Changes have been updated successfully.");
      setEditingSlot(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "ad_slots"] });
    },
    onError: (error: Error) => toast.error("Could not save ad slot", error.message),
  });

  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: async (row: AdSlotRow) => {
      const { error } = await supabase
        .from("ad_slots")
        .update({ is_enabled: !row.is_enabled })
        .eq("id", row.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async (_, row) => {
      toast.success(
        row.is_enabled ? "Ad Slot Disabled" : "Ad Slot Enabled",
        `Placement "${row.name}" is now ${row.is_enabled ? "inactive" : "active"}.`
      );
      await queryClient.invalidateQueries({ queryKey: ["admin", "ad_slots"] });
    },
    onError: (error: Error) => toast.error("Could not toggle ad slot", error.message),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ad_slots").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      toast.success("Ad Slot Deleted");
      setDeletingSlot(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "ad_slots"] });
    },
    onError: (error: Error) => toast.error("Could not delete ad slot", error.message),
  });

  const columns: Column<AdSlotRow>[] = [
    {
      key: "position",
      header: "Position Key",
      cell: (row) => (
        <div className="space-y-1">
          <Badge variant="outline" className="font-mono text-xs bg-muted/50 border-primary/20 text-primary">
            {row.position}
          </Badge>
        </div>
      ),
    },
    {
      key: "name",
      header: "Placement Name",
      cell: (row) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-foreground text-sm">{row.name}</p>
          {row.description ? (
            <p className="text-xs text-muted-foreground line-clamp-1">{row.description}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "code",
      header: "Ad Code Snippet",
      cell: (row) => {
        const hasCode = Boolean(row.code && row.code.trim().length > 0);
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={hasCode ? "default" : "secondary"}
              className={hasCode ? "bg-blue-500/10 text-blue-700 border-blue-500/30" : "text-muted-foreground"}
            >
              <Code2 className="size-3 mr-1" />
              {hasCode ? "Configured" : "Empty"}
            </Badge>
            {hasCode ? (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={() => setPreviewSlot(row)}
                title="Preview Ad Code"
              >
                <Eye className="size-3.5" />
              </Button>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "is_enabled",
      header: "Status",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.is_enabled}
            disabled={toggleMutation.isPending}
            onCheckedChange={() => toggleMutation.mutate(row)}
            aria-label={`Toggle ${row.name}`}
          />
          <span className="text-xs font-medium text-muted-foreground">
            {row.is_enabled ? "Active" : "Disabled"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setEditingSlot(row)}
            title="Edit Ad Slot"
          >
            <Edit2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:bg-destructive/10"
            onClick={() => setDeletingSlot(row)}
            title="Delete Ad Slot"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ad Management"
        description="Manage website banner ad placements, Google AdSense code snippets, and toggle ad slot availability."
        actions={
          <Button onClick={() => setCreateOpen(true)} className="rounded-full shadow-sm">
            <Plus className="size-4 mr-2" /> New Ad Slot
          </Button>
        }
      />

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/80 bg-card/60 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Placements
            </CardTitle>
            <Layout className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{slots.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered ad unit slots</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Units
            </CardTitle>
            <CheckCircle2 className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-green-600">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently serving on website</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Code Configured
            </CardTitle>
            <Code2 className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-blue-600">{configuredCount}</div>
            <p className="text-xs text-muted-foreground mt-1">With custom HTML / AdSense scripts</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search ad slots by name or key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Main Data Table */}
      {query.isLoading ? (
        <TableSkeleton rows={6} columns={5} />
      ) : query.isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm">
          <p className="font-semibold text-destructive">Failed to load ad slots</p>
          <p className="text-xs text-muted-foreground mt-1">{query.error?.message}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => query.refetch()}>
            Retry Loading
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filteredSlots}
          rowKey={(row) => row.id}
          emptyMessage="No ad slots found."
        />
      )}

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="size-5 text-primary" /> Create Ad Slot Placement
            </DialogTitle>
            <DialogDescription>
              Register a new ad slot position and configure its HTML/AdSense code snippet.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-4 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="create-position">Position Key *</Label>
              <Input
                id="create-position"
                placeholder="e.g. header_banner, sidebar_desktop, below_hero"
                {...form.register("position")}
              />
              <p className="text-[11px] text-muted-foreground">Unique identifier used in frontend code.</p>
              <FieldError message={form.formState.errors.position?.message} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-name">Display Name *</Label>
              <Input
                id="create-name"
                placeholder="e.g. Header Leaderboard Banner"
                {...form.register("name")}
              />
              <FieldError message={form.formState.errors.name?.message} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-description">Description</Label>
              <Input
                id="create-description"
                placeholder="e.g. Top banner displayed right under header"
                {...form.register("description")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-code">Ad Code Snippet (HTML / JS / AdSense)</Label>
              <Textarea
                id="create-code"
                rows={5}
                className="font-mono text-xs"
                placeholder={`<ins className="adsbygoogle" ...></ins>`}
                {...form.register("code")}
              />
              <FieldError message={form.formState.errors.code?.message} />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-0.5">
                <Label htmlFor="create-isEnabled">Enable Placement Immediately</Label>
                <p className="text-xs text-muted-foreground">If disabled, this ad slot will not render on live pages.</p>
              </div>
              <Switch
                id="create-isEnabled"
                checked={form.watch("isEnabled")}
                onCheckedChange={(checked) => form.setValue("isEnabled", checked)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                Create Ad Slot
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={Boolean(editingSlot)} onOpenChange={(o) => !o && setEditingSlot(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="size-5 text-primary" /> Edit Ad Slot: {editingSlot?.name}
            </DialogTitle>
            <DialogDescription>
              Update placement name, description, code snippet or toggle status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit((v) => updateMutation.mutate(v))} className="space-y-4 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-position">Position Key *</Label>
              <Input
                id="edit-position"
                disabled
                className="bg-muted font-mono"
                {...form.register("position")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-name">Display Name *</Label>
              <Input id="edit-name" {...form.register("name")} />
              <FieldError message={form.formState.errors.name?.message} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input id="edit-description" {...form.register("description")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-code">Ad Code Snippet (HTML / JS / AdSense)</Label>
              <Textarea
                id="edit-code"
                rows={6}
                className="font-mono text-xs"
                placeholder={`Paste your Google AdSense code or HTML snippet here...`}
                {...form.register("code")}
              />
              <FieldError message={form.formState.errors.code?.message} />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-0.5">
                <Label htmlFor="edit-isEnabled">Placement Enabled</Label>
                <p className="text-xs text-muted-foreground">Controls live serving on website.</p>
              </div>
              <Switch
                id="edit-isEnabled"
                checked={form.watch("isEnabled")}
                onCheckedChange={(checked) => form.setValue("isEnabled", checked)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingSlot(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Code Preview Modal */}
      <Dialog open={Boolean(previewSlot)} onOpenChange={(o) => !o && setPreviewSlot(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="size-5 text-blue-500" /> Ad Code Preview: {previewSlot?.name}
            </DialogTitle>
            <DialogDescription>
              Raw code snippet configured for position key <span className="font-mono font-bold text-foreground">{previewSlot?.position}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border">
              <pre className="whitespace-pre-wrap break-all">{previewSlot?.code ?? "// No code snippet configured"}</pre>
            </div>

            <div className="flex items-center justify-end">
              <Button variant="outline" onClick={() => setPreviewSlot(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deletingSlot)}
        title="Delete Ad Slot Placement?"
        description={`Are you sure you want to delete "${deletingSlot?.name}" (${deletingSlot?.position})? This action cannot be undone.`}
        confirmLabel="Delete Ad Slot"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => deletingSlot && deleteMutation.mutate(deletingSlot.id)}
        onCancel={() => setDeletingSlot(null)}
      />
    </div>
  );
}
