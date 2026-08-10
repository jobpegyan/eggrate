import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export type AlertTone = "info" | "success" | "warning" | "error";

const TONES: Record<AlertTone, { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: "border-primary/30 bg-primary/5 text-foreground" },
  success: { icon: CheckCircle2, className: "border-success/40 bg-success/10 text-foreground" },
  warning: { icon: TriangleAlert, className: "border-warning/40 bg-warning/10 text-foreground" },
  error: {
    icon: AlertCircle,
    className: "border-destructive/40 bg-destructive/10 text-foreground",
  },
};

export interface AlertBannerProps {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

/** Inline, persistent messaging. Transient feedback uses toast() instead. */
export function AlertBanner({
  tone = "info",
  title,
  children,
  onDismiss,
  className,
}: AlertBannerProps) {
  const { icon: Icon, className: toneClass } = TONES[tone];

  return (
    <Alert className={cn("relative", toneClass, className)}>
      <Icon className="size-4" aria-hidden />
      <AlertTitle>{title}</AlertTitle>
      {children ? <AlertDescription>{children}</AlertDescription> : null}
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </Alert>
  );
}