import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/forms/field-error";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/constants";
import { toast } from "@/lib/toast";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validation";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: `Reset password — ${SITE.name}` },
      { name: "description", content: `Choose a new password for your ${SITE.name} account.` },
      { property: "og:title", content: `Reset password — ${SITE.name}` },
      { property: "og:description", content: `Set a new password for ${SITE.name}.` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    void supabase.auth.getSession().then(({ data: session }) => {
      if (session.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      toast.error("Could not update password", error.message);
      return;
    }
    toast.success("Password updated", "You can now use your new password.");
    await navigate({ to: "/admin", replace: true });
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 text-center">
          <KeyRound className="mx-auto h-6 w-6 text-primary" aria-hidden />
          <h1 className="mt-3 font-display text-xl font-semibold">Set a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a strong password of at least 8 characters.
          </p>
        </div>

        {!ready ? (
          <p className="text-center text-sm text-muted-foreground">
            Open this page from the reset link in your email to continue.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                {...form.register("password")}
              />
              <FieldError message={form.formState.errors.password?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                {...form.register("confirmPassword")}
              />
              <FieldError message={form.formState.errors.confirmPassword?.message} />
            </div>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}