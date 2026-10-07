import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Lock, Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
  recentWeeks,
  weekSeconds,
  sessionsThisWeek,
  daysThisWeek,
  dayStreak,
  fmtHours,
  fmtMinutes,
  getUnlockedStickers,
  unlockSticker,
  getPlacedSticker,
  placeSticker,
  type DayBucket,
  type WeekBucket,
} from "@/lib/tracker";
import { getWeeklyGoalHours } from "@/lib/intentions";
import { MILESTONES, STICKER_IMAGES } from "@/lib/stickers";
import { Meter, PageHeader } from "@/components/section-layout";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/momentum/stats")({
  head: () => ({
    meta: [
      { title: "Weekly stats — Pikup" },
      {
        name: "description",
        content: "Your deep-work hours by week — a light sketch of your progress, not a dashboard.",
      },
      { property: "og:title", content: "Weekly stats — Pikup" },
      {
        property: "og:description",
        content: "Your deep-work hours by week — a light sketch of your progress, not a dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const [weeks, setWeeks] = useState<WeekBucket[]>([]);
  const [days, setDays] = useState<DayBucket[]>([]);
  const [thisWeek, setThisWeek] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [streak, setStreak] = useState(0);
  const [goalHours, setGoalHours] = useState(6);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [placed, setPlaced] = useState<string | null>(null);

  useEffect(() => {
    const ws = weekSeconds();
    setWeeks(recentWeeks(6));
    setDays(daysThisWeek());
    setThisWeek(ws);
    setSessions(sessionsThisWeek().length);
    setStreak(dayStreak());
    setGoalHours(getWeeklyGoalHours());
    // auto-unlock any milestone earned this week
    MILESTONES.forEach((m) => {
      if (ws >= m.hours * 3600) unlockSticker(m.sticker);
    });
    setUnlocked(getUnlockedStickers());
    setPlaced(getPlacedSticker());
  }, []);

  const maxSec = Math.max(...weeks.map((w) => w.seconds), 1);
  const lastWeek = weeks.length >= 2 ? weeks[weeks.length - 2]!.seconds : 0;

  return (
    <>
      <PageHeader title="Weekly stats" lead="A light sketch of your progress, not a dashboard." />

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="paper-card relative px-6 pt-10 pb-6 sm:px-8 lg:col-span-2">
          <div className="washi absolute -top-3 right-10 h-7 w-24 rotate-3" />
          <h2 className="hand text-4xl">This week: {fmtHours(thisWeek)} of deep work</h2>
          <WeekDelta thisWeek={thisWeek} lastWeek={lastWeek} />

          <dl className="mt-6 grid grid-cols-3 gap-4 border-t-2 border-dashed border-pencil/30 pt-5">
            <Figure label="Sessions" value={String(sessions)} />
            <Figure
              label="Average session"
              value={sessions ? fmtMinutes(thisWeek / sessions) : "—"}
            />
            <Figure label="Day streak" value={`${streak} ${streak === 1 ? "day" : "days"}`} />
          </dl>

          <div className="mt-6">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold">Weekly goal</span>
              <span className="text-muted-foreground">
                {fmtHours(thisWeek)} of {goalHours}h
              </span>
            </div>
            <Meter
              value={thisWeek}
              max={goalHours * 3600}
              label="Progress toward your weekly goal"
              className="mt-1.5"
            />
            <Link to="/intentions/goals" className="sketch-link mt-2 text-base">
              adjust your goal <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        <section className="paper-card px-6 pt-8 pb-6 sm:px-8">
          <h2 className="hand text-3xl">Day by day</h2>
          <p className="text-sm text-muted-foreground">Hours of deep work, Monday to Sunday.</p>
          <DayChart days={days} />
        </section>

        <section className="paper-card px-6 pt-8 pb-6 sm:px-8">
          <h2 className="hand text-3xl">Last 6 weeks</h2>
          <p className="text-sm text-muted-foreground">Hours per week, oldest first.</p>
          <div className="mt-6 space-y-3">
            {weeks.map((w, i) => (
              <div key={w.weekStart} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-xs text-muted-foreground">
                  {i === weeks.length - 1 ? "this wk" : w.label}
                </span>
                <div className="h-6 flex-1 rounded-full border-2 border-dashed border-pencil/50 p-0.5">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{
                      width: `${Math.max((w.seconds / maxSec) * 100, w.seconds > 0 ? 6 : 0)}%`,
                    }}
                  />
                </div>
                <span className="hand w-12 shrink-0 text-right text-lg">{fmtHours(w.seconds)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="paper-card px-6 pt-8 pb-8 sm:px-8 lg:col-span-2">
          <h2 className="hand text-3xl">Sticker shelf</h2>
          <p className="text-sm text-muted-foreground">
            Hit a weekly milestone to unlock a sticker — tap one to pin it on your timer.
          </p>
          <div className="mt-4 grid max-w-xl grid-cols-5 gap-3">
            {MILESTONES.map((m) => {
              const has = unlocked.includes(m.sticker);
              const isPlaced = placed === m.sticker;
              return (
                <button
                  key={m.sticker}
                  disabled={!has}
                  onClick={() => {
                    const next = isPlaced ? null : m.sticker;
                    placeSticker(next);
                    setPlaced(next);
                  }}
                  title={`${m.name} — ${m.hours}h in a week`}
                  className={`relative flex aspect-square items-center justify-center rounded-2xl border-2 p-1 transition-transform ${
                    isPlaced
                      ? "border-primary bg-washi -rotate-3"
                      : has
                        ? "border-pencil/60 bg-card hover:-translate-y-1"
                        : "border-dashed border-input bg-muted/40"
                  }`}
                >
                  {has ? (
                    <img
                      src={STICKER_IMAGES[m.sticker]}
                      alt={m.name}
                      className="max-h-full"
                      loading="lazy"
                      width={160}
                      height={160}
                    />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="hand absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-card px-2 text-sm whitespace-nowrap">
                    {m.hours}h
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-extrabold sm:text-3xl">{value}</dd>
    </div>
  );
}

/** Change vs last week, told with an arrow + words rather than colour alone. */
function WeekDelta({ thisWeek, lastWeek }: { thisWeek: number; lastWeek: number }) {
  const delta = thisWeek - lastWeek;
  const [Icon, text] =
    thisWeek === 0 && lastWeek === 0
      ? [Minus, "No sessions yet — the timer's waiting whenever you are."]
      : Math.abs(delta) < 60
        ? [Minus, "About the same as last week."]
        : delta > 0
          ? [TrendingUp, `${fmtHours(delta)} more than last week.`]
          : [TrendingDown, `${fmtHours(-delta)} less than last week — every bit still counts.`];
  return (
    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
      <Icon className="h-4 w-4" aria-hidden /> {text}
    </p>
  );
}

/** One series, one colour: columns ≤24px wide, rounded at the data end, square on the baseline. */
function DayChart({ days }: { days: DayBucket[] }) {
  const max = Math.max(...days.map((d) => d.seconds), 1);
  const peak = days.reduce<DayBucket | undefined>(
    (best, d) => (d.seconds > (best?.seconds ?? 0) ? d : best),
    undefined,
  );
  const fullDate = (d: DayBucket) =>
    new Date(d.date).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

  return (
    <figure className="mt-4">
      <div className="flex h-48 items-end gap-1 border-b border-border pt-6">
        {days.map((d) => {
          const pct = (d.seconds / max) * 100;
          // label sparingly: just the best day and today
          const labelled = d.seconds > 0 && (d === peak || d.isToday);
          return (
            <div
              key={d.date}
              tabIndex={0}
              aria-label={`${fullDate(d)}: ${fmtMinutes(d.seconds)}`}
              className="group relative flex h-full flex-1 flex-col items-center justify-end rounded-md outline-offset-0"
            >
              {labelled && (
                <span className="mb-1 text-xs font-semibold">{fmtHours(d.seconds)}</span>
              )}
              <div
                className="w-full max-w-6 rounded-t-[4px] bg-accent transition-[filter] group-hover:brightness-95"
                style={{ height: `${pct}%`, minHeight: d.seconds ? 4 : 0 }}
              />
              <span
                role="tooltip"
                className="pointer-events-none absolute left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg border-2 border-pencil/60 bg-card px-2 py-1 text-xs whitespace-nowrap shadow group-hover:block group-focus-visible:block"
                style={{ bottom: `${pct}%` }}
              >
                <strong className="text-sm">{fmtMinutes(d.seconds)}</strong>{" "}
                <span className="text-muted-foreground">{fullDate(d)}</span>
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1">
        {days.map((d) => (
          <span
            key={d.date}
            className={cn(
              "flex-1 text-center text-xs",
              d.isToday ? "font-bold text-foreground" : "text-muted-foreground",
            )}
          >
            {d.isToday ? "Today" : d.label}
          </span>
        ))}
      </div>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          View as table
        </summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="text-muted-foreground">
              <th className="py-1 font-semibold">Day</th>
              <th className="py-1 text-right font-semibold">Deep work</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date} className="border-t border-border">
                <td className="py-1">{fullDate(d)}</td>
                <td className="py-1 text-right tabular-nums">{fmtMinutes(d.seconds)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
