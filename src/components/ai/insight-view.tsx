import { BrainCircuit, Info, ShieldCheck, MapPin, Sparkles } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketInsight } from "@/types/ai";
import { cn } from "@/lib/utils";

interface InsightViewProps {
  insight: MarketInsight;
  className?: string;
  showDisclosure?: boolean;
}

export const markdownComponents = {
  table: ({ node, ...props }: any) => (
    <div className="my-6 w-full overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
      <table className="w-full text-left text-sm border-collapse min-w-[550px]" {...props} />
    </div>
  ),
  thead: ({ node, ...props }: any) => (
    <thead className="bg-muted/80 text-xs uppercase font-semibold text-muted-foreground border-b border-border" {...props} />
  ),
  tbody: ({ node, ...props }: any) => (
    <tbody className="divide-y divide-border/60 text-foreground" {...props} />
  ),
  tr: ({ node, ...props }: any) => (
    <tr className="hover:bg-muted/40 transition-colors" {...props} />
  ),
  th: ({ node, ...props }: any) => (
    <th className="px-4 py-3 font-semibold text-foreground tracking-wider border-r border-border/40 last:border-r-0" {...props} />
  ),
  td: ({ node, ...props }: any) => (
    <td className="px-4 py-3 text-sm text-foreground/90 border-r border-border/30 last:border-r-0" {...props} />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 className="mt-8 mb-4 font-display text-xl font-bold tracking-tight text-foreground border-b border-border/50 pb-2.5 flex items-center gap-2" {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="mt-6 mb-3 font-display text-lg font-semibold tracking-tight text-foreground" {...props} />
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote className="my-4 border-l-4 border-primary bg-primary/5 px-4 py-3 text-sm italic rounded-r-lg text-foreground/90" {...props} />
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="my-4 space-y-2 list-disc list-inside text-muted-foreground" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="my-4 space-y-2 list-decimal list-inside text-muted-foreground" {...props} />
  ),
  li: ({ node, ...props }: any) => (
    <li className="text-foreground/90 leading-relaxed" {...props} />
  ),
  code: ({ node, inline, ...props }: any) => (
    inline ? (
      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-primary font-medium" {...props} />
    ) : (
      <code className="block rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto" {...props} />
    )
  ),
};

export function InsightView({ insight, className, showDisclosure = true }: InsightViewProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <Card className="overflow-hidden border-primary/20 bg-primary/[0.02] shadow-sm">
        <CardHeader className="border-b bg-primary/[0.03] py-5 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-primary">
                <BrainCircuit className="size-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">AI Market Analysis</span>
                <span className="text-[10px] text-muted-foreground">•</span>
                <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3 text-primary" /> All India Coverage
                </span>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-display">{insight.title}</CardTitle>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "w-fit text-[10px] font-bold tracking-wider px-3 py-1 rounded-full",
                insight.confidence === 'high' ? "border-green-500/50 text-green-700 bg-green-500/10" : 
                insight.confidence === 'medium' ? "border-amber-500/50 text-amber-700 bg-amber-500/10" : 
                "border-red-500/50 text-red-700 bg-red-500/10"
              )}
            >
              {insight.confidence.toUpperCase()} CONFIDENCE
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5 text-foreground/80">
              <ShieldCheck className="size-3.5 text-green-600" />
              Verified Data Engine
            </span>
            <span>•</span>
            <span>Analysis Date: {format(new Date(insight.analysisDate), 'PPP')}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-primary">
              <Sparkles className="size-3" /> DeepSeek AI Model
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-6 prose prose-amber dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-display">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {insight.content}
          </ReactMarkdown>
        </CardContent>
      </Card>

      {showDisclosure && (
        <div className="bg-muted/30 border rounded-xl p-4 sm:p-5 flex gap-4 shadow-2xs">
          <Info className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1.5">
            <p className="font-bold text-foreground">AI Disclosure & Data Transparency</p>
            <p className="text-muted-foreground leading-relaxed">
              This market analysis is generated by our automated AI Data Engine using verified egg rates from NECC, local mandis, and official trade associations across India. The AI does not invent rate data or speculate without context. All figures are cross-referenced with live database records.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
