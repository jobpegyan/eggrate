import * as React from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleButton } from "@/components/auth/google-button";
import { FieldError } from "@/components/forms/field-error";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SITE } from "@/lib/constants";
import { toast } from "@/lib/toast";
import {
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
  type ForgotPasswordValues,
  type SignInValues,
  type SignUpValues,
} from "@/lib/validation";

interface AuthSearch {
  redirect?: string;
  mode?: "signin" | "signup" | "forgot";
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: typeof search['redirect'] === "string" ? search['redirect'] : undefined,
    mode:
      search['mode'] === "signup" || search['mode'] === "forgot" || search['mode'] === "signin"
        ? search['mode']
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Sign in — ${SITE.name}` },
      {
        name: "description",
        content: `Sign in or create your ${SITE.name} account to manage egg rate data, alerts and dashboards.`,
      },
      { property: "og:title", content: `Sign in — ${SITE.name}` },
      { property: "og:description", content: `Secure account access for ${SITE.name}.` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

/** Only same-origin relative paths may be used as a post-login destination. */
function safeRedirect(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/admin";
  return value;
}

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const destination = safeRedirect(search.redirect);

  React.useEffect(() => {
    if (!loading && isAuthenticated) void navigate({ to: destination, replace: true });
  }, [loading, isAuthenticated, destination, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-xl font-bold">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
            {SITE.name}
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Secure access to your dashboard and admin tools.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <Tabs defaultValue={search.mode === "signup" ? "signup" : "signin"}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6">
              <SignInForm redirectTo={destination} />
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function SignInForm({ redirectTo }: { redirectTo: string }) {
  const navigate = useNavigate();
  const [forgotOpen, setForgotOpen] = React.useState(false);
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      toast.error("Could not sign in", error.message);
      return;
    }
    toast.success("Welcome back");
    await navigate({ to: redirectTo, replace: true });
  });

  if (forgotOpen) return <ForgotPasswordForm onBack={() => setForgotOpen(false)} />;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input id="signin-email" type="email" autoComplete="email" {...form.register("email")} />
        <FieldError message={form.formState.errors.email?.message} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="signin-password">Password</Label>
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            className="text-xs font-medium text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <Input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          {...form.register("password")}
        />
        <FieldError message={form.formState.errors.password?.message} />
      </div>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
      </Button>
      <Divider />
      <GoogleButton label="Continue with Google" />
    </form>
  );
}

function SignUpForm() {
  const [sent, setSent] = React.useState(false);
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: { full_name: values.fullName },
      },
    });
    if (error) {
      toast.error("Could not create account", error.message);
      return;
    }
    if (!data.session) {
      setSent(true);
      return;
    }
    toast.success("Account created");
  });

  if (sent) {
    return (
      <div className="space-y-3 text-center">
        <Mail className="mx-auto h-8 w-8 text-primary" aria-hidden />
        <h2 className="font-display text-lg font-semibold">Verify your email</h2>
        <p className="text-sm text-muted-foreground">
          We sent a confirmation link to your inbox. Click it to activate your account, then sign
          in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="signup-name">Full name</Label>
        <Input id="signup-name" autoComplete="name" {...form.register("fullName")} />
        <FieldError message={form.formState.errors.fullName?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input id="signup-email" type="email" autoComplete="email" {...form.register("email")} />
        <FieldError message={form.formState.errors.email?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          {...form.register("password")}
        />
        <FieldError message={form.formState.errors.password?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-confirm">Confirm password</Label>
        <Input
          id="signup-confirm"
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
          "Create account"
        )}
      </Button>
      <Divider />
      <GoogleButton label="Sign up with Google" />
    </form>
  );
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [sent, setSent] = React.useState(false);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error("Could not send reset link", error.message);
      return;
    }
    setSent(true);
  });

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <Mail className="mx-auto h-8 w-8 text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">
          If an account exists for that email, a password reset link is on its way.
        </p>
        <Button variant="outline" className="w-full" onClick={onBack}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email</Label>
        <Input id="forgot-email" type="email" autoComplete="email" {...form.register("email")} />
        <FieldError message={form.formState.errors.email?.message} />
      </div>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Send reset link"
        )}
      </Button>
      <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
        Back to sign in
      </Button>
    </form>
  );
}

function Divider() {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">or</span>
      </div>
    </div>
  );
}