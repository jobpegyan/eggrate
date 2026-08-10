import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export interface SettingField {
  key: string;
  label: string;
  group_name: string;
  input_type: string;
  sort_order: number;
  value: string;
}

/**
 * Renders a settings form entirely from database rows — fields, groups and
 * input types are data, never hardcoded.
 */
export function SettingsForm({
  fields,
  onSave,
  saving,
}: {
  fields: SettingField[];
  onSave: (changes: Record<string, string>) => Promise<void> | void;
  saving?: boolean;
}) {
  const [values, setValues] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setValues(Object.fromEntries(fields.map((field) => [field.key, field.value])));
  }, [fields]);

  const groups = React.useMemo(() => {
    const map = new Map<string, SettingField[]>();
    for (const field of [...fields].sort((a, b) => a.sort_order - b.sort_order)) {
      map.set(field.group_name, [...(map.get(field.group_name) ?? []), field]);
    }
    return Array.from(map.entries());
  }, [fields]);

  const dirty = fields.some((field) => (values[field.key] ?? "") !== field.value);

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        const changed = Object.fromEntries(
          fields
            .filter((field) => (values[field.key] ?? "") !== field.value)
            .map((field) => [field.key, values[field.key] ?? ""]),
        );
        void onSave(changed);
      }}
    >
      {groups.map(([group, groupFields]) => (
        <section key={group} className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-base font-semibold capitalize">
            {group.replace(/[_-]/g, " ")}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {groupFields.map((field) => (
              <div
                key={field.key}
                className={field.input_type === "textarea" ? "space-y-2 sm:col-span-2" : "space-y-2"}
              >
                <Label htmlFor={`setting-${field.key}`}>{field.label}</Label>
                {field.input_type === "textarea" ? (
                  <Textarea
                    id={`setting-${field.key}`}
                    rows={3}
                    value={values[field.key] ?? ""}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                    }
                  />
                ) : field.input_type === "boolean" ? (
                  <div className="flex h-10 items-center">
                    <Switch
                      id={`setting-${field.key}`}
                      checked={values[field.key] === "true"}
                      onCheckedChange={(checked) =>
                        setValues((prev) => ({ ...prev, [field.key]: String(checked) }))
                      }
                    />
                  </div>
                ) : (
                  <Input
                    id={`setting-${field.key}`}
                    type={field.input_type === "number" ? "number" : "text"}
                    value={values[field.key] ?? ""}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                    }
                  />
                )}
                <p className="text-[11px] text-muted-foreground">{field.key}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="flex justify-end">
        <Button type="submit" disabled={!dirty || saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
        </Button>
      </div>
    </form>
  );
}