import type { RefObject } from "react";
import { ArrowDown, CheckCircle2, ChevronDown, CircleHelp, Hourglass, Shuffle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { OUTCOME_LABELS, fmtDuration, type Session } from "@/lib/tracker";
import { cn } from "@/lib/utils";
import { SessionOutcomeEditor } from "@/components/session-outcome-editor";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function TaskCompletionSummary({
  sessions,
  onViewSessions,
}: {
  sessions: Session[];
  onViewSessions: () => void;
}) {
  const completed = sessions.filter((session) => session.outcome === "completed").length;
  const inProgress = sessions.filter((session) => session.outcome === "in-progress").length;
  const other = sessions.filter((session) => session.outcome === "other").length;
  const unreported = sessions.length - completed - inProgress - other;

  return (
    <section
      aria-labelledby="task-completion-heading"
      className="paper-card relative px-6 pt-10 pb-6 sm:px-8"
    >
      <div className="absolute -top-3 left-8 h-7 w-24 -rotate-2 rounded-sm bg-accent/50" />
      <h2 id="task-completion-heading" className="hand text-4xl">
        Task completion
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">How your planned tasks went this week.</p>
      <p className="mt-6 flex items-baseline gap-3">
        <span className="text-5xl font-extrabold">{completed}</span>
        <span className="text-muted-foreground">
          {completed === 1
            ? "session completed its planned task"
            : "sessions completed their planned task"}
        </span>
      </p>
      <dl className="mt-6 grid grid-cols-3 gap-4 border-t-2 border-dashed border-pencil/30 pt-5">
        <OutcomeCount label="In progress" count={inProgress} />
        <OutcomeCount label="Different task" count={other} />
        <OutcomeCount label="Not recorded" count={unreported} />
      </dl>
      {sessions.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          Finish a session and record how your task went to see it here.
        </p>
      )}
      <button
        type="button"
        onClick={onViewSessions}
        className="sketch-link mt-4 min-h-11 text-base"
      >
        View &amp; edit sessions <ArrowDown className="h-4 w-4" aria-hidden />
      </button>
    </section>
  );
}

export function WeeklySessionList({
  sessions,
  open,
  onOpenChange,
  headingRef,
}: {
  sessions: Session[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const newestFirst = [...sessions].sort((a, b) => b.start - a.start);
  const preview = newestFirst.slice(0, 2);
  const remaining = newestFirst.slice(2);

  return (
    <section aria-labelledby="weekly-sessions-heading" className="paper-card lg:col-span-2">
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-x-3 gap-y-1 px-5 py-3 sm:px-8">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2
              id="weekly-sessions-heading"
              ref={headingRef}
              tabIndex={-1}
              className="hand scroll-mt-24 text-2xl sm:text-3xl"
            >
              This week’s sessions
            </h2>
            <span className="text-sm text-muted-foreground">
              {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
            </span>
          </div>
          {remaining.length > 0 && (
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-primary hover:text-foreground"
              >
                {open ? "Show fewer" : `Show ${remaining.length} more`}
                <ChevronDown className={cn("h-4 w-4", open && "rotate-180")} aria-hidden />
              </button>
            </CollapsibleTrigger>
          )}
        </div>
        <div className="border-t border-dashed border-pencil/30 px-5 pb-4 sm:px-8">
          {preview.length > 0 ? (
            <ol className="divide-y divide-dashed divide-pencil/30">
              {preview.map((session) => (
                <WeeklySessionRow key={session.id} session={session} />
              ))}
            </ol>
          ) : (
            <p className="py-5 text-sm text-muted-foreground">
              No sessions this week yet.{" "}
              <Link
                to="/momentum/timer"
                className="font-semibold underline decoration-dotted underline-offset-4"
              >
                Open Session
              </Link>{" "}
              when you’re ready to work.
            </p>
          )}
          {remaining.length > 0 && (
            <CollapsibleContent>
              <ol
                start={3}
                className="divide-y divide-dashed divide-pencil/30 border-t border-dashed border-pencil/30"
              >
                {remaining.map((session) => (
                  <WeeklySessionRow key={session.id} session={session} />
                ))}
              </ol>
            </CollapsibleContent>
          )}
        </div>
      </Collapsible>
    </section>
  );
}

function WeeklySessionRow({ session }: { session: Session }) {
  // Older completed outcomes stored the planned task as workedOn.
  const task =
    session.plannedTask || (session.outcome === "completed" ? session.workedOn : undefined);
  const Icon =
    session.outcome === "completed"
      ? CheckCircle2
      : session.outcome === "in-progress"
        ? Hourglass
        : session.outcome === "other"
          ? Shuffle
          : CircleHelp;
  const date = new Date(session.start);
  return (
    <li
      key={session.id}
      className="grid min-w-0 grid-cols-2 items-center gap-x-3 gap-y-2 py-3 text-sm md:grid-cols-[7rem_minmax(0,1fr)_5.5rem_9rem_auto]"
    >
      <time dateTime={date.toISOString()} className="order-1">
        <span className="block font-semibold">
          {date.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="block text-xs text-muted-foreground">
          {date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
        </span>
      </time>
      <p className="order-3 col-span-2 min-w-0 font-semibold break-words md:order-2 md:col-span-1">
        <span className="sr-only">Planned task: </span>
        {task || "No planned task recorded"}
      </p>
      <p className="order-2 text-right md:order-3 md:text-left">
        <span className="block text-xs text-muted-foreground">Deep work</span>
        <span className="font-semibold tabular-nums">{fmtDuration(session.durationSec)}</span>
      </p>
      <div className="order-4 col-span-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 md:contents">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 justify-self-start rounded-full border px-2 py-1 text-xs font-semibold md:order-4",
            session.outcome === "completed"
              ? "border-accent-foreground/30 bg-accent/40 text-foreground"
              : session.outcome === "in-progress"
                ? "border-pencil/30 bg-washi/50 text-foreground"
                : "border-pencil/30 bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {session.outcome ? OUTCOME_LABELS[session.outcome] : "Not recorded"}
        </span>
        <div className="md:order-5 md:justify-self-end">
          <SessionOutcomeEditor session={session} compact />
        </div>
      </div>
    </li>
  );
}

function OutcomeCount({ label, count }: { label: string; count: number }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-2xl font-extrabold sm:text-3xl">{count}</dd>
    </div>
  );
}
