import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { adSlotsQuery } from "@/services/public-queries";
import { cn } from "@/lib/utils";

export type AdPosition =
  | "header_banner"
  | "below_hero"
  | "between_sections"
  | "sidebar_desktop"
  | "sticky_mobile"
  | "in_content"
  | "footer_banner";

/** Injects admin-managed markup, re-creating <script> nodes so ad tags execute. */
function AdMarkup({ code }: { code: string }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = code;
    for (const original of Array.from(host.querySelectorAll("script"))) {
      const script = document.createElement("script");
      for (const attr of Array.from(original.attributes)) {
        script.setAttribute(attr.name, attr.value);
      }
      script.text = original.text;
      original.replaceWith(script);
    }
    return () => {
      host.innerHTML = "";
    };
  }, [code]);

  return <div ref={ref} />;
}

interface AdSlotProps {
  position: AdPosition;
  className?: string;
  /** Height reserved before the unit paints, avoiding layout shift. */
  minHeight?: number;
}

/**
 * Renders an ad unit only when an administrator has enabled that position.
 * Nothing is hardcoded: both the on/off state and the markup come from the database.
 */
export function AdSlot({ position, className, minHeight = 90 }: AdSlotProps) {
  const { data: slots } = useQuery(adSlotsQuery());
  const slot = slots?.find((entry) => entry.position === position);
  if (!slot) return null;

  return (
    <aside
      aria-label={`Advertisement — ${slot.name}`}
      className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}
    >
      <div
        className="flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-border/70 bg-muted/30"
        style={{ minHeight }}
      >
        {slot.code ? (
          <AdMarkup code={slot.code} />
        ) : (
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Advertisement
          </span>
        )}
      </div>
    </aside>
  );
}

/** Anchored mobile-only banner. */
export function StickyMobileAd() {
  const { data: slots } = useQuery(adSlotsQuery());
  const slot = slots?.find((entry) => entry.position === "sticky_mobile");
  if (!slot) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-1.5 backdrop-blur md:hidden">
      <div className="flex min-h-[50px] items-center justify-center">
        {slot.code ? (
          <AdMarkup code={slot.code} />
        ) : (
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Advertisement
          </span>
        )}
      </div>
    </div>
  );
}
