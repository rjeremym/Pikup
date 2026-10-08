import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, House } from "lucide-react";
import type { ReactNode } from "react";
import {
  TONE,
  sectionById,
  trailFor,
  visibleChildren,
  type Crumb,
  type NavPage,
  type SectionId,
} from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * Wraps every page in a section: breadcrumbs say where you are, notebook-divider tabs show the
 * sibling pages, and the page itself renders below.
 */
export function SectionLayout({ sectionId }: { sectionId: SectionId }) {
  const section = sectionById(sectionId);
  const pathname = useLocation({ select: (l) => l.pathname });
  const tone = TONE[sectionId];
  const tabs: NavPage[] = [{ ...section, label: "Overview" }, ...visibleChildren(section)];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-5 pb-20">
      <Breadcrumbs trail={trailFor(pathname)} />

      <nav
        aria-label={`${section.label} pages`}
        className="mt-4 flex flex-wrap items-end gap-1 border-b-2 border-pencil/50"
      >
        {tabs.map((page) => (
          <Link
            key={page.to}
            to={page.to}
            activeOptions={{ exact: page.to === section.to }}
            className={cn(
              "font-hand -mb-[2px] inline-flex items-center gap-1.5 rounded-t-xl border-2 border-transparent bg-muted/80 bg-clip-padding px-2.5 py-1.5 text-base text-muted-foreground transition-colors hover:text-foreground sm:px-4 sm:text-lg",
              "data-[status=active]:border-pencil/50 data-[status=active]:border-b-background data-[status=active]:bg-background data-[status=active]:text-foreground",
              tone.tabActive,
            )}
          >
            <page.icon className="hidden h-4 w-4 sm:block" aria-hidden />
            {page.short ? (
              <>
                <span className="sm:hidden">{page.short}</span>
                <span className="hidden sm:inline">{page.label}</span>
              </>
            ) : (
              page.label
            )}
          </Link>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}

function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={crumb.to} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden />}
              {last ? (
                <span aria-current="page" className="font-semibold text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to}
                  className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-4 hover:text-foreground"
                >
                  {i === 0 && <House className="h-3.5 w-3.5" aria-hidden />}
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mt-8 mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="hand text-4xl sm:text-5xl">{title}</h1>
        {lead && <p className="mt-1 max-w-2xl text-muted-foreground">{lead}</p>}
      </div>
      {children}
    </header>
  );
}

/** A whole-card link to a child page, with a live preview of what's inside. Used on hub pages. */
export function PageCard({
  page,
  sectionId,
  children,
}: {
  page: NavPage;
  sectionId: SectionId;
  children?: ReactNode;
}) {
  return (
    <Link
      to={page.to}
      className="paper-card group relative flex flex-col px-6 pt-9 pb-5 transition-transform hover:-translate-y-1"
    >
      <span
        className={cn("absolute -top-3 left-6 h-6 w-20 -rotate-2 rounded-sm", TONE[sectionId].tape)}
        aria-hidden
      />
      <span className="flex items-center gap-2">
        <page.icon className="h-5 w-5 text-pencil" aria-hidden />
        <span className="hand text-3xl">{page.label}</span>
      </span>
      <span className="mt-1 text-sm text-muted-foreground">{page.blurb}</span>
      {children && <div className="mt-5 flex-1">{children}</div>}
      <span className="sketch-link mt-5 self-start group-hover:text-foreground">
        Open {page.label.toLowerCase()} <ArrowRight className="h-4 w-4" aria-hidden />
      </span>
    </Link>
  );
}

/** Horizontal progress meter; the track is a lighter step of the fill's own colour. */
export function Meter({
  value,
  max,
  label,
  className,
}: {
  value: number;
  max: number;
  label: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn("h-3 overflow-hidden rounded-full bg-accent/25", className)}
    >
      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}
