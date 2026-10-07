import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, LogIn, LogOut, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/section-layout";
import { PrototypeNotice } from "@/components/form-bits";
import { Avatar } from "@/components/site-header";
import { signOut, useAccount } from "@/lib/account";

export const Route = createFileRoute("/account/")({
  head: () => ({
    meta: [
      { title: "Account — Pikup" },
      { name: "description", content: "Sign in, create an account or change your password." },
    ],
  }),
  component: AccountHub,
});

function AccountHub() {
  const account = useAccount();

  return (
    <>
      <PageHeader
        title="Account"
        lead={
          account
            ? "You're signed in. Your sessions, goals and notes follow you."
            : "Pikup works without an account. Make one when you want your notes on more than one computer."
        }
      />

      <div className="max-w-xl">
        {account ? (
          <section className="paper-card relative px-6 pt-10 pb-6">
            <div className="washi absolute -top-3 left-8 h-7 w-24 -rotate-3" />
            <div className="flex items-center gap-4">
              <Avatar name={account.name} className="h-14 w-14 text-2xl" />
              <div className="min-w-0">
                <h2 className="hand truncate text-3xl">{account.name}</h2>
                <p className="truncate text-sm text-muted-foreground">{account.email}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/account/password" className="sketch-btn">
                <KeyRound className="h-5 w-5" aria-hidden /> Change password
              </Link>
              <button type="button" onClick={signOut} className="sketch-btn">
                <LogOut className="h-5 w-5" aria-hidden /> Sign out
              </button>
            </div>
          </section>
        ) : (
          <section className="paper-card relative px-6 pt-10 pb-6">
            <div className="washi absolute -top-3 left-8 h-7 w-24 -rotate-3" />
            <h2 className="hand text-3xl">You're using Pikup without an account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you've saved lives in this browser only. An account keeps it safe if you
              switch computers or clear your browser.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/account/create" className="sketch-btn-primary text-xl">
                <UserPlus className="h-5 w-5" aria-hidden /> Create account
              </Link>
              <Link to="/account/sign-in" className="sketch-btn">
                <LogIn className="h-5 w-5" aria-hidden /> Sign in
              </Link>
            </div>
          </section>
        )}

        <PrototypeNotice className="mt-8" />
      </div>
    </>
  );
}
