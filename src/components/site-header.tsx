import { Link, useLocation } from "@tanstack/react-router";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { ChevronDown, House, LogOut, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  SECTIONS,
  TONE,
  isWithin,
  sectionById,
  visibleChildren,
  type NavPage,
  type NavSection,
} from "@/lib/nav";
import { signOut, useAccount } from "@/lib/account";
import { fmtDuration, useTimer } from "@/lib/tracker";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** Icon + label + one-line description; the same row is used in every menu so links read alike. */
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
  const pathname = useLocation({ select: (l) => l.pathname });
  const contentSections = SECTIONS.filter((s) => s.id !== "account");

  return (
    <header className="sticky top-0 z-40 border-b-2 border-dashed border-pencil/40 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-2 px-4">
        <Link to="/" className="hand mr-2 text-3xl text-primary sm:mr-4" aria-label="Pikup — home">
          Pikup
        </Link>

        <NavigationMenu.Root aria-label="Main" className="hidden md:block">
          <NavigationMenu.List className="flex items-center gap-1">
            {contentSections.map((s) => (
              <SectionMenu key={s.id} section={s} pathname={pathname} />
            ))}
          </NavigationMenu.List>
        </NavigationMenu.Root>

        <div className="ml-auto flex items-center gap-2">
          <SessionPill pathname={pathname} />
          <AccountMenu pathname={pathname} />
          <MobileMenu pathname={pathname} />
        </div>
      </div>
    </header>
  );
}

/** A section trigger that drops down its overview + child pages. */
function SectionMenu({
  section,
  pathname,
  trigger,
  align = "left",
  footer,
}: {
  section: NavSection;
  pathname: string;
  trigger?: ReactNode;
  align?: "left" | "right";
  footer?: ReactNode;
}) {
  const tone = TONE[section.id];
  const here = isWithin(pathname, section.to);

  return (
    <NavigationMenu.Item className="relative">
      <NavigationMenu.Trigger
        className={cn(
          "group hand relative inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xl text-foreground/75 transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted",
          here && "text-foreground",
        )}
      >
        {trigger ?? (
          <>
            <span className={cn("h-2.5 w-2.5 rounded-full", tone.dot)} aria-hidden />
            {section.label}
          </>
        )}
        {here && <span className="sr-only">(current section)</span>}
        <ChevronDown
          className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180"
          aria-hidden
        />
        {/* "you are here" mark under the section we're in */}
        {here && (
          <span
            className={cn("absolute inset-x-3 -bottom-1 h-1 rounded-full", tone.bar)}
            aria-hidden
          />
        )}
      </NavigationMenu.Trigger>

      <NavigationMenu.Content
        className={cn("absolute top-full mt-3 w-80", align === "right" ? "right-0" : "left-0")}
      >
        <div className="paper-card p-2">
          <NavigationMenu.Link asChild active={pathname === section.to}>
            <Link to={section.to} className="block rounded-xl px-3 py-2 hover:bg-muted">
              <span className={cn("hand text-2xl", tone.text)}>{section.label}</span>
              <span className="ml-2 text-sm text-muted-foreground">overview →</span>
              <span className="block text-sm text-muted-foreground">{section.blurb}</span>
            </Link>
          </NavigationMenu.Link>
          <ul className="mx-3 mt-1 mb-1 border-t-2 border-dashed border-pencil/30 pt-1">
            {visibleChildren(section).map((page) => (
              <li key={page.to}>
                <NavigationMenu.Link asChild active={isWithin(pathname, page.to)}>
                  <Link
                    to={page.to}
                    className="-mx-3 flex gap-3 rounded-xl px-3 py-2 hover:bg-muted data-[active]:bg-muted"
                  >
                    <PageLinkContent page={page} />
                  </Link>
                </NavigationMenu.Link>
              </li>
            ))}
          </ul>
          {footer}
        </div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  );
}

function AccountMenu({ pathname }: { pathname: string }) {
  const account = useAccount();
  const section = sectionById("account");

  return (
    <NavigationMenu.Root aria-label="Account" className="hidden md:block">
      <NavigationMenu.List>
        <SectionMenu
          section={section}
          pathname={pathname}
          align="right"
          trigger={
            account ? (
              <>
                <Avatar name={account.name} />
                <span className="max-w-[8rem] truncate">{account.name.split(" ")[0]}</span>
              </>
            ) : (
              <>
                <span className={cn("h-2.5 w-2.5 rounded-full", TONE.account.dot)} aria-hidden />
                Account
              </>
            )
          }
          footer={
            <p className="mx-3 border-t-2 border-dashed border-pencil/30 pt-2 pb-1 text-xs text-muted-foreground">
              {account ? (
                <>
                  Signed in as {account.email}.{" "}
                  <button
                    type="button"
                    onClick={signOut}
                    className="inline-flex items-center gap-1 font-semibold text-foreground underline decoration-dotted underline-offset-2"
                  >
                    <LogOut className="h-3 w-3" aria-hidden /> Sign out
                  </button>
                </>
              ) : (
                "Not signed in — your sessions are saved in this browser only."
              )}
            </p>
          }
        />
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-pencil bg-washi font-body text-sm font-extrabold text-foreground",
        className,
      )}
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

/** Visible anywhere except the timer itself, so a running session is never forgotten. */
function SessionPill({ pathname }: { pathname: string }) {
  const timer = useTimer();
  if (!timer.running || isWithin(pathname, "/momentum/timer")) return null;

  return (
    <Link
      to="/momentum/timer"
      className="inline-flex items-center gap-2 rounded-full border-2 border-primary/60 bg-card px-3 py-1 text-sm font-semibold tabular-nums transition-transform hover:-translate-y-0.5"
    >
      <span
        className={cn("h-2 w-2 rounded-full bg-primary", !timer.paused && "animate-pulse")}
        aria-hidden
      />
      {timer.paused ? "Paused" : fmtDuration(timer.elapsed)}
      <span className="sr-only">— session running, back to the timer</span>
    </Link>
  );
}

/** Phones get the whole tree at once: sections with their pages indented beneath. */
function MobileMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const account = useAccount();
  const close = () => setOpen(false);
  const linkClass =
    "flex gap-3 rounded-xl px-3 py-2 hover:bg-muted data-[status=active]:bg-muted data-[status=active]:font-semibold";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-pencil/60 bg-card md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[85%] max-w-sm overflow-y-auto border-l-2 border-pencil bg-background"
      >
        <SheetTitle className="hand text-3xl font-normal text-primary">Pikup</SheetTitle>
        <SheetDescription>
          {account ? `Signed in as ${account.name}.` : "Where to next?"}
        </SheetDescription>

        <nav aria-label="Main" className="mt-6 space-y-5">
          <Link
            to="/"
            onClick={close}
            activeOptions={{ exact: true }}
            className={cn(linkClass, "hand text-2xl")}
          >
            <House className="mt-1 h-5 w-5 text-pencil" aria-hidden /> Home
          </Link>
          {SECTIONS.map((section) => {
            const tone = TONE[section.id];
            return (
              <div key={section.id}>
                <Link
                  to={section.to}
                  onClick={close}
                  activeOptions={{ exact: true }}
                  className={cn(linkClass, "hand items-center text-2xl", tone.text)}
                >
                  <span className={cn("h-3 w-3 rounded-full", tone.dot)} aria-hidden />
                  {section.label}
                  {isWithin(pathname, section.to) && (
                    <span className="sr-only">(current section)</span>
                  )}
                </Link>
                <ul className="mt-1 ml-4 border-l-2 border-dashed border-pencil/40 pl-2">
                  {visibleChildren(section).map((page) => (
                    <li key={page.to}>
                      <Link to={page.to} onClick={close} className={linkClass}>
                        <PageLinkContent page={page} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {account && (
            <button
              type="button"
              onClick={() => {
                signOut();
                close();
              }}
              className="sketch-link"
            >
              <LogOut className="h-4 w-4" aria-hidden /> Sign out
            </button>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
