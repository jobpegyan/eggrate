import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Search, X } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import { publicSearchQuery } from "@/services/public-queries";

const RECENT_KEY = "eggrate:recent-searches";

interface RecentEntry {
  label: string;
  href: string;
}

function readRecent(): RecentEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as RecentEntry[]).slice(0, 5) : [];
  } catch {
    return [];
  }
}

/** Instant autocomplete over states and cities, with recent-search memory. */
export function RateSearch({
  placeholder = "Search your city or state…",
  className,
  popular = [],
}: {
  placeholder?: string;
  className?: string;
  popular?: { label: string; href: string }[];
}) {
  const [term, setTerm] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [recent, setRecent] = React.useState<RecentEntry[]>([]);
  const [active, setActive] = React.useState(0);
  const debounced = useDebouncedValue(term, 180);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setRecent(readRecent()), []);

  React.useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const { data: results = [], isFetching } = useQuery(publicSearchQuery(debounced));

  const go = (entry: RecentEntry) => {
    const next = [entry, ...recent.filter((item) => item.href !== entry.href)].slice(0, 5);
    setRecent(next);
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — navigation still works */
    }
    window.location.assign(entry.href);
  };

  const suggestions = term.trim()
    ? results.map((result) => ({ label: result.label, sub: result.sublabel, href: result.href }))
    : [
        ...recent.map((item) => ({ label: item.label, sub: "Recent", href: item.href })),
        ...popular.map((item) => ({ label: item.label, sub: "Popular", href: item.href })),
      ].slice(0, 6);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls="rate-search-listbox"
          aria-label="Search egg rate by city or state"
          autoComplete="off"
          value={term}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setTerm(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((index) => Math.min(index + 1, suggestions.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((index) => Math.max(index - 1, 0));
            } else if (event.key === "Enter" && suggestions[active]) {
              event.preventDefault();
              go(suggestions[active]!);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          className="h-11 xs:h-12 rounded-xl border-border bg-card pl-10 pr-10 text-sm xs:text-base shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
        />
        {term ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
        {isFetching ? (
          <Loader2
            className="absolute right-9 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden
          />
        ) : null}
      </div>

      {open && suggestions.length > 0 ? (
        <ul
          id="rate-search-listbox"
          role="listbox"
          className="absolute z-30 mt-2 max-h-[60vh] w-full overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg md:max-h-[400px]"
        >
          {suggestions.map((item, index) => (
            <li key={item.href} role="none">
              <button
                type="button"
                role="option"
                aria-selected={index === active}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(item)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  index === active ? "bg-accent text-foreground" : "text-muted-foreground",
                )}
              >
                <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 truncate font-medium text-foreground">{item.label}</span>
                {item.sub ? (
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">{item.sub}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : open && term.trim() && !isFetching ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover p-4 text-center shadow-lg">
          <p className="text-sm text-muted-foreground">
            No results found for "<span className="font-medium text-foreground">{term}</span>"
          </p>
        </div>
      ) : null}
    </div>
  );
}
