import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { deltaDirection, formatDelta } from "@/utils/format";

export interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, delta, hint, icon, className }: StatCardProps) {
  const direction = delta === undefined ? "flat" : deltaDirection(delta);
  const DeltaIcon =
    direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  return (
    <Card className={cn("border-border/70", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {icon ? <span className="text-muted-foreground">{icon}</span> : null}
        </div>
        <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground tabular-nums">
          {value}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          {delta !== undefined ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium tabular-nums",
                direction === "up" && "bg-success/15 text-success",
                direction === "down" && "bg-destructive/15 text-destructive",
                direction === "flat" && "bg-muted text-muted-foreground",
              )}
            >
              <DeltaIcon className="size-3" aria-hidden />
              {formatDelta(delta)}
            </span>
          ) : null}
          {hint ? <span className="text-muted-foreground">{hint}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}