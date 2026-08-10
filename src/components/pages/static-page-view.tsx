import { useSuspenseQuery } from "@tanstack/react-query";
import ReactMarkdown from 'react-markdown';

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Container, Section } from "@/components/common/section";
import { staticPageQuery } from "@/services/public-queries";

/** Renders any database-managed static page (about, contact, privacy, …). */
export function StaticPageView({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery(staticPageQuery(slug));

  if (!data) {
    return (
      <Section>
        <Container className="max-w-3xl">
          <p className="text-sm text-muted-foreground">This page has not been published yet.</p>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container className="max-w-3xl">
        <Breadcrumbs items={[{ name: data.title, href: `/${slug}` }]} />
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {data.title}
        </h1>

        <div className="mt-8 prose prose-amber dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown>{data.content ?? ""}</ReactMarkdown>
        </div>
      </Container>
    </Section>
  );
}
