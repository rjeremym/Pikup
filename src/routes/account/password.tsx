import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { KeyRound, Lock } from "lucide-react";
import { PageHeader } from "@/components/section-layout";
import { Checklist, Notice, PasswordField, PrototypeNotice } from "@/components/form-bits";
import { passwordChecks, useAccount } from "@/lib/account";

export const Route = createFileRoute("/account/password")({
  head: () => ({
    meta: [
      { title: "Change password — Pikup" },
      { name: "description", content: "Swap in a new password for your Pikup account." },
    ],
  }),
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const account = useAccount();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const checks = [
    ...passwordChecks(next, confirm),
    { label: "Different from your current password", met: next.length > 0 && next !== current },
  ];
  const errors = {
    current: current ? undefined : "Enter your current password.",
    next:
      checks[0]!.met && checks[1]!.met && checks[3]!.met
        ? undefined
        : "Pick a new password that meets the checklist below.",
    confirm: checks[2]!.met ? undefined : "The new passwords don't match yet.",
  };
  const show = (msg: string | undefined) => (submitted ? msg : undefined);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    // prototype: nothing to send anywhere, so just confirm and reset the form
    setSaved(true);
    setSubmitted(false);
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  return (
    <>
      <PageHeader
        title="Change password"
        lead="Choose something new that you haven't used here before."
      />
      <div className="max-w-md">
        {/* Constraint: the form only works for a signed-in account, and says why */}
        {!account && (
          <Notice className="mb-6">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Lock className="h-4 w-4" aria-hidden /> Sign in first
            </span>
            You need to be signed in to change a password.{" "}
            <Link
              to="/account/sign-in"
              className="font-semibold text-foreground underline decoration-dotted underline-offset-2"
            >
              Sign in
            </Link>{" "}
            or{" "}
            <Link
              to="/account/create"
              className="font-semibold text-foreground underline decoration-dotted underline-offset-2"
            >
              create an account
            </Link>
            .
          </Notice>
        )}
        {saved && (
          <Notice tone="success" className="mb-6">
            <strong>Password updated.</strong> (Prototype: nothing was actually changed.)
          </Notice>
        )}

        <form noValidate onSubmit={submit} className="paper-card relative px-6 pt-10 pb-6">
          <div className="washi absolute -top-3 left-8 h-7 w-24 -rotate-3" />
          <fieldset disabled={!account} className="space-y-5 disabled:opacity-60">
            <legend className="sr-only">Change password</legend>
            {/* lets password managers know which account this is for */}
            {account && (
              <input type="email" autoComplete="username" value={account.email} readOnly hidden />
            )}
            <PasswordField
              label="Current password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => {
                setCurrent(e.target.value);
                setSaved(false);
              }}
              error={show(errors.current)}
            />
            <PasswordField
              label="New password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => {
                setNext(e.target.value);
                setSaved(false);
              }}
              error={show(errors.next)}
            />
            <PasswordField
              label="Confirm new password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setSaved(false);
              }}
              error={show(errors.confirm)}
            />
            <Checklist items={checks} />
            <button type="submit" className="sketch-btn-primary w-full">
              <KeyRound className="h-5 w-5" aria-hidden /> Update password
            </button>
          </fieldset>
        </form>
        <PrototypeNotice className="mt-8" />
      </div>
    </>
  );
}
