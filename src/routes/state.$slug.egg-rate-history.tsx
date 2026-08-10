import { createFileRoute } from '@tanstack/react-router';
import { getHistoricalRatesQuery, getHistorySummaryQuery } from '@/services/history.functions';
import RateChart from '@/components/home/rate-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { TrendingUp, Calendar, Info } from 'lucide-react';
import type { RegionHistoryPoint, HistorySummary } from '@/types/history';

type LoaderData = {
  summary: HistorySummary | null;
  history: RegionHistoryPoint[];
  slug: string;
};

export const Route = createFileRoute('/state/$slug/egg-rate-history')({
  head: ({ loaderData, params }) => {
    const data = loaderData as LoaderData | undefined;
    const stateName = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
    return {
      meta: [
        { title: `${stateName} Egg Rate History - 90 Day Trends` },
        { name: 'description', content: `View historical egg price trends in ${stateName}. Daily averages, highs, lows, and 3-month historical data.` },
      ],
    };
  },
  loader: async ({ context, params }) => {
    const [summary, history] = await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ['history-summary', 'state', params.slug],
        queryFn: () => getHistorySummaryQuery({ data: { type: 'state', slug: params.slug } })
      }),
      context.queryClient.ensureQueryData({
        queryKey: ['historical-rates', 'state', params.slug, 90],
        queryFn: () => getHistoricalRatesQuery({ data: { type: 'state', slug: params.slug, days: 90 } })
      })
    ]);
    return { summary, history, slug: params.slug } as LoaderData;
  },
  component: StateHistoryPage,
});

function StateHistoryPage() {
  const data = Route.useLoaderData() as LoaderData;
  const summary = data?.summary;
  const history = data?.history;
  const slug = data?.slug;

  if (!slug || !history) return null;

  const stateName = slug.charAt(0).toUpperCase() + slug.slice(1);

  const chartPoints = history.map((p: RegionHistoryPoint) => ({
    date: p.date,
    perEgg: p.price
  }));

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{stateName} Egg Rate History</h1>
          <p className="text-muted-foreground">Historical data and trends for the last 90 days in {stateName}.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">State Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">₹{summary?.price.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Daily current average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Highest City</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{summary?.highestPrice?.toFixed(2) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary?.highestCity || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Lowest City</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{summary?.lowestPrice?.toFixed(2) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary?.lowestCity || 'N/A'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            90-Day Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <RateChart points={chartPoints} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Historical Archive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold text-right">Avg Price (INR)</th>
                  <th className="px-6 py-3 font-semibold text-right">Tray Price</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row: RegionHistoryPoint) => (
                  <tr key={row.date} className="bg-background border-b hover:bg-muted/30">
                    <td className="px-6 py-4 font-medium">{format(new Date(row.date), 'dd MMM yyyy')}</td>
                    <td className="px-6 py-4 text-right">₹{row.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">₹{(row.price * 30).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
