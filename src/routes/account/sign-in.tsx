import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LogIn } from "lucide-react";
import { PageHeader } from "@/components/section-layout";
import { Notice, PasswordField, PrototypeNotice, TextField } from "@/components/form-bits";
import { EMAIL_PATTERN, signIn, useAccount } from "@/lib/account";

export const Route = createFileRoute("/account/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in — Pikup" },
      { name: "description", content: "Sign in to pick up where you left off." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const account = useAccount();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // errors appear after the first submit, then update live as you fix them
  const [submitted, setSubmitted] = useState(false);
  const [forgot, setForgot] = useState(false);

  const errors = {
    email: !email.trim()
      ? "Enter your email."
      : !EMAIL_PATTERN.test(email.trim())
        ? "That doesn't look like an email address."
        : undefined,
    password: password ? undefined : "Enter your password.",
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (errors.email || errors.password) return;
    signIn(email.trim());
    navigate({ to: "/account" });
  };

  return (
    <>
      <PageHeader title="Sign in" lead="Welcome back. Your next step is waiting." />
      <div className="max-w-md">
        {account && (
          <Notice className="mb-6">
            You're already signed in as <strong className="text-foreground">{account.email}</strong>
            . Signing in again switches accounts.
          </Notice>
        )}

        <form
          noValidate
          onSubmit={submit}
          className="paper-card relative space-y-5 px-6 pt-10 pb-6"
        >
          <div className="washi absolute -top-3 left-8 h-7 w-24 -rotate-3" />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={submitted ? errors.email : undefined}
          />
          <div>
            <PasswordField
              label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={submitted ? errors.password : undefined}
            />
            <button
              type="button"
              onClick={() => setForgot(true)}
              className="mt-2 text-sm text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
            >
              Forgot your password?
            </button>
            {forgot && (
              <p className="mt-1 text-sm text-muted-foreground" role="status">
                Password reset emails aren't part of this prototype yet.
              </p>
            )}
          </div>
          <button type="submit" className="sketch-btn-primary w-full">
            <LogIn className="h-5 w-5" aria-hidden /> Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            to="/account/create"
            className="font-semibold text-foreground underline decoration-dotted underline-offset-4"
          >
            Create an account
          </Link>
        </p>
        <PrototypeNotice className="mt-8" />
      </div>
    </>
  );
}
