import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm, type SettingField } from "@/components/admin/settings-form";
import { TextSkeleton } from "@/components/common/skeletons";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  component: SeoSettingsPage,
});

function SeoSettingsPage() {
  const queryClient = useQueryClient();

  const seoSettings = useQuery({
    queryKey: ["admin", "seo-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("seo_settings").select("*").order("sort_order");
      if (error) throw new Error(error.message);
      return (data ?? []).map<SettingField>((row) => ({
        key: row.key,
        label: row.label,
        group_name: row.group_name,
        input_type: row.input_type,
        sort_order: row.sort_order,
        value: row.value ?? "",
      }));
    },
  });

  const templates = useQuery({
    queryKey: ["admin", "seo-templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("seo_templates" as any).select("*").order("created_at");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const redirects = useQuery({
    queryKey: ["admin", "seo-redirects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("seo_redirects" as any).select("*").order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const saveSettings = useMutation({
    mutationFn: async (changes: Record<string, string>) => {
      for (const [key, value] of Object.entries(changes)) {
        const { error } = await supabase.from("seo_settings").update({ value }).eq("key", key);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("SEO settings saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "seo-settings"] });
    },
  });

  const saveTemplate = useMutation({
    mutationFn: async (template: any) => {
      const { error } = await supabase.from("seo_templates" as any).upsert(template);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("SEO template saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "seo-templates"] });
    },
  });

  const deleteRedirect = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("seo_redirects" as any).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Redirect deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "seo-redirects"] });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="SEO Management"
        description="Global settings, title templates, and URL redirects."
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="redirects">Redirects</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Metadata & Robots</CardTitle>
            </CardHeader>
            <CardContent>
              {seoSettings.isLoading ? (
                <TextSkeleton lines={8} />
              ) : (
                <SettingsForm
                  fields={seoSettings.data ?? []}
                  saving={saveSettings.isPending}
                  onSave={(changes) => saveSettings.mutateAsync(changes)}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {templates.data?.map((tpl: any) => (
              <TemplateCard key={tpl.id} template={tpl} onSave={(t) => saveTemplate.mutate(t)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="redirects" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>URL Redirects</CardTitle>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Redirect
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto border rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted">
                    <tr>
                      <th className="px-4 py-3">Old URL</th>
                      <th className="px-4 py-3">New URL</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redirects.data?.map((r: any) => (
                      <tr key={r.id} className="border-t hover:bg-accent/50">
                        <td className="px-4 py-3 font-mono text-xs">{r.old_url}</td>
                        <td className="px-4 py-3 font-mono text-xs">{r.new_url}</td>
                        <td className="px-4 py-3">{r.status_code}</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="icon" onClick={() => deleteRedirect.mutate(r.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TemplateCard({ template, onSave }: { template: any; onSave: (t: any) => void }) {
  const [data, setData] = useState(template);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg capitalize">{template.page_type} Template</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Title Template</Label>
          <Input 
            value={data.title_template} 
            onChange={e => setData({...data, title_template: e.target.value})}
          />
          <p className="text-[10px] text-muted-foreground">Variables: {template.page_type === 'city' ? '{city}, {state}, {date}, {rate}' : '{state}, {date}'}</p>
        </div>
        <div className="space-y-2">
          <Label>Description Template</Label>
          <Textarea 
            value={data.description_template}
            onChange={e => setData({...data, description_template: e.target.value})}
          />
        </div>
        <Button size="sm" onClick={() => onSave(data)}>
          <Save className="w-4 h-4 mr-2" />
          Update {template.page_type}
        </Button>
      </CardContent>
    </Card>
  );
}
