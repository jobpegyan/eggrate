import { createFileRoute } from '@tanstack/react-router';
import { getHistorySummaryQuery, getHistoricalRatesQuery, getNationalMoversQuery, getCoverageStatsQuery } from '@/services/history.functions';
import RateChart from '@/components/home/rate-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ArrowUp, ArrowDown, Info } from 'lucide-react';
import type { RegionHistoryPoint, MoverItem } from '@/types/history';

export const Route = createFileRoute('/egg-rate-today')({
  head: () => ({
    meta: [
      { title: 'EggRateToday - National Historical Dashboard & Analytics' },
      { name: 'description', content: 'View historical egg price trends across India. Compare city-wise prices, track daily changes, and download historical data.' },
      { property: 'og:title', content: 'National Egg Rate Dashboard' },
      { property: 'og:description', content: 'Comprehensive overview of egg prices across the country.' },
    ],
  }),
  loader: async ({ context }) => {
    const [summary, history, movers, coverage] = await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ['history-summary', 'national'],
        queryFn: () => getHistorySummaryQuery({ data: { type: 'national' } })
      }),
      context.queryClient.ensureQueryData({
        queryKey: ['historical-rates', 'national', 30],
        queryFn: () => getHistoricalRatesQuery({ data: { type: 'national', days: 30 } })
      }),
      context.queryClient.ensureQueryData({
        queryKey: ['national-movers'],
        queryFn: () => getNationalMoversQuery({ data: { limit: 10 } })
      }),
      context.queryClient.ensureQueryData({
        queryKey: ['coverage-stats'],
        queryFn: () => getCoverageStatsQuery({ data: {} })
      })
    ]);
    return { summary, history, movers, coverage };
  },
  component: NationalDashboard,
});

function NationalDashboard() {
  const { summary, history, movers, coverage } = Route.useLoaderData();

  const chartPoints = history.map((p: RegionHistoryPoint) => ({
    date: p.date,
    perEgg: p.price
  }));

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">National Egg Rate Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive overview of egg prices across the country.</p>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Info className="w-4 h-4" />
          Last updated: {summary?.date ? format(new Date(summary.date), 'dd MMM yyyy') : 'N/A'}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">National Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary?.price?.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coverage?.coveragePercent}%</div>
            <p className="text-xs text-muted-foreground">
              {coverage?.updatedCities} of {coverage?.totalCities} cities updated
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">State Peak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary?.highestPrice?.toFixed(2) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{summary?.highestCity || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">State Low</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary?.lowestPrice?.toFixed(2) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{summary?.lowestCity || 'N/A'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>National 30-Day Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <RateChart points={chartPoints} />
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Gainers (Daily Change)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movers?.gainers.map((m: MoverItem) => (
                <div key={m.slug} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.state}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{m.price.toFixed(2)}</div>
                    <div className="text-xs text-green-500 flex items-center justify-end">
                      <ArrowUp className="w-3 h-3 mr-1" />
                      +{m.percent}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Losers (Daily Change)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movers?.losers.map((m: MoverItem) => (
                <div key={m.slug} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.state}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{m.price.toFixed(2)}</div>
                    <div className="text-xs text-red-500 flex items-center justify-end">
                      <ArrowDown className="w-3 h-3 mr-1" />
                      {m.percent}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
