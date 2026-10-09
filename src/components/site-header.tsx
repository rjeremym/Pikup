import { Link, useLocation } from "@tanstack/react-router";
import { Menu, Pause, Play, Square, UserRound, LogOut, NotebookPen } from "lucide-react";
import { useState } from "react";
import { PRIMARY_NAV, findPage, primaryPathFor, type NavPage } from "@/lib/nav";
import { signOut, useAccount } from "@/lib/account";
import { fmtDuration } from "@/lib/tracker";
import { useSessionControls } from "@/lib/session-context";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function PageLinkContent({ page }: { page: NavPage }) {
  return (
    <>
      <page.icon className="mt-0.5 h-5 w-5 shrink-0 text-pencil" aria-hidden />
      <span className="min-w-0">
        <span className="block font-semibold">{page.label}</span>
        <span className="block text-sm text-muted-foreground">{page.blurb}</span>
      </span>
    </>
  );
}

export function SiteHeader() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const active = primaryPathFor(pathname);
  return (
    <header className="sticky top-0 z-40 border-b border-dashed border-pencil/40 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl flex-nowrap items-center gap-2 px-3 min-[820px]:gap-4 min-[820px]:px-4">
        <Link
          to="/"
          className="inline-flex h-10 shrink-0 items-center text-primary"
          aria-label="Pikup — home"
        >
          {/* This font's letters sit below the center of its line box. */}
          <span className="hand -translate-y-1 text-3xl leading-none">Pikup</span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden h-full items-center gap-2 sm:flex min-[820px]:gap-3"
        >
          {PRIMARY_NAV.map((page, index) => (
            <Link
              key={page.to}
              to={page.to}
              aria-label={page.label}
              aria-current={active === page.to ? "page" : undefined}
              className={cn(
                "relative inline-flex h-full shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
                (index === 2 || index === 4) && "ml-1 min-[820px]:ml-2",
                active === page.to &&
                  "text-primary after:absolute after:inset-x-0 after:bottom-2 after:h-0.5 after:rounded-full after:bg-primary",
              )}
            >
              <page.icon className="hidden h-4 w-4 shrink-0 lg:block" aria-hidden />
              {page.short ?? page.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 min-[820px]:gap-2">
          <SessionControls />
          <AccountMenu />
          <MobileMenu active={active} />
        </div>
      </div>
    </header>
  );
}

function SessionControls() {
  const { timer, pending, ready, startSession, endSession, finishNote } = useSessionControls();
  const action = pending ? finishNote : timer.running ? endSession : startSession;
  const label = pending
    ? "Finish your session note"
    : timer.running
      ? "End session and leave a note"
      : "Start session";
  const Icon = pending ? NotebookPen : timer.running ? Square : Play;
  return (
    <div
      className="flex shrink-0 items-center gap-1.5 min-[820px]:gap-2"
      aria-label="Session controls"
    >
      {timer.running && (
        <>
          <span
            className="hidden items-center gap-1.5 whitespace-nowrap text-xs font-semibold tabular-nums min-[960px]:inline-flex"
            aria-live="off"
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                timer.paused ? "bg-pencil" : "bg-accent-foreground",
              )}
              aria-hidden
            />
            {timer.paused && <span>Paused</span>}
            {fmtDuration(timer.elapsed)}
          </span>
          <button
            type="button"
            onClick={timer.togglePause}
            aria-label={timer.paused ? "Resume session" : "Pause session"}
            className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1 rounded-xl border border-pencil/40 bg-card px-1.5 text-xs tabular-nums transition-colors hover:bg-muted"
          >
            {timer.paused ? (
              <Play className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Pause className="h-3.5 w-3.5" aria-hidden />
            )}
            <span className="min-[960px]:hidden">
              {timer.paused ? "Paused" : fmtDuration(timer.elapsed)}
            </span>
          </button>
        </>
      )}
      <button
        type="button"
        disabled={!ready}
        onClick={action}
        aria-label={label}
        className="inline-flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-primary bg-primary px-2.5 text-xs font-extrabold text-primary-foreground shadow-[2px_3px_0_oklch(0.35_0.05_50/0.3)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-60 min-[820px]:px-3 min-[960px]:text-sm"
      >
        <Icon className="h-4 w-4" aria-hidden />
        <span className="hidden min-[380px]:inline">
          {pending ? (
            "Finish note"
          ) : timer.running ? (
            <>
              <span className="hidden md:inline">End & leave note</span>
              <span className="md:hidden">End & note</span>
            </>
          ) : (
            "Start session"
          )}
        </span>
        <span className="min-[380px]:hidden">
          {pending ? "Note" : timer.running ? "End" : "Start"}
        </span>
      </button>
    </div>
  );
}

function AccountMenu() {
  const account = useAccount();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-pencil/40 bg-card sm:inline-flex"
        aria-label="Account"
      >
        {account ? <Avatar name={account.name} /> : <UserRound className="h-4 w-4" aria-hidden />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="paper-card w-64 p-2">
        {account && <p className="px-2 py-2 text-sm font-semibold">{account.name}</p>}
        <DropdownMenuItem asChild>
          <Link to="/account">Account</Link>
        </DropdownMenuItem>
        {!account && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/account/sign-in">Sign in</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/account/create">Create account</Link>
            </DropdownMenuItem>
          </>
        )}
        {account && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/account/password">Change password</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={signOut}>
              <LogOut className="mr-2 h-4 w-4" aria-hidden />
              Sign out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-pencil bg-washi text-sm font-extrabold text-foreground",
        className,
      )}
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function MobileMenu({ active }: { active: string | undefined }) {
  const [open, setOpen] = useState(false);
  const account = useAccount();
  const close = () => setOpen(false);
  const secondary = [findPage("/account")];
  const linkClass = "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted";
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-pencil/40 bg-card sm:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[85%] max-w-sm overflow-y-auto border-l border-pencil bg-background"
      >
        <SheetTitle className="hand text-3xl font-normal text-primary">Pikup</SheetTitle>
        <SheetDescription>
          {account ? `Signed in as ${account.name}.` : "Where to next?"}
        </SheetDescription>
        <nav aria-label="Mobile navigation" className="mt-6 space-y-2">
          {PRIMARY_NAV.map((page, index) => (
            <Link
              key={page.to}
              to={page.to}
              onClick={close}
              aria-current={active === page.to ? "page" : undefined}
              className={cn(
                linkClass,
                (index === 2 || index === 4) && "mt-4",
                active === page.to && "bg-muted font-semibold text-primary",
              )}
            >
              <PageLinkContent page={{ ...page, label: page.short ?? page.label }} />
            </Link>
          ))}
          <div className="space-y-1 border-t border-dashed border-pencil/30 pt-3">
            {secondary.map((page) => (
              <Link key={page.to} to={page.to} onClick={close} className={linkClass}>
                <page.icon className="h-4 w-4" aria-hidden />
                {page.label}
              </Link>
            ))}
            {!account && (
              <>
                <Link to="/account/sign-in" onClick={close} className={linkClass}>
                  Sign in
                </Link>
                <Link to="/account/create" onClick={close} className={linkClass}>
                  Create account
                </Link>
              </>
            )}
            {account && (
              <>
                <Link to="/account/password" onClick={close} className={linkClass}>
                  Change password
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    close();
                  }}
                  className={linkClass}
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Sign out
                </button>
              </>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
