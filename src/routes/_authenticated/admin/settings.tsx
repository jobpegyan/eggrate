import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  ShieldAlert, 
  Zap, 
  TrendingDown, 
  TrendingUp,
  Save,
  Loader2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAutomationSettings, updateAutomationSetting } from "@/services/automation.functions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/lib/toast";

export const Route = createFileRoute('/_authenticated/admin/settings')({
  component: AutomationSettingsPage,
});

function AutomationSettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['automationSettings'],
    queryFn: () => getAutomationSettings(),
  });

  const updateSetting = useMutation({
    mutationFn: (vars: { key: string, value: any }) => updateAutomationSetting({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationSettings'] });
      toast.success("Setting updated");
    },
    onError: (err: any) => toast.error("Failed to update setting", err.message)
  });

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Automation Engine Settings</h1>
        <p className="text-muted-foreground">
          Configure thresholds and rules for the automatic egg rate collection pipeline.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <CardTitle>Anomaly Detection</CardTitle>
            </div>
            <CardDescription>Define what constitutes a suspicious price movement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Percentage Threshold (%)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    defaultValue={settings?.anomalyThresholdPercent} 
                    onBlur={(e) => updateSetting.mutate({ key: 'anomaly_threshold_percent', value: parseFloat(e.target.value) })}
                  />
                  <div className="flex items-center text-xs text-muted-foreground">± deviation</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Max Daily Change (INR)</Label>
                <Input 
                  type="number" 
                  defaultValue={settings?.maxDailyPriceChange} 
                  onBlur={(e) => updateSetting.mutate({ key: 'max_daily_price_change', value: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <CardTitle>Pipeline Rules</CardTitle>
            </div>
            <CardDescription>Control how data flows from ingestion to publication.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-publish Verified Sources</Label>
                <p className="text-sm text-muted-foreground">Instantly publish rates from trusted/authorized sources.</p>
              </div>
              <Switch 
                checked={settings?.autoPublishVerified} 
                onCheckedChange={(checked) => updateSetting.mutate({ key: 'auto_publish_verified', value: checked })}
              />
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-0.5">
                <Label>Auto-publish Below Threshold</Label>
                <p className="text-sm text-muted-foreground">Automatically publish data even if it triggers minor anomalies.</p>
              </div>
              <Switch 
                checked={settings?.autoPublishBelowThreshold} 
                onCheckedChange={(checked) => updateSetting.mutate({ key: 'auto_publish_below_threshold', value: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Regional Conventions</CardTitle>
            </div>
            <CardDescription>Default values for unit conversions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-w-xs">
              <Label>Default Peti Size (Eggs)</Label>
              <Input 
                type="number" 
                defaultValue={settings?.petiSizeDefault} 
                onBlur={(e) => updateSetting.mutate({ key: 'peti_size_default', value: parseInt(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
