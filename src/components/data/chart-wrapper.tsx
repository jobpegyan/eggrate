import * as React from "react";

import { ChartSkeleton } from "@/components/common/skeletons";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

export interface ChartWrapperProps {
  title: string;
  description?: string;
  height?: number;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * Client-only, error-isolated shell for charts. Recharts measures the DOM, so
 * rendering is deferred until hydration to avoid layout shift and SSR warnings.
 */
export function ChartWrapper({
  title,
  description,
  height = 288,
  actions,
  className,
  children,
}: ChartWrapperProps) {
  const hydrated = useHydrated();

  return (
    <Card className={cn("border-border/70", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {actions}
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ErrorBoundary label="chart">
            {hydrated ? children : <ChartSkeleton className="h-full" />}
          </ErrorBoundary>
        </div>
      </CardContent>
    </Card>
  );
}