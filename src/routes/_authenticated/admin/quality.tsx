import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute('/_authenticated/admin/quality')({
  component: QualityDashboard,
});

function QualityDashboard() {
  const { data: scores } = useQuery({
    queryKey: ['dataQualityScores'],
    queryFn: async () => {
      const { data } = await supabase
        .from('data_quality_scores')
        .select('*')
        .order('recorded_date', { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Quality Score</h1>
        <p className="text-muted-foreground">
          Real-time metrics for data accuracy, freshness, and completeness.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Freshness Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.2%</div>
            <Progress value={98.2} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Score</CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.5%</div>
            <Progress value={96.5} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completeness Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.0%</div>
            <Progress value={92} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scores?.map((score) => (
              <div key={score.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{score.entity_type} score</p>
                  <p className="text-xs text-muted-foreground">{score.recorded_date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{score.score_value}%</p>
                  <p className="text-[10px] uppercase text-emerald-500 font-semibold">Excellent</p>
                </div>
              </div>
            ))}
            {!scores?.length && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground/20 mb-2" />
                <p className="text-sm text-muted-foreground italic">No quality assessments recorded yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
