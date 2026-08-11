import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  CheckCircle2, 
  Code2, 
  Eye, 
  Globe, 
  Loader2, 
  Pencil, 
  Play, 
  Plus, 
  RefreshCcw, 
  ShieldCheck, 
  Sparkles, 
  Wand2 
} from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { BoolBadge, StatusBadge } from "@/components/admin/status-badge";
import { TableSkeleton } from "@/components/common/skeletons";
import { DataTable, type Column } from "@/components/data/data-table";
import { FieldError } from "@/components/forms/field-error";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { dataSourceSchema, type DataSourceValues } from "@/lib/rate-schemas";
import { toast } from "@/lib/toast";
import { listSources, saveSource, type DataSourceRow } from "@/services/rates-admin";
import { autoDetectSource, testConnector, runConnectorNow } from "@/services/connector.functions";

export const Route = createFileRoute("/_authenticated/admin/sources")({
  component: SourcesPage,
});

const EMPTY: DataSourceValues = {
  key: "",
  name: "",
  kind: "manual",
  url: "",
  description: "",
  isTrusted: true,
  status: "active",
};

function SourcesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<DataSourceRow | null>(null);

  // Connector testing state
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [detectionResult, setDetectionResult] = React.useState<any>(null);
  const [isTesting, setIsTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<any>(null);
  const [isRunningNow, setIsRunningNow] = React.useState(false);

  const query = useQuery({ queryKey: ["admin", "sources"], queryFn: listSources });
  const form = useForm<DataSourceValues>({
    resolver: zodResolver(dataSourceSchema),
    defaultValues: EMPTY,
  });

  const save = useMutation({
    mutationFn: (values: DataSourceValues) => saveSource(values, editing?.id),
    onSuccess: async () => {
      toast.success(editing ? "Source updated" : "Source created");
      setOpen(false);
      setEditing(null);
      setDetectionResult(null);
      setTestResult(null);
      form.reset(EMPTY);
      await queryClient.invalidateQueries({ queryKey: ["admin", "sources"] });
    },
    onError: (error: Error) => toast.error("Could not save source", error.message),
  });

  function openEdit(row: DataSourceRow) {
    setEditing(row);
    setDetectionResult(null);
    setTestResult(null);
    form.reset({
      key: row.key,
      name: row.name,
      kind: row.kind,
      url: row.url ?? "",
      description: row.description ?? "",
      isTrusted: row.is_trusted,
      status: row.status,
    });
    setOpen(true);
  }

  async function handleAutoDetect() {
    const url = form.getValues("url");
    if (!url) {
      toast.error("Enter a Website URL first to run auto-detection.");
      return;
    }

    setIsDetecting(true);
    try {
      const res = await autoDetectSource({ data: { url } });
      setDetectionResult(res);

      if (res.detectedKind) {
        form.setValue("kind", res.detectedKind as any);
      }

      if (res.isWordPress) {
        toast.success("WordPress REST API Detected!", res.note);
      } else {
        toast.info("Source Auto-Detected", res.note);
      }
    } catch (err: any) {
      toast.error(`Auto detection failed: ${err.message}`);
    } finally {
      setIsDetecting(false);
    }
  }

  async function handleTestSource() {
    const url = form.getValues("url");
    const kind = form.getValues("kind");

    if (!url) {
      toast.error("Enter an Endpoint URL to test.");
      return;
    }

    setIsTesting(true);
    try {
      const res = await testConnector({
        data: {
          url,
          kind: kind as any,
          isEggRateMode: true,
        },
      });
      setTestResult(res);
      if (res.success) {
        toast.success(`Test Connection Successful! Parsed ${res.validCount} valid record(s).`);
      } else {
        toast.error(`Test Connection Notice: ${res.validationErrors?.[0] || "No valid records parsed."}`);
      }
    } catch (err: any) {
      toast.error(`Test failed: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  }

  async function handleRunNow(row: DataSourceRow) {
    if (!row.url) {
      toast.error("This source does not have an Endpoint URL configured.");
      return;
    }

    setIsRunningNow(true);
    toast.info(`Running connector fetch for ${row.name}...`);

    try {
      const res = await runConnectorNow({
        data: {
          sourceId: row.id,
          url: row.url,
          kind: row.kind as any,
          isEggRateMode: true,
        },
      });

      toast.success(`Run completed! Imported ${res.validCount} records.`);
      await queryClient.invalidateQueries({ queryKey: ["admin", "sources"] });
    } catch (err: any) {
      toast.error(`Run failed: ${err.message}`);
    } finally {
      setIsRunningNow(false);
    }
  }

  const columns: Column<DataSourceRow>[] = [
    {
      key: "name",
      header: "Source",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.key}</p>
        </div>
      ),
    },
    { key: "kind", header: "Channel", cell: (row) => <Badge variant="outline">{row.kind}</Badge> },
    {
      key: "url",
      header: "Endpoint",
      hideOnMobile: true,
      cell: (row) => <span className="line-clamp-1 text-xs">{row.url ?? "—"}</span>,
    },
    {
      key: "trusted",
      header: "Trusted",
      align: "center",
      cell: (row) => <BoolBadge value={row.is_trusted} yes="Trusted" no="Unverified" />,
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRunNow(row)}
            disabled={isRunningNow}
            title="Run Connector Now"
          >
            <Play className="h-3.5 w-3.5 text-primary" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data sources & Connectors"
        description="Generic website connectors — WordPress REST API, JSON, RSS/Atom, HTML Extractors, CSV, and Custom APIs."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setDetectionResult(null);
              setTestResult(null);
              form.reset(EMPTY);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New source
          </Button>
        }
      />

      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          Generic Website Connectors allow pulling public egg rate data directly from permitted websites, WordPress REST APIs (<code className="font-mono text-xs">/wp-json/</code>), feeds, or HTML pages with full field mapping and transformations.
        </p>
      </div>

      {query.isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : (
        <DataTable
          columns={columns}
          rows={query.data ?? []}
          rowKey={(row) => row.id}
          emptyMessage="No sources configured yet."
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Data Source Connector" : "New Data Source Connector"}</DialogTitle>
            <DialogDescription>Configure website connection, auto-detection, field mappings, and test endpoints.</DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            noValidate
            onSubmit={form.handleSubmit((values) => save.mutate(values))}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="source-name">Name</Label>
                <Input id="source-name" placeholder="NECC Mandi Feed" {...form.register("name")} />
                <FieldError message={form.formState.errors.name?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source-key">Key</Label>
                <Input id="source-key" placeholder="necc_mandi" {...form.register("key")} />
                <FieldError message={form.formState.errors.key?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="source-url">Website / Endpoint URL</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary"
                  onClick={handleAutoDetect}
                  disabled={isDetecting}
                >
                  {isDetecting ? <Loader2 className="mr-1.5 size-3 animate-spin" /> : <Sparkles className="mr-1.5 size-3" />}
                  Auto Detect
                </Button>
              </div>
              <Input
                id="source-url"
                placeholder="https://example.com or https://www.egg-rate.today/api/cron/update-rates"
                {...form.register("url")}
              />
              <FieldError message={form.formState.errors.url?.message} />
            </div>

            {detectionResult ? (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <Wand2 className="size-3.5" />
                  Auto Detection Result: <Badge variant="outline">{detectionResult.detectedKind}</Badge>
                </div>
                <p className="mt-1 text-muted-foreground">{detectionResult.note}</p>
                {detectionResult.availableFields?.length ? (
                  <p className="mt-1 text-[11px]">Discovered fields: {detectionResult.availableFields.slice(0, 8).join(", ")}...</p>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Source Type / Channel</Label>
                <Select
                  value={form.watch("kind")}
                  onValueChange={(value) => form.setValue("kind", value as DataSourceValues["kind"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual entry</SelectItem>
                    <SelectItem value="wordpress">WordPress REST API (/wp-json/)</SelectItem>
                    <SelectItem value="api">REST API</SelectItem>
                    <SelectItem value="json">JSON Endpoint</SelectItem>
                    <SelectItem value="rss">RSS / Atom Feed</SelectItem>
                    <SelectItem value="html">HTML Extractor</SelectItem>
                    <SelectItem value="csv">CSV upload</SelectItem>
                    <SelectItem value="excel">Excel upload</SelectItem>
                    <SelectItem value="cron">Cron job</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value) => form.setValue("status", value as DataSourceValues["status"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source-desc">Description</Label>
              <Textarea id="source-desc" rows={2} placeholder="Optional notes or source attribution details..." {...form.register("description")} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="source-trusted">Trusted source</Label>
                <p className="text-[11px] text-muted-foreground">Auto-approve rates published by this connector</p>
              </div>
              <Switch
                id="source-trusted"
                checked={form.watch("isTrusted")}
                onCheckedChange={(checked) => form.setValue("isTrusted", checked)}
              />
            </div>

            {/* Test Connection Button & Sample Data Preview */}
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleTestSource}
                disabled={isTesting}
              >
                {isTesting ? <Loader2 className="mr-2 size-3.5 animate-spin" /> : <Eye className="mr-2 size-3.5" />}
                Test Source Connection & Preview Data
              </Button>
            </div>

            {testResult ? (
              <Tabs defaultValue="mapped" className="mt-3">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="mapped">Mapped Data ({testResult.validCount})</TabsTrigger>
                  <TabsTrigger value="parsed">Parsed ({testResult.fetchedCount})</TabsTrigger>
                  <TabsTrigger value="raw">Raw Sample</TabsTrigger>
                </TabsList>
                <TabsContent value="mapped" className="mt-2 space-y-2">
                  <pre className="max-h-40 overflow-y-auto rounded-lg bg-muted p-3 text-[11px] font-mono">
                    {JSON.stringify(testResult.mappedRecords, null, 2)}
                  </pre>
                </TabsContent>
                <TabsContent value="parsed" className="mt-2 space-y-2">
                  <pre className="max-h-40 overflow-y-auto rounded-lg bg-muted p-3 text-[11px] font-mono">
                    {JSON.stringify(testResult.parsedRecords, null, 2)}
                  </pre>
                </TabsContent>
                <TabsContent value="raw" className="mt-2 space-y-2">
                  <pre className="max-h-40 overflow-y-auto rounded-lg bg-muted p-3 text-[11px] font-mono">
                    {JSON.stringify(testResult.rawSample, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            ) : null}

            <Button type="submit" className="w-full mt-4" disabled={save.isPending}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Connector Source"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
