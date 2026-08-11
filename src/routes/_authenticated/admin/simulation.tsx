import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, AlertTriangle, CheckCircle2, Play, ShieldAlert, Zap } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentDate, getYesterdayDate } from "@/lib/date-system";
import { triggerSyncPipeline } from "@/services/automation.functions";

export const Route = createFileRoute("/_authenticated/admin/simulation")({
  component: AdminSimulationPage,
});

interface SimulationResult {
  scenario: string;
  targetDate: string;
  status: string;
  coveragePercent: number;
  recordsProcessed: number;
  recordsPublished: number;
  details: string;
  timestamp: string;
}

function AdminSimulationPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [results, setResults] = useState<SimulationResult[]>([]);

  const scenarios = [
    {
      id: "NEW_DAY_ROLLOVER",
      title: "New Day Rollover",
      description: "Simulate midnight UTC/IST date transition and check automated date recognition",
      targetDate: getCurrentDate(),
    },
    {
      id: "SUCCESSFUL_SOURCE",
      title: "100% Verified Source Fetch",
      description: "Simulate complete multi-source rate fetch, validation, and auto-publishing",
      targetDate: getCurrentDate(),
    },
    {
      id: "PARTIAL_COVERAGE",
      title: "Partial Data Coverage (82%)",
      description: "Simulate subset city rate availability without fabricating missing city data",
      targetDate: getYesterdayDate(),
    },
    {
      id: "SOURCE_TIMEOUT",
      title: "Source Failure & Retry Fallback",
      description: "Simulate source endpoint timeout with exponential backoff and audit alert",
      targetDate: getCurrentDate(),
    },
  ];

  async function runSimulation(scenarioId: string, title: string, dateStr: string) {
    setIsRunning(true);
    setActiveScenario(scenarioId);
    toast.info(`Running simulation scenario: ${title}...`);

    try {
      const res = await triggerSyncPipeline({ data: { targetDate: dateStr } });
      const newResult: SimulationResult = {
        scenario: title,
        targetDate: dateStr,
        status: res.status,
        coveragePercent: res.coveragePercent,
        recordsProcessed: res.recordsProcessed,
        recordsPublished: res.recordsPublished,
        details: res.error ? `Error: ${res.error}` : `Pipeline executed with ${res.coveragePercent}% city coverage.`,
        timestamp: new Date().toLocaleTimeString(),
      };

      setResults((prev) => [newResult, ...prev]);
      toast.success(`Simulation completed: ${res.status}`);
    } catch (err: any) {
      toast.error(`Simulation failed: ${err.message}`);
    } finally {
      setIsRunning(false);
      setActiveScenario(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automated Pipeline Simulation"
        description="Dry-run and test daily rate synchronization pipeline scenarios without modifying production data."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {scenarios.map((s) => (
          <Card key={s.id} className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">{s.title}</CardTitle>
                <Zap className="size-4 text-primary" />
              </div>
              <CardDescription className="text-xs">{s.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">Target Date: {s.targetDate}</span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isRunning}
                  onClick={() => runSimulation(s.id, s.title, s.targetDate)}
                >
                  <Play className="mr-1.5 size-3.5" />
                  {isRunning && activeScenario === s.id ? "Testing..." : "Simulate"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Simulation Results & Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No simulation runs yet. Click "Simulate" on any scenario above to execute a dry-run test.
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((r, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    {r.status === "PUBLISHED" ? (
                      <CheckCircle2 className="size-4 text-success" />
                    ) : r.status === "PARTIAL" ? (
                      <AlertTriangle className="size-4 text-warning" />
                    ) : (
                      <ShieldAlert className="size-4 text-destructive" />
                    )}
                    <div>
                      <p className="font-semibold text-foreground">{r.scenario}</p>
                      <p className="text-muted-foreground">{r.details}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <Badge variant={r.status === "PUBLISHED" ? "default" : "secondary"}>
                      {r.status} ({r.coveragePercent}%)
                    </Badge>
                    <span className="text-[11px] tabular-nums text-muted-foreground">{r.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
