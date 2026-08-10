import { createFileRoute } from '@tanstack/react-router';
import { getHistoricalRatesQuery } from '@/services/history.functions';
import RateChart from '@/components/home/rate-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Calendar, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RegionHistoryPoint } from '@/types/history';

export const Route = createFileRoute('/egg-rate-history')({
  head: () => ({
    meta: [
      { title: 'National Egg Rate History - Historical Data & Trends' },
      { name: 'description', content: 'Explore historical egg price data for India. View 90-day trends and download historical price reports.' },
    ],
  }),
  loader: async ({ context }) => {
    const history = await context.queryClient.ensureQueryData({
      queryKey: ['historical-rates', 'national', 90],
      queryFn: () => getHistoricalRatesQuery({ data: { type: 'national', days: 90 } })
    });
    return { history };
  },
  component: HistoryArchive,
});

function HistoryArchive() {
  const { history } = Route.useLoaderData();

  const chartPoints = history.map((p: RegionHistoryPoint) => ({
    date: p.date,
    perEgg: p.price
  }));

  const downloadData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Price (₹)\n"
      + history.map((r: RegionHistoryPoint) => `${r.date},${r.price}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "national_egg_rates_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Egg Rate History</h1>
          <p className="text-muted-foreground">90-day historical trend and data archive for India.</p>
        </div>
        <Button onClick={downloadData} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Download CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            90-Day Price Trend
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
            Historical Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Date</th>
                    <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Price (Per Egg)</th>
                    <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Tray (30 Eggs)</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row: RegionHistoryPoint) => (
                    <tr key={row.date} className="bg-background border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 font-medium whitespace-nowrap">{format(new Date(row.date), 'dd MMM yyyy')}</td>
                      <td className="px-4 py-4 text-right tabular-nums">₹{row.price.toFixed(2)}</td>
                      <td className="px-4 py-4 text-right font-semibold tabular-nums">₹{(row.price * 30).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
