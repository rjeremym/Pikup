import { Link, Outlet } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { TONE, type NavPage, type SectionId } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Wraps every page in a section. The main destinations live in the header, so no extra nav here. */
export function SectionLayout() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-1 pb-20">
      <Outlet />
    </div>
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
