import { createFileRoute } from '@tanstack/react-router';
import { useMarketInsight, useGenerateMarketInsight } from '@/services/ai-analysis.queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { Container, Section } from '@/components/common/section';
import { InsightView } from '@/components/ai/insight-view';
import { BrainCircuit, Info, AlertTriangle, TrendingUp, Sparkles, Loader2, BarChart3, ShieldCheck, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/egg-market-analysis')({
  head: () => ({
    meta: [
      { title: 'AI Egg Market Analysis | Daily Insights & Trends - EggRateToday' },
      { name: 'description', content: 'Explore AI-powered structured analysis of the Indian egg market with All-India coverage, price comparison tables, and regional trends.' }
    ]
  }),
  component: MarketAnalysisPage
});

function MarketAnalysisPage() {
  const { data: insight, isLoading } = useMarketInsight('daily_summary', 'national');
  const generate = useGenerateMarketInsight();

  const handleAnalyze = async () => {
    try {
      await generate.mutateAsync({ type: 'daily_summary', scope: 'national' });
      toast.success("AI market analysis updated successfully!");
    } catch (error) {
      toast.error("Failed to generate AI analysis. Please check API configuration.");
    }
  };

  return (
    <Section className="py-6 sm:py-10">
      <Container className="space-y-8 max-w-6xl">
        <Breadcrumbs items={[{ name: 'AI Market Analysis', href: '/egg-market-analysis' }]} />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-border/60">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>AI Market Engine</span>
              <span>•</span>
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" /> All India Coverage
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-foreground">
              Today's Egg Market Analysis
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
              Fact-based, transparent analysis and structured price comparison tables for egg rates across India, processed by our AI Market Data Engine.
            </p>
          </div>

          <Button 
            size="lg" 
            className="rounded-full shadow-md shadow-primary/15 hover:shadow-primary/25 shrink-0 group font-semibold"
            onClick={handleAnalyze}
            disabled={generate.isPending}
          >
            {generate.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse text-amber-300" />
            )}
            {generate.isPending ? 'Generating Report...' : 'Refresh AI Analysis'}
          </Button>
        </div>

        {/* Top Summary Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border/80 bg-card/60 shadow-2xs space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" /> Coverage
            </p>
            <p className="text-lg font-bold text-foreground">All India (100%)</p>
            <p className="text-[11px] text-muted-foreground">Key States & Mandis</p>
          </div>

          <div className="p-4 rounded-xl border border-border/80 bg-card/60 shadow-2xs space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="size-3.5 text-blue-500" /> Data Source
            </p>
            <p className="text-lg font-bold text-foreground">NECC & Trade Data</p>
            <p className="text-[11px] text-muted-foreground">Cross-verified rates</p>
          </div>

          <div className="p-4 rounded-xl border border-border/80 bg-card/60 shadow-2xs space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-green-500" /> Integrity Score
            </p>
            <p className="text-lg font-bold text-green-600">High Confidence</p>
            <p className="text-[11px] text-muted-foreground">Fact-checked insights</p>
          </div>

          <div className="p-4 rounded-xl border border-border/80 bg-card/60 shadow-2xs space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-amber-500" /> Model Engine
            </p>
            <p className="text-lg font-bold text-foreground">DeepSeek AI</p>
            <p className="text-[11px] text-muted-foreground">Optimized for Mandis</p>
          </div>
        </div>

        {/* Main Content Layout Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              <Card className="animate-pulse p-8 space-y-4">
                <div className="h-6 w-1/3 bg-muted rounded-md" />
                <div className="h-8 w-3/4 bg-muted rounded-md" />
                <div className="h-64 bg-muted/60 rounded-xl" />
              </Card>
            ) : insight ? (
              <InsightView insight={insight} showDisclosure={true} />
            ) : (
              <Card className="flex flex-col items-center justify-center py-16 px-6 text-center border-dashed">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <BrainCircuit className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display">No Analysis Published Yet</h3>
                <p className="text-muted-foreground text-sm max-w-md mt-2">
                  Click the button below to generate today's AI-driven All-India market report with structured price comparison tables.
                </p>
                <Button 
                  className="mt-6 rounded-full" 
                  onClick={handleAnalyze}
                  disabled={generate.isPending}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Analysis
                </Button>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Card className="border-border/80 shadow-2xs">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base font-bold flex items-center gap-2 font-display">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Key Market Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 space-y-1">
                  <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Weekly Outlook</p>
                  <p className="text-xs font-semibold text-foreground">Steady demand with price stability in Northern markets.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Regional Volatility</p>
                  <p className="text-xs font-semibold text-foreground">Southern & Coastal regions observing minor rate adjustments.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                  <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">All-India Coverage</p>
                  <p className="text-xs font-semibold text-foreground">Covers 25+ states and 100+ major trading hubs daily.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5 shadow-2xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-primary font-display">
                  <AlertTriangle className="w-4 h-4" />
                  Data Integrity Protocol
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every price figure referenced in our AI reports is directly pulled from verified database records. In case of unexpected price spikes, our system flags entries for manual verification by mandi data analysts.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}
