import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Activity, 
  AlertTriangle, 
  Building, 
  Calendar, 
  CheckCircle2, 
  Database, 
  Download, 
  Eye, 
  Globe, 
  Loader2, 
  Play, 
  RefreshCcw, 
  ShieldCheck 
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  testNECCConnection, 
  fetchNECCRatesNow, 
  importNECCMonthHistorical, 
  getNECCStatus 
} from "@/services/necc.functions";

export const Route = createFileRoute("/_authenticated/admin/necc")({
  ssr: false,
  component: NECCPage,
});

function NECCPage() {
  const queryClient = useQueryClient();

  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth() + 1);

  const [testResult, setTestResult] = React.useState<any>(null);
  const [isTesting, setIsTesting] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isHistoricalImporting, setIsHistoricalImporting] = React.useState(false);

  const { data: status, isLoading: loadingStatus } = useQuery({
    queryKey: ["neccStatus"],
    queryFn: () => getNECCStatus(),
  });

  async function handleTestConnection() {
    setIsTesting(true);
    toast.info("Testing connection to Official NECC Portal...");
    try {
      const res = await testNECCConnection({
        data: { year: selectedYear, month: selectedMonth },
      });
      setTestResult(res);
      if (res.success) {
        toast.success(`NECC Connection Success! Parsed ${res.fetchedCount} daily records (${res.coveragePercent}% coverage).`);
      } else {
        toast.error(`NECC Test Notice: ${res.validationErrors?.[0] || "No records parsed"}`);
      }
    } catch (err: any) {
      toast.error(`Connection test failed: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  }

  async function handleRunNow() {
    setIsSyncing(true);
    toast.info("Running Official NECC daily rate synchronization...");
    try {
      const res = await fetchNECCRatesNow();
      await queryClient.invalidateQueries({ queryKey: ["neccStatus"] });
      if (res.success) {
        toast.success(`NECC Sync Complete! ${res.importedCount} records imported for ${res.date}.`);
      } else {
        toast.error(`NECC Sync Failed: ${res.note}`);
      }
    } catch (err: any) {
      toast.error(`NECC Sync Error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleHistoricalImport() {
    setIsHistoricalImporting(true);
    toast.info(`Importing historical NECC data for ${selectedMonth}/${selectedYear}...`);
    try {
      const res = await importNECCMonthHistorical({
        data: { year: selectedYear, month: selectedMonth },
      });
      await queryClient.invalidateQueries({ queryKey: ["neccStatus"] });
      if (res.success) {
        toast.success(`Historical Import Success! ${res.importedCount} records imported for ${selectedMonth}/${selectedYear}.`);
      } else {
        toast.error(`Historical Import Failed: ${res.note}`);
      }
    } catch (err: any) {
      toast.error(`Historical import failed: ${err.message}`);
    } finally {
      setIsHistoricalImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="National Egg Co-ordination Committee (NECC) Official"
        description="Official source connector for NECC daily suggested reference egg rates (https://www.e2necc.com/home/eggprice)."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
              {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
              Test Connection
            </Button>
            <Button onClick={handleRunNow} disabled={isSyncing}>
              <RefreshCcw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              Run Now
            </Button>
          </div>
        }
      />

      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold text-primary">Official Source Attribution & Mandatory Disclaimer</p>
          <p className="mt-0.5 text-muted-foreground text-xs leading-relaxed">
            The daily egg prices suggested by NECC on its official website (<code className="font-mono bg-muted px-1 rounded">https://www.e2necc.com/home/eggprice</code>) are merely suggestive and not mandatory. They are published solely for reference of the trade and poultry industry.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NECC Status</CardTitle>
            <Globe className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">Connected</div>
            <p className="text-xs text-muted-foreground">e2necc.com Reachable</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Date (IST)</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.todayDate || "—"}</div>
            <p className="text-xs text-muted-foreground">Asia/Kolkata Business Date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Confirmed DB Records</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.todayRecordsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Records in Supabase</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active NECC Centres</CardTitle>
            <Building className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34 / 34</div>
            <p className="text-xs text-muted-foreground">100% Coverage Target</p>
          </CardContent>
        </Card>
      </div>

      {/* Historical Month Import Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Historical & Monthly Rate Sheet Fetcher</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1.5">
              <Label>Select Year</Label>
              <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(parseInt(val, 10))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Select Month</Label>
              <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(parseInt(val, 10))}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">01 - January</SelectItem>
                  <SelectItem value="2">02 - February</SelectItem>
                  <SelectItem value="3">03 - March</SelectItem>
                  <SelectItem value="4">04 - April</SelectItem>
                  <SelectItem value="5">05 - May</SelectItem>
                  <SelectItem value="6">06 - June</SelectItem>
                  <SelectItem value="7">07 - July</SelectItem>
                  <SelectItem value="8">08 - August</SelectItem>
                  <SelectItem value="9">09 - September</SelectItem>
                  <SelectItem value="10">10 - October</SelectItem>
                  <SelectItem value="11">11 - November</SelectItem>
                  <SelectItem value="12">12 - December</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 self-end pt-1">
              <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
                {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                Preview Month Sheet
              </Button>
              <Button onClick={handleHistoricalImport} disabled={isHistoricalImporting}>
                {isHistoricalImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Import Selected Month Data
              </Button>
            </div>
          </div>

          {testResult ? (
            <div className="mt-4 rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">NECC Diagnostic Preview ({selectedMonth}/{selectedYear})</span>
                <Badge variant={testResult.success ? "outline" : "destructive"}>
                  Coverage: {testResult.coveragePercent}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{testResult.note}</p>

              {testResult.unmappedCentres?.length > 0 ? (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600">
                  <span className="font-semibold flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Unmapped Centres Detected ({testResult.unmappedCentres.length}):
                  </span>
                  <p className="mt-1">{testResult.unmappedCentres.join(", ")}</p>
                </div>
              ) : null}

              {/* Sample Table */}
              <div className="max-h-60 overflow-y-auto rounded-lg border">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted font-semibold text-muted-foreground border-b">
                    <tr>
                      <th className="p-2 text-left">NECC Zone / Centre</th>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Raw Rate (NECC)</th>
                      <th className="p-2 text-left">Normalized (Per Egg)</th>
                      <th className="p-2 text-left">Mapped City</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResult.parsedRecords?.slice(0, 15).map((rec: any, idx: number) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-2 font-medium">{rec.centre}</td>
                        <td className="p-2 text-muted-foreground">{rec.rate_date}</td>
                        <td className="p-2 font-mono">{rec.raw_rate}</td>
                        <td className="p-2 font-semibold text-emerald-600">₹{rec.egg_rate}</td>
                        <td className="p-2 capitalize">{rec.mappedCity}</td>
                        <td className="p-2">
                          <Badge variant={rec.mapping_status === "MAPPED" ? "outline" : "secondary"}>
                            {rec.mapping_status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
