import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import { deltaDirection, formatDelta, formatPercent } from "@/utils/format";

export function TrendPill({
  change,
  percent,
  className,
  size = "sm",
}: {
  change: number;
  percent?: number;
  className?: string;
  size?: "sm" | "md";
}) {
  const direction = deltaDirection(change);
  const Icon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;
  const label =
    direction === "up" ? "Price up" : direction === "down" ? "Price down" : "Price unchanged";

  return (
    <span
      title={label}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium tabular-nums",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        direction === "up" && "bg-success/15 text-success",
        direction === "down" && "bg-destructive/15 text-destructive",
        direction === "flat" && "bg-muted text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      <span className="sr-only">{label}: </span>
      {formatDelta(change)}
      {percent !== undefined ? (
        <span className="opacity-80">({formatPercent(percent)})</span>
      ) : null}
    </span>
  );
}
