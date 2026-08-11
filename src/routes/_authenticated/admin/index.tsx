import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Activity, 
  Settings, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCcw 
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getAutomationAuditLogs, 
  getSourceHealth, 
  triggerSyncPipeline 
} from "@/services/automation.functions";

export const Route = createFileRoute('/_authenticated/admin/')({
  ssr: false,
  component: AdminDashboard,
});

function AdminDashboard() {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: health, isLoading: loadingHealth } = useQuery({
    queryKey: ['sourceHealth'],
    queryFn: () => getSourceHealth(),
  });

  const { data: logsData, isLoading: loadingLogs } = useQuery({
    queryKey: ['automationLogs'],
    queryFn: () => getAutomationAuditLogs({ data: { limit: 5, offset: 0 } }),
  });

  async function handleRunNow() {
    setIsSyncing(true);
    toast.info("Running egg rate update pipeline...");
    try {
      const result = await triggerSyncPipeline();
      await queryClient.invalidateQueries({ queryKey: ['sourceHealth'] });
      await queryClient.invalidateQueries({ queryKey: ['automationLogs'] });
      toast.success(`Pipeline executed successfully! Coverage: ${result.coveragePercent}%`);
    } catch (err: any) {
      toast.error(`Pipeline run failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
        <p className="text-muted-foreground">
          Manage India's fastest egg rate data collection engine.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active collectors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Stable</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Price anomalies detected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Coverage</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">+2% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Source Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {health?.map((source) => (
                <div key={source.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{source.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{source.kind}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-right space-y-0.5 sm:space-y-1">
                      <p className="text-xs sm:text-sm font-medium">{source.successRate}%</p>
                      <p className="hidden sm:block text-[10px] text-muted-foreground">Success Rate</p>
                    </div>
                    <Badge variant={source.status === 'active' ? 'outline' : 'secondary'}>
                      {source.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {!health?.length && <p className="text-sm text-muted-foreground italic">No sources configured yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Logs</CardTitle>
            <Button variant="ghost" size="icon">
              <Clock className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logsData?.logs?.map((log) => (
                <div key={log.id} className="flex flex-col gap-1 border-l-2 border-primary/20 pl-4 py-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold capitalize">{log.action.replace('_', ' ')}</span>
                    <Badge variant={log.status === 'success' ? 'secondary' : 'destructive'} className="text-[10px]">
                      {log.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.created_at || new Date()), 'HH:mm:ss')}
                  </span>
                </div>
              ))}
              {!logsData?.logs?.length && <p className="text-sm text-muted-foreground italic">No logs found.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <Button variant="outline" className="gap-2" asChild>
          <Link to="/admin/settings">
            <Settings className="h-4 w-4" />
            Automation Settings
          </Link>
        </Button>
        <Button className="gap-2" disabled={isSyncing} onClick={handleRunNow}>
          <RefreshCcw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Running..." : "Run Now"}
        </Button>
      </div>
    </div>
  );
}
