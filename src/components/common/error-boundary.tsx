import { AlertTriangle } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { reportLovableError } from "@/lib/lovable-error-reporting";

interface Props {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
  label?: string;
}

interface State {
  error: Error | null;
}

/** Component-level boundary; route-level errors use the router errorComponent. */
export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error) {
    reportLovableError(error, { boundary: this.props.label ?? "component_error_boundary" });
  }

  reset = () => this.setState({ error: null });

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center"
      >
        <AlertTriangle className="size-6 text-destructive" aria-hidden />
        <div>
          <p className="font-medium text-foreground">This section couldn't load</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try again — the rest of the page is unaffected.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={this.reset}>
          Retry
        </Button>
      </div>
    );
  }
}