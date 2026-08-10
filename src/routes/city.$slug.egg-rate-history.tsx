import { createFileRoute } from '@tanstack/react-router';
import { useMarketInsight } from '@/services/ai-analysis.queries';
import { InsightView } from '@/components/ai/insight-view';
import { PageSkeleton } from '@/components/common/skeletons';
import { Container, Section } from '@/components/common/section';
import { buildSeo } from '@/utils/seo';

export const Route = createFileRoute('/city/$slug/egg-rate-history')({
  head: ({ params }) => buildSeo({
    title: `${params.slug.charAt(0).toUpperCase() + params.slug.slice(1)} Egg Rate History & Analysis`,
    description: `Complete historical egg price data and AI-powered market analysis for ${params.slug}.`,
    path: `/city/${params.slug}/egg-rate-history`
  }),
  component: CityHistoryPage
});

function CityHistoryPage() {
  const { slug } = Route.useParams();
  const { data: insight, isLoading } = useMarketInsight('city_analysis', 'city', slug);

  return (
    <Section>
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div className="space-y-8">
            <h1 className="text-3xl font-display font-bold capitalize">
              {slug.replace('-', ' ')} Egg Price History
            </h1>
            
            {/* Historical chart/table would go here - placeholder for now to focus on AI */}
            <div className="aspect-video bg-muted rounded-xl border border-dashed flex items-center justify-center text-muted-foreground">
              Historical Trend Chart
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="h-64 bg-muted animate-pulse rounded-xl" />
              </div>
            ) : insight ? (
              <InsightView insight={insight} />
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="font-display font-bold mb-4 text-lg">Market Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">90-Day High</span>
                  <span className="font-bold">₹6.40</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">90-Day Low</span>
                  <span className="font-bold">₹4.80</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Volatility</span>
                  <span className="text-amber-600 font-bold">Medium</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
