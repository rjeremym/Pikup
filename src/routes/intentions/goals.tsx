import { useSessionRevision } from "@/lib/session-context";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, CalendarClock, Minus, Plus, Trash2, Undo2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Meter, PageHeader } from "@/components/section-layout";
import { Notice } from "@/components/form-bits";
import {
  getGoals,
  getWeeklyGoalHours,
  saveGoals,
  saveWeeklyGoalHours,
  type Goal,
} from "@/lib/intentions";
import { MILESTONES } from "@/lib/stickers";
import { fmtHours, fmtMinutes, sessionsThisWeek, weekSeconds } from "@/lib/tracker";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/intentions/goals")({
  head: () => ({
    meta: [
      { title: "Goals — Pikup" },
      {
        name: "description",
        content: "Set a weekly deep-work target and track the bigger milestones of your project.",
      },
    ],
  }),
  component: GoalsPage,
});

const MIN_TARGET = 1;
const MAX_TARGET = 40;

function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

function GoalsPage() {
  const revision = useSessionRevision();
  const [target, setTarget] = useState(6);
  const [week, setWeek] = useState({ seconds: 0, avg: 0 });
  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [removed, setRemoved] = useState<{ goal: Goal; index: number } | null>(null);

  useEffect(() => {
    const sessions = sessionsThisWeek();
    const seconds = weekSeconds();
    setTarget(getWeeklyGoalHours());
    setWeek({ seconds, avg: sessions.length ? seconds / sessions.length : 0 });
    setGoals(getGoals());
  }, [revision]);

  const changeTarget = (step: number) => {
    const next = Math.min(MAX_TARGET, Math.max(MIN_TARGET, target + step));
    saveWeeklyGoalHours(next);
    setTarget(next);
  };

  const commit = (next: Goal[]) => {
    saveGoals(next);
    setGoals(next);
  };

  const add = (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t || !goals) return;
    commit([...goals, { id: crypto.randomUUID(), title: t, due: due || undefined, done: false }]);
    setTitle("");
    setDue("");
    setRemoved(null);
  };

  const toggle = (id: string) =>
    goals && commit(goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));

  const remove = (id: string) => {
    if (!goals) return;
    const index = goals.findIndex((g) => g.id === id);
    setRemoved({ goal: goals[index]!, index });
    commit(goals.filter((g) => g.id !== id));
  };

  const undo = () => {
    if (!goals || !removed) return;
    const next = [...goals];
    next.splice(removed.index, 0, removed.goal);
    commit(next);
    setRemoved(null);
  };

  const remaining = Math.max(0, target * 3600 - week.seconds);
  const sessionsToGo = week.avg ? Math.ceil(remaining / week.avg) : 0;
  const nextSticker = MILESTONES.find((m) => week.seconds < m.hours * 3600);
  const open = goals?.filter((g) => !g.done) ?? [];
  const achieved = goals?.filter((g) => g.done) ?? [];

  return (
    <>
      <PageHeader
        title="Goals"
        lead="One number for the week, and a few bigger milestones for the project."
      />

      <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
        <section
          aria-labelledby="weekly-heading"
          className="paper-card relative self-start px-6 pt-10 pb-6"
        >
          <div className="absolute -top-3 left-8 h-7 w-24 -rotate-3 rounded-sm bg-accent/50" />
          <h2 id="weekly-heading" className="hand text-3xl">
            Weekly hours
          </h2>
          <p className="text-sm text-muted-foreground">Deep work from Monday to Sunday.</p>

          <p className="mt-5">
            <span className="text-5xl font-extrabold">{fmtHours(week.seconds)}</span>{" "}
            <span className="text-muted-foreground">of {target}h</span>
          </p>
          <Meter
            value={week.seconds}
            max={target * 3600}
            label="Progress toward your weekly goal"
            className="mt-3"
          />
          <p className="mt-2 text-sm" aria-live="polite">
            {remaining === 0
              ? "Goal met — nice work. Raise the bar?"
              : sessionsToGo
                ? `${fmtHours(remaining)} to go — about ${sessionsToGo} more ${sessionsToGo === 1 ? "session" : "sessions"} at your usual ${fmtMinutes(week.avg)}.`
                : `${fmtHours(remaining)} to go this week.`}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <span className="hand text-xl">Target</span>
            <button
              type="button"
              onClick={() => changeTarget(-1)}
              disabled={target <= MIN_TARGET}
              aria-label="Lower the weekly target by one hour"
              className="sketch-btn h-10 w-10 p-0"
            >
              <Minus className="h-4 w-4" />
            </button>
            <output aria-live="polite" className="w-14 text-center text-2xl font-extrabold">
              {target}h
            </output>
            <button
              type="button"
              onClick={() => changeTarget(1)}
              disabled={target >= MAX_TARGET}
              aria-label="Raise the weekly target by one hour"
              className="sketch-btn h-10 w-10 p-0"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {nextSticker && (
            <p className="mt-4 text-sm text-muted-foreground">
              Next sticker at {nextSticker.hours}h: {nextSticker.name}.
            </p>
          )}
          <Link to="/momentum/stats" className="sketch-link mt-3 text-base">
            see weekly stats <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>

        <section aria-labelledby="project-heading" className="paper-card relative px-6 pt-10 pb-6">
          <div className="washi absolute -top-3 right-10 h-7 w-24 rotate-2" />
          <h2 id="project-heading" className="hand text-3xl">
            Project goals
          </h2>
          <p className="text-sm text-muted-foreground">
            Big milestones. When one feels too big to start, break it into{" "}
            <Link
              to="/intentions/backlog"
              className="underline decoration-dotted underline-offset-4 hover:text-foreground"
            >
              backlog items
            </Link>
            .
          </p>

          <form onSubmit={add} className="mt-5 flex flex-wrap items-end gap-3">
            <div className="min-w-[12rem] flex-1">
              <label htmlFor="goal-title" className="sr-only">
                New goal
              </label>
              <input
                id="goal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ship the MVP"
                maxLength={80}
                className="sketch-input"
              />
            </div>
            <div>
              <label htmlFor="goal-due" className="block text-xs text-muted-foreground">
                Target date (optional)
              </label>
              <input
                id="goal-due"
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="sketch-input w-auto py-2"
              />
            </div>
            <button type="submit" disabled={!title.trim()} className="sketch-btn-primary text-xl">
              <Plus className="h-5 w-5" aria-hidden /> Add goal
            </button>
          </form>

          {removed && (
            <Notice className="mt-4">
              Removed “{removed.goal.title}”.{" "}
              <button
                type="button"
                onClick={undo}
                className="inline-flex items-center gap-1 font-semibold text-foreground underline decoration-dotted underline-offset-2"
              >
                <Undo2 className="h-3.5 w-3.5" aria-hidden /> Undo
              </button>
            </Notice>
          )}

          {goals && (
            <>
              <h3 className="mt-6 text-sm font-semibold text-muted-foreground">
                In progress ({open.length})
              </h3>
              {open.length ? (
                <ul className="mt-2 space-y-2">
                  {open.map((g) => (
                    <GoalRow key={g.id} goal={g} onToggle={toggle} onRemove={remove} />
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground italic">
                  No open goals. What would make this project feel finished?
                </p>
              )}

              {achieved.length > 0 && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground">
                    Achieved ({achieved.length})
                  </summary>
                  <ul className="mt-2 space-y-2">
                    {achieved.map((g) => (
                      <GoalRow key={g.id} goal={g} onToggle={toggle} onRemove={remove} />
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}

function GoalRow({
  goal,
  onToggle,
  onRemove,
}: {
  goal: Goal;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const overdue = !goal.done && goal.due !== undefined && goal.due < todayISO();
  const checkboxId = `goal-${goal.id}`;
  return (
    <li className="flex items-center gap-3 rounded-xl border-2 border-dashed border-pencil/40 bg-card px-3 py-2">
      <input
        id={checkboxId}
        type="checkbox"
        checked={goal.done}
        onChange={() => onToggle(goal.id)}
        className="h-5 w-5 shrink-0 accent-primary"
      />
      <label
        htmlFor={checkboxId}
        className={cn("flex-1 cursor-pointer", goal.done && "text-muted-foreground line-through")}
      >
        {goal.title}
      </label>
      {goal.due && (
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 text-xs",
            overdue ? "font-semibold text-primary" : "text-muted-foreground",
          )}
        >
          <CalendarClock className="h-3.5 w-3.5" aria-hidden />
          {overdue ? "overdue · " : "by "}
          {format(parseISO(goal.due), "MMM d")}
        </span>
      )}
      <button
        type="button"
        onClick={() => onRemove(goal.id)}
        aria-label={`Delete “${goal.title}”`}
        title="Delete"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
