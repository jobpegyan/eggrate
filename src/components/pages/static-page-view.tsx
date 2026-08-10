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
        <p className="mt-2 text-xs text-muted-foreground">
          '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
          
          AI Market Analysis ka jo output hai wo well structured hona chahiye aur table sahi se dikhna chahiye
        </p>
        <div className="mt-8 prose prose-amber dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown>{data.content ?? ""}</ReactMarkdown>
        </div>
      </Container>
    </Section>
  );
}
