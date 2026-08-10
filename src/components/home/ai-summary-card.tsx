import { BrainCircuit, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarketInsight } from "@/services/ai-analysis.queries";
import { cn } from "@/lib/utils";

export function AIMarketSummary({ className }: { className?: string }) {
  const { data: insight, isLoading } = useMarketInsight("daily_summary", "national");

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse border-primary/10 rounded-2xl", className)}>
        <div className="h-36 bg-muted/40 rounded-2xl" />
      </Card>
    );
  }

  if (!insight) return null;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.03] via-card to-amber-500/[0.02] shadow-sm transition-all duration-200 hover:border-primary/35 hover:shadow-md",
        className
      )}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-3.5" />
            </span>
            <span>Today's AI Insight</span>
          </div>
          <Badge
            variant="outline"
            className="h-5 border-primary/20 bg-primary/5 text-[10px] font-semibold uppercase tracking-wider text-primary"
          >
            {insight.confidence} Confidence
          </Badge>
        </div>

        <div className="mt-4">
          <h2 className="font-display text-base font-semibold text-foreground sm:text-lg">
            {insight.title}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm line-clamp-2 sm:line-clamp-3">
            {insight.summary || insight.content.substring(0, 180).replace(/[#*]/g, "") + "..."}
          </p>

          <div className="mt-4 flex items-center justify-between pt-1">
            <Link
              to="/egg-market-analysis"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80 group-hover:underline"
            >
              <span>Read full market analysis</span>
              <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
