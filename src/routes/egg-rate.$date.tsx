import { createFileRoute } from '@tanstack/react-router';
import { getHistorySummaryQuery } from '@/services/history.functions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fetchSeoTemplate } from '@/services/seo.functions';
import { fillTemplate } from '@/utils/seo';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import type { HistorySummary } from '@/types/history';

type LoaderData = {
  summary: HistorySummary | null;
  date: string;
  seoTemplate: any;
};

export const Route = createFileRoute('/egg-rate/$date')({
  head: ({ loaderData }) => {
    const data = loaderData as LoaderData | undefined;
    const template = data?.seoTemplate;
    const formattedDate = data?.summary ? format(new Date(data.date), 'dd MMMM yyyy') : data?.date;

    const vars = {
      date: formattedDate || '',
      rate: data?.summary ? data.summary.price.toFixed(2) : '',
    };

    const title = template?.title_template
      ? fillTemplate(template.title_template, vars)
      : `Egg Rate in India on ${formattedDate} - Historical Data`;

    const description = template?.description_template
      ? fillTemplate(template.description_template, vars)
      : `Check the egg prices in India for ${formattedDate}. National average, trends, and daily market updates.`;

    return {
      meta: [
        { title },
        { name: 'description', content: description },
      ],
    };
  },
  loader: async ({ context, params }) => {
    const [summary, seoTemplate] = await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ['history-summary', 'national', params.date],
        queryFn: () => getHistorySummaryQuery({ data: { type: 'national', date: params.date } })
      }),
      fetchSeoTemplate({ data: { pageType: "history" } }),
    ]);
    return { summary, date: params.date, seoTemplate } as LoaderData;
  },
  component: DateArchivePage,
});

function DateArchivePage() {
  const data = Route.useLoaderData() as LoaderData;
  const summary = data?.summary;
  const date = data?.date;

  if (!date) return null;


  if (!summary) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">No Data Available</h1>
        <p className="text-muted-foreground">No verified rate data available for {format(new Date(date), 'dd MMM yyyy')}.</p>
      </div>
    );
  }

  const formattedDate = format(new Date(date), 'dd MMMM yyyy');

  return (
    <div className="container py-8 space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/egg-rate-history">History</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{formattedDate}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Egg Rate for {formattedDate}</h1>
        <p className="text-muted-foreground">Historical daily average egg rate across India.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">National Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-primary">₹{summary.price.toFixed(2)}</div>
            <p className="text-xs mt-1">Per Egg (Wholesale)</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Tray Price (30 Eggs)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">₹{(summary.price * 30).toFixed(2)}</div>
            <p className="text-xs mt-1 text-muted-foreground">Standard packaging</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">100 Eggs Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">₹{(summary.price * 100).toFixed(2)}</div>
            <p className="text-xs mt-1 text-muted-foreground">Wholesale bulk rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="prose prose-amber dark:prose-invert max-w-none">
        <h2>Market Analysis for {formattedDate}</h2>
        <p>
          On {formattedDate}, the average egg rate in India was recorded at <strong>₹{summary.price.toFixed(2)}</strong> per egg. 
          This data is compiled from verified market sources across multiple states and cities in India.
        </p>
        <p>
          Traders and wholesalers noted that the prices remained within the expected range for the season. 
          The tray price (30 eggs) stood at ₹{(summary.price * 30).toFixed(2)}, while bulk buyers could procure 100 eggs for ₹{(summary.price * 100).toFixed(2)}.
        </p>
      </div>
    </div>
  );
}
