import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import {
  recentWeeks,
  weekSeconds,
  fmtHours,
  getUnlockedStickers,
  unlockSticker,
  getPlacedSticker,
  placeSticker,
  type WeekBucket,
} from "@/lib/tracker";
import { STICKER_IMAGES } from "./index";

export const Route = createFileRoute("/summary")({
  head: () => ({
    meta: [
      { title: "Weekly summary — Pikup" },
      {
        name: "description",
        content: "Your deep-work hours by week — a light sketch of your progress, not a dashboard.",
      },
      { property: "og:title", content: "Weekly summary — Pikup" },
      {
        property: "og:description",
        content: "Your deep-work hours by week — a light sketch of your progress, not a dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SummaryPage,
});

const MILESTONES = [
  { hours: 2, sticker: "mug", name: "Warm-up mug" },
  { hours: 4, sticker: "bulb", name: "Bright idea" },
  { hours: 6, sticker: "star", name: "Steady star" },
  { hours: 8, sticker: "rocket", name: "Lift-off" },
  { hours: 10, sticker: "heart", name: "Full heart" },
];

function SummaryPage() {
  const [weeks, setWeeks] = useState<WeekBucket[]>([]);
  const [thisWeek, setThisWeek] = useState(0);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [placed, setPlaced] = useState<string | null>(null);

  useEffect(() => {
    const ws = weekSeconds();
    setWeeks(recentWeeks(6));
    setThisWeek(ws);
    // auto-unlock any milestone earned this week
    MILESTONES.forEach((m) => {
      if (ws >= m.hours * 3600) unlockSticker(m.sticker);
    });
    setUnlocked(getUnlockedStickers());
    setPlaced(getPlacedSticker());
  }, []);

  const maxSec = Math.max(...weeks.map((w) => w.seconds), 1);

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-10">
      <p className="hand mb-6 text-3xl text-primary">Pikup</p>
      <div className="paper-card relative w-full max-w-xl px-6 pt-12 pb-8 sm:px-10">
        <div className="washi absolute -top-3 right-10 h-7 w-24 rotate-3" />
        <h1 className="hand text-4xl">This week: {fmtHours(thisWeek)} of deep work</h1>

        <div className="mt-8 space-y-3">
          {weeks.map((w, i) => (
            <div key={w.weekStart} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">
                {i === weeks.length - 1 ? "this wk" : w.label}
              </span>
              <div className="h-6 flex-1 rounded-full border-2 border-dashed border-pencil/50 p-0.5">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${Math.max((w.seconds / maxSec) * 100, w.seconds > 0 ? 6 : 0)}%` }}
                />
              </div>
              <span className="hand w-12 shrink-0 text-right text-lg">{fmtHours(w.seconds)}</span>
            </div>
          ))}
        </div>

        <h2 className="hand mt-10 text-3xl">Sticker shelf</h2>
        <p className="text-sm text-muted-foreground">
          Hit a weekly milestone to unlock a sticker — tap one to pin it on your home page.
        </p>
        <div className="mt-4 grid grid-cols-5 gap-3">
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
                  <img src={STICKER_IMAGES[m.sticker]} alt={m.name} className="max-h-full" loading="lazy" width={160} height={160} />
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
      </div>

      <Link
        to="/"
        className="hand mt-8 inline-flex items-center gap-2 text-xl text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> back to Pikup
      </Link>
    </main>
  );
}
