import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { AuthCard, Notice, PasswordField, TextField } from "@/components/form-bits";
import { EMAIL_PATTERN, signIn, useAccount } from "@/lib/account";

export const Route = createFileRoute("/account/sign-in")({
  head: () => ({
    meta: [
      { title: "Log in — Pikup" },
      { name: "description", content: "Log in to pick up where you left off." },
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
    toast.success("You're logged in. Your data is saved to your account.");
    // happy path: back to the summary, where setting goals is the next step
    navigate({ to: "/momentum/stats" });
  };

  return (
    <AuthCard
      title="Log in"
      lead="Welcome back. Your next step is waiting."
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to="/account/create"
            className="font-semibold text-foreground underline decoration-dotted underline-offset-4"
          >
            Create one
          </Link>
        </>
      }
    >
      {account && (
        <Notice className="mb-6">
          You're already logged in as <strong className="text-foreground">{account.email}</strong>.
          Logging in again switches accounts.
        </Notice>
      )}

      <form noValidate onSubmit={submit} className="space-y-5">
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
          <div className="mt-2 text-right">
            <button
              type="button"
              onClick={() => setForgot(true)}
              className="text-sm text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
            >
              Forgot your password?
            </button>
            {forgot && (
              <p className="mt-1 text-sm text-muted-foreground" role="status">
                Password reset emails aren't part of this prototype yet.
              </p>
            )}
          </div>
        </div>
        <button type="submit" className="sketch-btn-primary w-full">
          <LogIn className="h-5 w-5" aria-hidden /> Log in
        </button>
      </form>
    </AuthCard>
  );
}
