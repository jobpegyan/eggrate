import { createFileRoute } from '@tanstack/react-router';
import { useMarketInsight, useAIUsageStats } from '@/services/ai-analysis.queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BrainCircuit, 
  Activity, 
  Settings, 
  DollarSign, 
  CheckCircle2, 
  XCircle,
  Database,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_authenticated/admin/ai')({
  component: AdminAIDashboard
});

function AdminAIDashboard() {
  const { data: stats, isLoading: statsLoading } = useAIUsageStats();
  const { data: latestInsight } = useMarketInsight('daily_summary', 'national');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">AI Market Analysis Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">Monitor AI generation health, token usage, and insights quality.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.reduce((acc, s) => acc + s.requestCount, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all models</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="size-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.length ? Math.round((stats.reduce((acc, s) => acc + s.successCount, 0) / stats.reduce((acc, s) => acc + s.requestCount, 0)) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Operational health</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.reduce((acc, s) => acc + s.estimatedCost, 0).toFixed(4) || "0.0000"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current billing cycle</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Database className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.reduce((acc, s) => acc + s.totalTokens, 0) || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ingested & Generated</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              Provider Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats?.map((s) => (
                <div key={s.model} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold">{s.model}</span>
                    <span className="text-muted-foreground text-xs">{s.successCount}/{s.requestCount} OK</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(s.successCount / s.requestCount) * 100}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                    <span>${s.estimatedCost.toFixed(5)}</span>
                    <span>{s.totalTokens.toLocaleString()} tokens</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="size-5" />
              Latest Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestInsight ? (
              <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">{latestInsight.title}</h4>
                  <Badge variant="outline" className="text-[10px]">{latestInsight.confidence.toUpperCase()}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">{latestInsight.summary || latestInsight.content}</p>
                <div className="flex items-center justify-between text-[10px] pt-2 border-t">
                  <span>{new Date(latestInsight.analysisDate).toLocaleDateString()}</span>
                  <span className="text-success font-bold uppercase">Published</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No national insight generated yet.</p>
            )}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3">AI Settings</h4>
              <div className="grid gap-2">
                <div className="flex items-center justify-between p-2 rounded border text-xs bg-card">
                  <span>Default Model</span>
                  <span className="font-bold">DeepSeek Chat</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded border text-xs bg-card">
                  <span>Failover</span>
                  <span className="text-success font-bold flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Enabled
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
