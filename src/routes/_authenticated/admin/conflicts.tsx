import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Check, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resolveConflict } from "@/services/automation.functions";
import { toast } from "@/lib/toast";

export const Route = createFileRoute('/_authenticated/admin/conflicts')({
  component: ConflictQueue,
});

function ConflictQueue() {
  const queryClient = useQueryClient();
  const { data: conflicts, isLoading } = useQuery({
    queryKey: ['dataConflicts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('data_conflicts')
        .select('*, source_a(id, name), source_b(id, name), city_id(name)')
        .eq('resolved', false)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const resolve = useMutation({
    mutationFn: (vars: { conflictId: string, winnerSourceId?: string, method: string }) => 
      resolveConflict({ 
        data: { 
          conflictId: vars.conflictId, 
          winnerSourceId: vars.winnerSourceId, 
          resolutionMethod: vars.method 
        } 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataConflicts'] });
      toast.success("Conflict resolved");
    },
    onError: (err: any) => toast.error("Failed to resolve conflict", err.message)
  });

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conflict Resolution</h1>
        <p className="text-muted-foreground">
          Resolve pricing disagreements between different data sources.
        </p>
      </div>

      <div className="space-y-4">
        {conflicts?.map((conflict: any) => (
          <Card key={conflict.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {conflict.city_id?.name || 'Unknown City'} — {conflict.date}
                </CardTitle>
                <Badge variant="outline" className="text-amber-500 gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Conflict
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-1 text-center md:text-left">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Source A</p>
                  <p className="font-medium">{conflict.source_a?.name}</p>
                  <p className="text-2xl font-bold text-primary">₹{conflict.rate_a}</p>
                </div>
                
                <div className="flex justify-center">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-1 text-center md:text-right">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Source B</p>
                  <p className="font-medium">{conflict.source_b?.name}</p>
                  <p className="text-2xl font-bold text-primary">₹{conflict.rate_b}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => resolve.mutate({ conflictId: conflict.id, method: 'ignored' })}
                  disabled={resolve.isPending}
                >
                  Ignore
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => resolve.mutate({ 
                    conflictId: conflict.id, 
                    winnerSourceId: conflict.source_a.id, 
                    method: `manual_selection_${conflict.source_a.name}` 
                  })}
                  disabled={resolve.isPending}
                >
                  <Check className="h-4 w-4" />
                  Prefer A
                </Button>
                <Button 
                  size="sm" 
                  className="gap-1"
                  onClick={() => resolve.mutate({ 
                    conflictId: conflict.id, 
                    winnerSourceId: conflict.source_b.id, 
                    method: `manual_selection_${conflict.source_b.name}` 
                  })}
                  disabled={resolve.isPending}
                >
                  <Check className="h-4 w-4" />
                  Prefer B
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!conflicts?.length && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-lg border-2 border-dashed">
            <Check className="h-12 w-12 text-emerald-500 mb-4" />
            <h3 className="text-lg font-semibold">All clear!</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              No data conflicts currently require your attention.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
