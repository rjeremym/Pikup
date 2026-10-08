import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageCard, PageHeader } from "@/components/section-layout";
import { findPage } from "@/lib/nav";
import {
  fmtDuration,
  fmtHours,
  lastNote,
  sessionsThisWeek,
  useTimer,
  weekSeconds,
  type Session,
} from "@/lib/tracker";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/momentum/")({
  head: () => ({
    meta: [
      { title: "Momentum — Pikup" },
      { name: "description", content: "Start a focus session and see how your week is adding up." },
    ],
  }),
  component: MomentumHub,
});

function MomentumHub() {
  const timer = useTimer();
  const [note, setNote] = useState<Session | undefined>();
  const [week, setWeek] = useState({ seconds: 0, sessions: 0 });

  useEffect(() => {
    setNote(lastNote());
    setWeek({ seconds: weekSeconds(), sessions: sessionsThisWeek().length });
  }, []);

  return (
    <>
      <PageHeader
        title="Momentum"
        lead="Keep going. Start a session, then see how the week is adding up."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <PageCard page={findPage("/momentum/timer")} sectionId="momentum">
          <p className="flex items-center gap-2 font-semibold">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                timer.running ? "animate-pulse bg-primary" : "bg-pencil/40",
              )}
              aria-hidden
            />
            {timer.running
              ? `${timer.paused ? "Paused" : "Running"} · ${fmtDuration(timer.elapsed)}`
              : "Ready when you are"}
          </p>
          <p className="mt-2 text-sm">
            <span className="font-semibold">Next up: </span>
            {note?.nextThing ? (
              <span className="scribble-underline">{note.nextThing}</span>
            ) : (
              <span className="text-muted-foreground italic">no note yet</span>
            )}
          </p>
        </PageCard>

        <PageCard page={findPage("/momentum/stats")} sectionId="momentum">
          <p>
            <span className="text-4xl font-extrabold">{fmtHours(week.seconds)}</span>{" "}
            <span className="text-muted-foreground">this week</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {week.sessions} {week.sessions === 1 ? "session" : "sessions"} since Monday
          </p>
        </PageCard>
      </div>
    </>
  );
}
