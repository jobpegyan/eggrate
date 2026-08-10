import { Container, Section, SectionHeading } from "@/components/common/section";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CityInsight } from "@/types/city";
import { useMarketInsight } from "@/services/ai-analysis.queries";
import { InsightView } from "@/components/ai/insight-view";
import { Skeleton } from "@/components/ui/skeleton";

/** Written market commentary, computed from the city's own figures. */
export function CityInsights({
  insights,
  cityName,
  citySlug,
}: {
  insights: CityInsight[];
  cityName: string;
  citySlug?: string;
}) {
  const { data: aiInsight, isLoading: aiLoading } = useMarketInsight('city_analysis', 'city', citySlug);

  if (insights.length === 0) return null;

  return (
    <Section className="bg-muted/30">
      <Container>
        <SectionHeading
          eyebrow="Market insights"
          title={`What the ${cityName} numbers say`}
          description="Generated from this city's live and historical rates — updated every time the market declares."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight) => (
            <Card key={insight.id} className="border-border/70">
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      insight.tone === "positive"
                        ? "bg-success"
                        : insight.tone === "negative"
                          ? "bg-destructive"
                          : "bg-muted-foreground/50",
                    )}
                    aria-hidden
                  />
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {insight.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{insight.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {aiLoading ? (
          <div className="mt-12 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : aiInsight ? (
          <div className="mt-12">
            <InsightView insight={aiInsight} showDisclosure={false} />
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
