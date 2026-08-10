import { createFileRoute } from '@tanstack/react-router';
import { getComparisonQuery } from '@/services/history.functions';
import RateChart from '@/components/home/rate-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Scale } from 'lucide-react';
import type { ComparisonData, RegionHistoryPoint } from '@/types/history';
import { cn } from '@/lib/utils';

type LoaderData = {
  comparison: ComparisonData;
  slugA: string;
  slugB: string;
};

export const Route = createFileRoute('/compare/$slug')({
  head: ({ params }) => {
    const parts = params.slug?.split('-vs-') || [];
    const partA = parts[0] || '';
    const partB = parts[1] || '';
    const nameA = partA ? partA.charAt(0).toUpperCase() + partA.slice(1) : 'City A';
    const nameB = partB ? partB.charAt(0).toUpperCase() + partB.slice(1) : 'City B';
    return {
      meta: [
        { title: `Compare Egg Rates: ${nameA} vs ${nameB} - EggRateToday` },
        { name: 'description', content: `Compare historical egg prices between ${nameA} and ${nameB}. View price differences, trends, and market analytics.` },
      ],
    };
  },
  loader: async ({ context, params }) => {
    const parts = params.slug.split('-vs-');
    const slugA = parts[0] || 'mumbai';
    const slugB = parts[1] || 'pune';

    const comparison = await context.queryClient.ensureQueryData({
      queryKey: ['comparison', slugA, slugB, 30],
      queryFn: () => getComparisonQuery({ 
        data: { 
          items: [
            { type: 'city', slug: slugA },
            { type: 'city', slug: slugB }
          ],
          days: 30 
        } 
      })
    });
    return { comparison, slugA, slugB } as LoaderData;
  },
  component: ComparisonPage,
});

function ComparisonPage() {
  const data = Route.useLoaderData() as LoaderData;
  const comparison = data?.comparison;
  const slugA = data?.slugA;
  const slugB = data?.slugB;

  if (!comparison || !slugA || !slugB) return null;

  const nameA = slugA.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const nameB = slugB.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const latestA = comparison.series[0]?.data.at(-1)?.price || 0;
  const latestB = comparison.series[1]?.data.at(-1)?.price || 0;
  const diff = latestA - latestB;
  const diffPct = latestB > 0 ? (diff / latestB) * 100 : 0;

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Scale className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">Market Comparison</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{nameA} vs {nameB}</h1>
          <p className="text-muted-foreground">Side-by-side egg price comparison and market analytics.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{nameA}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl xs:text-3xl font-bold">₹{latestA.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Current per egg</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{nameB}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl xs:text-3xl font-bold">₹{latestB.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Current per egg</p>
          </CardContent>
        </Card>
        <Card className={cn(
          "sm:col-span-2 lg:col-span-1 border-2",
          diff > 0 ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Difference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl xs:text-3xl font-bold",
              diff > 0 ? "text-green-600" : "text-red-600"
            )}>
              {diff > 0 ? "+" : ""}₹{diff.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {nameA} is {Math.abs(diffPct).toFixed(1)}% {diff > 0 ? "dearer" : "cheaper"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{nameA} Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <RateChart points={comparison.series[0]?.data.map((d: RegionHistoryPoint) => ({ date: d.date, perEgg: d.price })) || []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{nameB} Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <RateChart points={comparison.series[1]?.data.map((d: RegionHistoryPoint) => ({ date: d.date, perEgg: d.price })) || []} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparison Data Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Date</th>
                    <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">{nameA}</th>
                    <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">{nameB}</th>
                    <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.periods.map((date: string, idx: number) => {
                    const valA = comparison.series[0]?.data[idx]?.price || 0;
                    const valB = comparison.series[1]?.data[idx]?.price || 0;
                    const gap = valA - valB;
                    return (
                      <tr key={date} className="bg-background border-b hover:bg-muted/30">
                        <td className="px-4 py-4 font-medium whitespace-nowrap">{format(new Date(date), 'dd MMM yyyy')}</td>
                        <td className="px-4 py-4 text-right tabular-nums">₹{valA.toFixed(2)}</td>
                        <td className="px-4 py-4 text-right tabular-nums">₹{valB.toFixed(2)}</td>
                        <td className={cn(
                          "px-4 py-4 text-right font-medium tabular-nums",
                          gap > 0 ? "text-red-500" : "text-green-500"
                        )}>
                          {gap > 0 ? "+" : ""}₹{gap.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
