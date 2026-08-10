import { CheckCircle2, Loader2, Mail } from "lucide-react";
import * as React from "react";
import { z } from "zod";

import { Container, Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter } from "@/services/public.functions";

const emailSchema = z.string().trim().email("Enter a valid email address").max(160);

export function Newsletter() {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email address");
      return;
    }
    setError(null);
    setState("loading");
    const result = await subscribeNewsletter({ data: { email: parsed.data } });
    if (result.ok) {
      setState("done");
      setEmail("");
    } else {
      setState("idle");
      setError(result.error);
    }
  };

  return (
    <Section>
      <Container>
        <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-accent/50 to-card p-5 shadow-sm sm:rounded-3xl sm:p-10">
          <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div className="min-w-0">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="size-5" aria-hidden />
              </span>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">
                Get the daily egg rate by email
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                One short email each morning with the national average and your city's price. No
                spam, unsubscribe any time.
              </p>
            </div>

            {state === "done" ? (
              <p
                role="status"
                className="inline-flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success"
              >
                <CheckCircle2 className="size-5" aria-hidden />
                You're subscribed — tomorrow's rate lands in your inbox.
              </p>
            ) : (
              <form onSubmit={onSubmit} noValidate className="w-full">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                  <Input
                    id="newsletter-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "newsletter-error" : undefined}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 rounded-xl bg-background text-base"
                  />
                  <Button type="submit" size="lg" disabled={state === "loading"} className="h-12 w-full sm:w-auto">
                    {state === "loading" ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : null}
                    Subscribe
                  </Button>
                </div>
                {error ? (
                  <p id="newsletter-error" role="alert" className="mt-2 text-sm text-destructive">
                    {error}
                  </p>
                ) : null}
              </form>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
