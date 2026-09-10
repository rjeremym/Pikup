import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { saveSession, fmtDuration } from "@/lib/tracker";

export const Route = createFileRoute("/note")({
  head: () => ({
    meta: [
      { title: "Leave a note — DevSketch" },
      {
        name: "description",
        content: "Two quick lines for future-you: what you worked on, and what's next.",
      },
      { property: "og:title", content: "Leave a note — DevSketch" },
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

  const pending = (() => {
    try {
      const raw = sessionStorage.getItem("devsketch.pendingSession");
      return raw ? (JSON.parse(raw) as { start: number; elapsed: number }) : null;
    } catch {
      return null;
    }
  })();

  const save = () => {
    if (pending) {
      saveSession({
        id: crypto.randomUUID(),
        start: pending.start,
        end: pending.start + pending.elapsed * 1000,
        durationSec: pending.elapsed,
        workedOn: workedOn.trim() || undefined,
        nextThing: nextThing.trim() || undefined,
      });
      sessionStorage.removeItem("devsketch.pendingSession");
    }
    navigate({ to: "/" });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="paper-card relative w-full max-w-xl rotate-[0.5deg] px-6 pt-12 pb-8 sm:px-10">
        <div className="washi absolute -top-3 left-8 h-7 w-24 -rotate-6" />
        <h1 className="hand text-4xl">
          Nice session{pending ? ` — ${fmtDuration(pending.elapsed)}` : ""}! ✏️
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Two quick lines for future-you. Takes under 30 seconds, promise.
        </p>

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

        <button
          onClick={save}
          className="hand mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-primary px-10 py-3 text-3xl text-primary-foreground shadow-[3px_4px_0_oklch(0.35_0.05_50/0.5)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
        >
          <Check className="h-6 w-6" /> Save & head home
        </button>
      </div>

      <Link
        to="/"
        className="hand mt-8 inline-flex items-center gap-2 text-xl text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> skip, back to the timer
      </Link>
    </main>
  );
}
