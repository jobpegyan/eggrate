import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import type { ArticleSummary } from "@/types/home";
import { formatDate } from "@/utils/format";

export function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <p className="text-xs text-muted-foreground">
        <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        <span> · {article.readMinutes} min read</span>
      </p>
      <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-foreground">
        <Link to="/blog/$slug" params={{ slug: article.slug }} className="after:absolute">
          {article.title}
        </Link>
      </h3>
      {article.excerpt ? (
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
      ) : null}
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
        Read article
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </article>
  );
}

export function LatestArticles({ articles }: { articles: ArticleSummary[] }) {
  if (articles.length === 0) return null;

  return (
    <Section className="bg-muted/30">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Latest articles"
            title="Market insight from our desk"
            description="Explainers on feed costs, seasonality and how the declared rate is set."
          />
          <Button asChild variant="outline">
            <Link to="/blog">View all articles</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
