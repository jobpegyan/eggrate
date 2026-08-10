import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { searchQuery } from "@/services/queries";

/** Site-wide ⌘K search across states and cities. */
export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [term, setTerm] = React.useState("");
  const debounced = useDebouncedValue(term, 200);
  const navigate = useNavigate();

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const { data: results = [], isFetching } = useQuery(searchQuery(debounced));

  const go = (href: string) => {
    setOpen(false);
    setTerm("");
    navigate({ to: href }).catch(() => undefined);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-11 w-11 text-muted-foreground sm:h-9 sm:w-auto sm:min-w-56 sm:justify-start sm:gap-2"
        aria-label="Search"
      >
        <Search className="size-5 sm:size-4" aria-hidden />
        <span className="hidden sm:inline">Search state or city…</span>
        <kbd className="ml-auto hidden rounded border border-border px-1.5 text-[10px] sm:inline">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search states and cities…"
          value={term}
          onValueChange={setTerm}
        />
        <CommandList>
          <CommandEmpty>
            {isFetching ? "Searching…" : "No matching state or city."}
          </CommandEmpty>
          {results.length > 0 ? (
            <CommandGroup heading="Results">
              {results.map((result) => (
                <CommandItem
                  key={`${result.type}-${result.slug}`}
                  value={`${result.label} ${result.sublabel ?? ""}`}
                  onSelect={() => go(result.href)}
                >
                  <span>{result.label}</span>
                  {result.sublabel ? (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {result.sublabel}
                    </span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}