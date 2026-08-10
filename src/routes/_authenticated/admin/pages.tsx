import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/common/skeletons";
import { DataTable, type Column } from "@/components/data/data-table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";
import { formatDateTime } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/admin/pages")({
  component: PagesAdmin,
});

interface PageRow {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  updated_at: string;
}

function PagesAdmin() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", "pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("id, slug, title, is_published, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as PageRow[];
    },
  });

  const togglePublish = useMutation({
    mutationFn: async (row: PageRow) => {
      const { error } = await supabase
        .from("pages")
        .update({ is_published: !row.is_published })
        .eq("id", row.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      toast.success("Page updated");
      await queryClient.invalidateQueries({ queryKey: ["admin", "pages"] });
    },
    onError: (error: Error) => toast.error("Could not update page", error.message),
  });

  const columns: Column<PageRow>[] = [
    {
      key: "title",
      header: "Page",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          <p className="text-xs text-muted-foreground">/{row.slug}</p>
        </div>
      ),
    },
    {
      key: "is_published",
      header: "Status",
      hideOnMobile: true,
      cell: (row) => (
        <Badge variant={row.is_published ? "secondary" : "outline"}>
          {row.is_published ? "published" : "draft"}
        </Badge>
      ),
    },
    {
      key: "updated_at",
      header: "Updated",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{formatDateTime(row.updated_at)}</span>
      ),
    },
    {
      key: "publish",
      header: "Published",
      align: "right",
      cell: (row) => (
        <Switch
          checked={row.is_published}
          onCheckedChange={() => togglePublish.mutate(row)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pages"
        description="Static content pages served from the database."
      />
      {query.isLoading ? (
        <TableSkeleton rows={5} columns={4} />
      ) : (
        <DataTable
          columns={columns}
          rows={query.data ?? []}
          rowKey={(row) => row.id}
          emptyMessage="No pages created yet."
        />
      )}
    </div>
  );
}