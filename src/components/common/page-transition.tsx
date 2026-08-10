import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Fade+lift wrapper applied to route content for soft page transitions. */
export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-2 duration-500", className)}>
      {children}
    </div>
  );
}