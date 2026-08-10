import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Container, Section } from "@/components/common/section";
import { PageSkeleton } from "@/components/common/skeletons";
import { AdSlot } from "@/components/ads/ad-slot";
import { articleQuery } from "@/services/public-queries";
import { formatDate } from "@/utils/format";
import { breadcrumbSchema, buildSeo, canonicalUrl } from "@/utils/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const article = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    if (!article) throw notFound();
    return article;
  },
  pendingComponent: PageSkeleton,
  notFoundComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-20 text-sm text-muted-foreground">
      That article does not exist.
    </div>
  ),
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-6xl px-4 py-20 text-sm">
      {error.message}
    </div>
  ),
  head: ({ params, loaderData }) =>
    buildSeo({
      title: loaderData?.metaTitle ?? loaderData?.title ?? "Article",
      description: loaderData?.metaDescription ?? loaderData?.excerpt ?? "",
      path: `/blog/${params.slug}`,
      type: "article",
      publishedAt: loaderData?.publishedAt ?? "",
      schema: [
        breadcrumbSchema([
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: loaderData?.title ?? "Article", href: `/blog/${params.slug}` },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: loaderData?.title,
          description: loaderData?.excerpt,
          datePublished: loaderData?.publishedAt,
          author: { "@type": "Person", name: loaderData?.authorName ?? "EggRateToday" },
          mainEntityOfPage: canonicalUrl(`/blog/${params.slug}`),
        },
      ],
    }),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(articleQuery(slug));
  if (!data) return null;

  return (
    <Section>
      <Container className="max-w-3xl">
        <Breadcrumbs
          items={[
            { name: "Blog", href: "/blog" },
            { name: data.title, href: `/blog/${data.slug}` },
          ]}
        />
        <article className="mt-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {data.title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            <time dateTime={data.publishedAt}>{formatDate(data.publishedAt)}</time>
            {data.authorName ? <span> · {data.authorName}</span> : null}
            <span> · {data.readMinutes} min read</span>
          </p>
          <AdSlot position="in_content" className="my-8 px-0" minHeight={250} />
          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
            {(data.content ?? data.excerpt ?? "")
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>
        </article>
      </Container>
    </Section>
  );
}
