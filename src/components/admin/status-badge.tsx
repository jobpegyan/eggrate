import { Badge } from "@/components/ui/badge";
import type { RecordStatus } from "@/lib/rate-schemas";

const VARIANTS: Record<RecordStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "border-transparent bg-success/15 text-success" },
  draft: { label: "Draft", className: "border-transparent bg-warning/15 text-warning" },
  inactive: { label: "Inactive", className: "border-transparent bg-muted text-muted-foreground" },
  archived: { label: "Archived", className: "border-transparent bg-muted text-muted-foreground" },
};

export function StatusBadge({ status }: { status: RecordStatus }) {
  const variant = VARIANTS[status] ?? VARIANTS.inactive;
  return <Badge className={variant.className}>{variant.label}</Badge>;
}

export function BoolBadge({ value, yes, no }: { value: boolean; yes: string; no: string }) {
  return (
    <Badge
      className={
        value
          ? "border-transparent bg-success/15 text-success"
          : "border-transparent bg-muted text-muted-foreground"
      }
    >
      {value ? yes : no}
    </Badge>
  );
}
