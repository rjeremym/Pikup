import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/section-layout";
import { Checklist, PasswordField, PrototypeNotice, TextField } from "@/components/form-bits";
import { EMAIL_PATTERN, createAccount, passwordChecks } from "@/lib/account";

export const Route = createFileRoute("/account/create")({
  head: () => ({
    meta: [
      { title: "Create account — Pikup" },
      { name: "description", content: "Create a Pikup account to keep your notes everywhere." },
    ],
  }),
  component: CreateAccountPage,
});

function CreateAccountPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const checks = passwordChecks(password, confirm);
  const errors = {
    name: name.trim() ? undefined : "What should we call you?",
    email: !email.trim()
      ? "Enter your email."
      : !EMAIL_PATTERN.test(email.trim())
        ? "That doesn't look like an email address."
        : undefined,
    password: checks.slice(0, 2).every((c) => c.met)
      ? undefined
      : "Your password needs at least 8 characters and a number.",
    confirm: checks[2]!.met ? undefined : "The passwords don't match yet.",
  };
  const show = (msg: string | undefined) => (submitted ? msg : undefined);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    createAccount({ name: name.trim(), email: email.trim() });
    navigate({ to: "/account" });
  };

  return (
    <>
      <PageHeader
        title="Create account"
        lead="Takes about thirty seconds. Everything you've already saved comes with you."
      />
      <div className="max-w-md">
        <form
          noValidate
          onSubmit={submit}
          className="paper-card relative space-y-5 px-6 pt-10 pb-6"
        >
          <div className="washi absolute -top-3 left-8 h-7 w-24 -rotate-3" />
          <TextField
            label="Name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={show(errors.name)}
          />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={show(errors.email)}
          />
          <PasswordField
            label="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={show(errors.password)}
          />
          <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={show(errors.confirm)}
          />
          <Checklist items={checks} />
          <button type="submit" className="sketch-btn-primary w-full">
            <UserPlus className="h-5 w-5" aria-hidden /> Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have one?{" "}
          <Link
            to="/account/sign-in"
            className="font-semibold text-foreground underline decoration-dotted underline-offset-4"
          >
            Sign in
          </Link>
        </p>
        <PrototypeNotice className="mt-8" />
      </div>
    </>
  );
}
