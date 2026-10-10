import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, LogOut, UserPlus } from "lucide-react";
import { AuthCard } from "@/components/form-bits";
import { Avatar } from "@/components/site-header";
import { signOut, useAccount } from "@/lib/account";

export const Route = createFileRoute("/account/")({
  head: () => ({
    meta: [
      { title: "Account — Pikup" },
      { name: "description", content: "Log in, create an account or change your password." },
    ],
  }),
  component: AccountHub,
});

function AccountHub() {
  const account = useAccount();

  if (!account) {
    return (
      <AuthCard
        title="Your account"
        lead="Pikup works without an account. Make one when you want your data saved."
        footer={
          <>
            Already have an account?{" "}
            <Link
              to="/account/sign-in"
              className="font-semibold text-foreground underline decoration-dotted underline-offset-4"
            >
              Log in
            </Link>
          </>
        }
      >
        <Link to="/account/create" className="sketch-btn-primary w-full">
          <UserPlus className="h-5 w-5" aria-hidden /> Create account
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Your account"
      lead="You're logged in. Your sessions, goals and notes follow you."
    >
      <div className="flex items-center gap-4">
        <Avatar name={account.name} className="h-14 w-14 text-2xl" />
        <div className="min-w-0">
          <h2 className="hand truncate text-3xl">{account.name}</h2>
          <p className="truncate text-sm text-muted-foreground">{account.email}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3">
        <Link to="/account/password" className="sketch-btn">
          <KeyRound className="h-5 w-5" aria-hidden /> Change password
        </Link>
        <button type="button" onClick={signOut} className="sketch-btn">
          <LogOut className="h-5 w-5" aria-hidden /> Log out
        </button>
      </div>
    </AuthCard>
  );
}
