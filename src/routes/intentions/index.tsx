import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Meter, PageCard, PageHeader } from "@/components/section-layout";
import { findPage } from "@/lib/nav";
import {
  UP_NEXT_LIMIT,
  getBacklog,
  getGoals,
  getWeeklyGoalHours,
  type BacklogItem,
  type Goal,
} from "@/lib/intentions";
import { fmtHours, getSessions, weekSeconds, type Session } from "@/lib/tracker";

export const Route = createFileRoute("/intentions/")({
  head: () => ({
    meta: [
      { title: "Intentions — Pikup" },
      {
        name: "description",
        content: "Goals, a product backlog and every note you've left yourself.",
      },
    ],
  }),
  component: IntentionsHub,
});

interface Snapshot {
  goalHours: number;
  week: number;
  goals: Goal[];
  backlog: BacklogItem[];
  notes: Session[];
}

function IntentionsHub() {
  const [data, setData] = useState<Snapshot | null>(null);

  useEffect(() => {
    setData({
      goalHours: getWeeklyGoalHours(),
      week: weekSeconds(),
      goals: getGoals(),
      backlog: getBacklog(),
      notes: getSessions().filter((s) => s.workedOn || s.nextThing),
    });
  }, []);

  const upNext = data?.backlog.filter((i) => i.lane === "next") ?? [];
  const openGoals = data?.goals.filter((g) => !g.done).length ?? 0;
  const latest = data?.notes[data.notes.length - 1];

  return (
    <>
      <PageHeader title="Intentions" lead="Know where you're headed before you sit down." />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <PageCard page={findPage("/intentions/goals")} sectionId="intentions">
          <p className="text-sm">
            <span className="text-3xl font-extrabold">{fmtHours(data?.week ?? 0)}</span>{" "}
            <span className="text-muted-foreground">of {data?.goalHours ?? 6}h this week</span>
          </p>
          <Meter
            value={data?.week ?? 0}
            max={(data?.goalHours ?? 6) * 3600}
            label="Progress toward your weekly goal"
            className="mt-2"
          />
          <p className="mt-3 text-sm text-muted-foreground">
            {openGoals} project {openGoals === 1 ? "goal" : "goals"} in progress
          </p>
        </PageCard>

        <PageCard page={findPage("/intentions/backlog")} sectionId="intentions">
          <p className="text-sm font-semibold">
            Up next · {upNext.length}/{UP_NEXT_LIMIT}
          </p>
          {upNext.length ? (
            <ul className="mt-1 list-inside list-disc text-sm">
              {upNext.map((i) => (
                <li key={i.id} className="truncate">
                  {i.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground italic">Nothing queued yet.</p>
          )}
        </PageCard>

        <PageCard page={findPage("/intentions/notes")} sectionId="intentions">
          <p className="text-sm">
            <span className="text-3xl font-extrabold">{data?.notes.length ?? 0}</span>{" "}
            <span className="text-muted-foreground">
              {data?.notes.length === 1 ? "note" : "notes"} so far
            </span>
          </p>
          <p className="mt-2 text-sm">
            {latest?.nextThing ? (
              <>
                <span className="font-semibold">Latest next up: </span>
                {latest.nextThing}
              </>
            ) : (
              <span className="text-muted-foreground italic">
                Notes appear when you end a session — there are examples to browse meanwhile.
              </span>
            )}
          </p>
        </PageCard>
      </div>
    </>
  );
}
