import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import {
  saveSession,
  fmtDuration,
  getPendingSession,
  clearPendingSession,
  TOPICS,
} from "@/lib/tracker";
import { getBacklog, type BacklogItem } from "@/lib/intentions";

export const Route = createFileRoute("/momentum/timer_/wrap-up")({
  head: () => ({
    meta: [
      { title: "Leave a note — Pikup" },
      {
        name: "description",
        content: "Two quick lines for future-you: what you worked on, and what's next.",
      },
      { property: "og:title", content: "Leave a note — Pikup" },
      {
        property: "og:description",
        content: "Two quick lines for future-you: what you worked on, and what's next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotePage,
});

function NotePage() {
  const navigate = useNavigate();
  const [workedOn, setWorkedOn] = useState("");
  const [nextThing, setNextThing] = useState("");
  const [topic, setTopic] = useState<string | undefined>();
  const [pending, setPending] = useState<{ start: number; elapsed: number } | null>(null);
  const [upNext, setUpNext] = useState<BacklogItem[]>([]);

  useEffect(() => {
    setPending(getPendingSession());
    setUpNext(getBacklog().filter((i) => i.lane === "next"));
  }, []);

  const save = () => {
    if (pending) {
      saveSession({
        id: crypto.randomUUID(),
        start: pending.start,
        end: pending.start + pending.elapsed * 1000,
        durationSec: pending.elapsed,
        workedOn: workedOn.trim() || undefined,
        nextThing: nextThing.trim() || undefined,
        topic,
      });
      clearPendingSession();
    }
    navigate({ to: "/momentum/timer" });
  };

  return (
    <main className="flex flex-col items-center pt-10">
      <div className="paper-card relative w-full max-w-xl rotate-[0.5deg] px-6 pt-12 pb-8 sm:px-10">
        <div className="washi absolute -top-3 left-8 h-7 w-24 -rotate-6" />
        <h1 className="hand text-4xl">
          Nice session{pending ? ` — ${fmtDuration(pending.elapsed)}` : ""}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Two quick notes for future-you.</p>

        <label className="mt-6 block">
          <span className="hand text-2xl">What did you work on this session?</span>
          <input
            value={workedOn}
            onChange={(e) => setWorkedOn(e.target.value)}
            placeholder="e.g. tile collision for the jump mechanic"
            className="mt-1 w-full rounded-xl border-2 border-input bg-background px-4 py-3 outline-none focus:border-ring"
            maxLength={140}
          />
        </label>

        <label className="mt-5 block">
          <span className="hand text-2xl">What's the next thing to tackle?</span>
          <input
            value={nextThing}
            onChange={(e) => setNextThing(e.target.value)}
            placeholder="e.g. wire up the coyote-time buffer"
            className="mt-1 w-full rounded-xl border-2 border-input bg-background px-4 py-3 outline-none focus:border-ring"
            maxLength={140}
          />
        </label>
        {/* Recognition over recall: pick the next thing straight from the backlog */}
        {upNext.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">From your backlog:</span>
            {upNext.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setNextThing(item.title)}
                aria-pressed={nextThing === item.title}
                className="sketch-chip"
              >
                {item.title}
              </button>
            ))}
          </div>
        )}

        <fieldset className="mt-5">
          <legend className="hand text-2xl">
            Topic <span className="text-lg text-muted-foreground">(optional)</span>
          </legend>
          <p className="text-sm text-muted-foreground">Helps you find this note again later.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic((cur) => (cur === t ? undefined : t))}
                aria-pressed={topic === t}
                className="sketch-chip"
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <button
          onClick={save}
          className="hand mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-primary px-10 py-3 text-3xl text-primary-foreground shadow-[3px_4px_0_oklch(0.35_0.05_50/0.5)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
        >
          <Check className="h-6 w-6" /> Save & back to timer
        </button>
      </div>

      <Link
        to="/momentum/timer"
        className="hand mt-8 inline-flex items-center gap-2 text-xl text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> skip, back to the timer
      </Link>
    </main>
  );
}
