import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { publicSearchQuery } from '@/services/public-queries';
import { Container, Section } from '@/components/common/section';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, MapPin, Building2, ChevronRight } from 'lucide-react';
import { buildSeo } from '@/utils/seo';

export const Route = createFileRoute('/search')({
  head: () => buildSeo({
    title: 'Search Egg Rates - India State & City Prices',
    description: 'Search for live egg rates in your city or state. Find wholesale and retail prices across India.',
    path: '/search',
    noindex: true
  }),
  component: SearchPage
});

function SearchPage() {
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useQuery(publicSearchQuery(query));

  return (
    <Section>
      <Container className="max-w-3xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Search Egg Rates</h1>
            <p className="text-muted-foreground mt-2">Find live prices for any city, state, or market in India.</p>
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Enter city or state name..."
              className="pl-10 h-12 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : results && results.length > 0 ? (
              <div className="grid gap-3">
                {results.map((result) => (
                  <Link
                    key={result.href}
                    to={result.href}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {result.type === 'state' ? (
                        <MapPin className="w-5 h-5 text-primary" />
                      ) : (
                        <Building2 className="w-5 h-5 text-primary" />
                      )}
                      <div>
                        <div className="font-semibold">{result.label}</div>
                        <div className="text-xs text-muted-foreground">{result.sublabel}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            ) : query.length > 2 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-2xl">
                <p className="text-muted-foreground">No results found for "{query}"</p>
                <Button variant="link" onClick={() => setQuery('')}>Clear search</Button>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
