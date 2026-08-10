import { BrainCircuit, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarketInsight } from "@/services/ai-analysis.queries";
import { cn } from "@/lib/utils";

export function AIMarketSummary({ className }: { className?: string }) {
  const { data: insight, isLoading } = useMarketInsight('daily_summary', 'national');

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse border-primary/10", className)}>
        <div className="h-40 bg-muted/50 rounded-lg" />
      </Card>
    );
  }

  if (!insight) return null;

  return (
    <Card className={cn("overflow-hidden border-primary/20 bg-primary/[0.02] transition-colors hover:bg-primary/[0.04]", className)}>
      <CardHeader className="pb-2 border-b bg-primary/[0.03] py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <BrainCircuit className="size-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Today's AI Insight</span>
          </div>
          <Badge variant="outline" className="text-[9px] h-4 font-bold border-primary/20 bg-background/50">
            {insight.confidence.toUpperCase()} CONFIDENCE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <CardTitle className="text-lg font-display mb-2">{insight.title}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
          {insight.summary || insight.content.substring(0, 180).replace(/[#*]/g, '') + '...'}
        </p>
        <Link 
          to="/egg-market-analysis" 
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline group"
        >
          Read full market analysis
          <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
