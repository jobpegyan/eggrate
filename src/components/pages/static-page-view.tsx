import { useSuspenseQuery } from "@tanstack/react-query";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ShieldCheck, Lock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Container, Section } from "@/components/common/section";
import { staticPageQuery } from "@/services/public-queries";

export const staticMarkdownComponents = {
  table: ({ node, ...props }: any) => (
    <div className="my-6 w-full overflow-x-auto rounded-xl border border-border bg-card shadow-2xs">
      <table className="w-full text-left text-sm border-collapse min-w-[500px]" {...props} />
    </div>
  ),
  thead: ({ node, ...props }: any) => (
    <thead className="bg-muted/80 text-xs uppercase font-semibold text-muted-foreground border-b border-border" {...props} />
  ),
  tbody: ({ node, ...props }: any) => (
    <tbody className="divide-y divide-border/50 text-foreground" {...props} />
  ),
  tr: ({ node, ...props }: any) => (
    <tr className="hover:bg-muted/40 transition-colors" {...props} />
  ),
  th: ({ node, ...props }: any) => (
    <th className="px-4 py-3 font-semibold text-foreground tracking-wide border-r border-border/40 last:border-r-0" {...props} />
  ),
  td: ({ node, ...props }: any) => (
    <td className="px-4 py-3 text-sm text-foreground/90 border-r border-border/30 last:border-r-0" {...props} />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 className="mt-10 mb-4 font-display text-xl font-bold tracking-tight text-foreground border-b border-border/60 pb-2.5 flex items-center gap-2" {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="mt-7 mb-3 font-display text-lg font-semibold tracking-tight text-foreground" {...props} />
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote className="my-5 border-l-4 border-primary bg-primary/5 px-5 py-3.5 text-sm italic rounded-r-xl text-foreground/90" {...props} />
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="my-4 space-y-2 list-disc list-inside text-muted-foreground" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="my-4 space-y-2 list-decimal list-inside text-muted-foreground" {...props} />
  ),
  li: ({ node, ...props }: any) => (
    <li className="text-foreground/90 leading-relaxed" {...props} />
  ),
  hr: ({ node, ...props }: any) => (
    <hr className="my-8 border-border/60" {...props} />
  ),
  code: ({ node, inline, ...props }: any) => (
    inline ? (
      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-primary font-medium" {...props} />
    ) : (
      <code className="block rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto" {...props} />
    )
  ),
  a: ({ node, ...props }: any) => (
    <a className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors" {...props} />
  )
};

/** Renders any database-managed static page (about, contact, privacy, …). */
export function StaticPageView({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery(staticPageQuery(slug));

  if (!data) {
    return (
      <Section className="py-12">
        <Container className="max-w-4xl">
          <p className="text-sm text-muted-foreground">This page has not been published yet.</p>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="py-8 sm:py-12">
      <Container className="max-w-4xl space-y-8">
        <Breadcrumbs items={[{ name: data.title, href: `/${slug}` }]} />

        {/* Page Header Banner */}
        <div className="space-y-4 pb-6 border-b border-border/60">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
            <Lock className="size-3.5" />
            <span>Official Policy & Legal Terms</span>
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {data.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium pt-1">
            <span className="flex items-center gap-1.5 text-foreground/80">
              <ShieldCheck className="size-4 text-green-600" />
              EggRateToday Verified Policy
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {data.updatedAt ? `Last Updated: ${format(new Date(data.updatedAt), 'PPP')}` : 'Last Updated: August 10, 2026'}
            </span>
          </div>
        </div>

        {/* Structured Markdown Content Box */}
        <div className="p-6 sm:p-10 rounded-2xl border border-border/80 bg-card/60 shadow-xs prose prose-amber dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-display">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={staticMarkdownComponents}>
            {data.content ?? ""}
          </ReactMarkdown>
        </div>
      </Container>
    </Section>
  );
}
