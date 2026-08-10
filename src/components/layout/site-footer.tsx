import { Link } from "@tanstack/react-router";
import { Egg } from "lucide-react";

import { LEGAL_LINKS, NAV_LINKS, SITE } from "@/lib/constants";

const RESOURCE_LINKS = [
  { label: "All states", to: "/states" },
  { label: "All cities", to: "/cities" },
  { label: "Price trends", to: "/trends" },
  { label: "Blog", to: "/blog" },
  { label: "About us", to: "/about" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-card/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Egg className="size-4" aria-hidden />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              EggRate<span className="text-primary">Today</span>
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">{SITE.description}</p>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Browse
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Resources">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Resources
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {RESOURCE_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Legal">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {LEGAL_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Rates are indicative and sourced from
            published market data.
          </p>
          <p>
            '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
            
            AI Market Analysis ka jo output hai wo well structured hona chahiye aur table sahi se dikhna chahiye · All India coverage
          </p>
        </div>
      </div>
    </footer>
  );
}
