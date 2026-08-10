import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Container, Section, SectionHeading } from "@/components/common/section";
import { PageSkeleton } from "@/components/common/skeletons";
import { ArticleCard } from "@/components/home/latest-articles";
import { articlesQuery } from "@/services/public-queries";
import { breadcrumbSchema, buildSeo } from "@/utils/seo";

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
];

export const Route = createFileRoute("/blog/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(articlesQuery(24)),
  pendingComponent: PageSkeleton,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-6xl px-4 py-20 text-sm">
      {error.message}
    </div>
  ),
  head: () =>
    buildSeo({
      title: "Egg Rate Blog — Market Insight & Price Explainers",
      description:
        "Analysis of India's egg market: what drives the NECC declared rate, seasonal demand, feed costs and city-level price gaps.",
      path: "/blog",
      schema: breadcrumbSchema(CRUMBS),
    }),
  component: BlogIndex,
});

function BlogIndex() {
  const { data: articles } = useSuspenseQuery(articlesQuery(24));

  return (
    <Section>
      <Container>
        <Breadcrumbs items={[{ name: "Blog", href: "/blog" }]} />
        <SectionHeading
          eyebrow="Blog"
          title="Egg market insight"
          description="Explainers and analysis to help you read the daily rate."
          className="mt-4"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
