import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pause, Play, Square, CalendarDays } from "lucide-react";
import {
  useTimer,
  fmtDuration,
  lastNote,
  getPlacedSticker,
  type Session,
} from "@/lib/tracker";

import stickerRocket from "@/assets/sticker-rocket.png";
import stickerMug from "@/assets/sticker-mug.png";
import stickerStar from "@/assets/sticker-star.png";
import stickerHeart from "@/assets/sticker-heart.png";
import stickerBulb from "@/assets/sticker-bulb.png";

export const STICKER_IMAGES: Record<string, string> = {
  rocket: stickerRocket,
  mug: stickerMug,
  star: stickerStar,
  heart: stickerHeart,
  bulb: stickerBulb,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DevSketch — pick up right where you left off" },
      {
        name: "description",
        content:
          "A sketchbook-style deep-work timer for solo devs. Start the timer, see the note you left yourself last time, and never lose the thread again.",
      },
      { property: "og:title", content: "DevSketch — pick up right where you left off" },
      {
        property: "og:description",
        content:
          "A sketchbook-style deep-work timer for solo devs. Start the timer, see the note you left yourself last time, and never lose the thread again.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const timer = useTimer();
  const navigate = useNavigate();
  const [note, setNote] = useState<Session | undefined>();
  const [sticker, setSticker] = useState<string | null>(null);

  useEffect(() => {
    setNote(lastNote());
    setSticker(getPlacedSticker());
  }, []);

  const endSession = () => {
    const result = timer.stop();
    if (!result) return;
    sessionStorage.setItem("devsketch.pendingSession", JSON.stringify(result));
    timer.reset();
    navigate({ to: "/note" });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-xl">
        {sticker && STICKER_IMAGES[sticker] && (
          <img
            src={STICKER_IMAGES[sticker]}
            alt={`${sticker} sticker`}
            className="absolute -top-10 -right-4 z-10 w-20 -rotate-12 drop-shadow-md"
            width={160}
            height={160}
          />
        )}

        {/* Timer + last note grouped as one unit */}
        <div className="paper-card relative px-6 pt-12 pb-8 text-center sm:px-10">
          <div className="washi absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 -rotate-2" />

          {!timer.running && note && (note.workedOn || note.nextThing) && (
            <section className="mb-8 -rotate-1 rounded-lg border-2 border-dashed border-pencil/60 bg-muted/60 px-5 py-4 text-left">
              <p className="hand text-2xl text-primary">
                Last time, you left yourself this note:
              </p>
              {note.workedOn && (
                <p className="mt-2 text-sm">
                  <span className="font-semibold">Worked on: </span>
                  {note.workedOn}
                </p>
              )}
              {note.nextThing && (
                <p className="mt-1 text-sm">
                  <span className="font-semibold">Next up: </span>
                  <span className="scribble-underline">{note.nextThing}</span>
                </p>
              )}
            </section>
          )}

          <p
            className="font-mono text-6xl font-bold tracking-tight tabular-nums sm:text-7xl"
            aria-live="off"
          >
            {fmtDuration(timer.elapsed)}
          </p>
          <p className="hand mt-2 text-xl text-muted-foreground">
            {timer.running
              ? timer.paused
                ? "paused — the kettle's on ☕"
                : "deep work in progress…"
              : "ready when you are"}
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            {!timer.running ? (
              <button
                onClick={timer.start}
                className="hand inline-flex items-center gap-2 rounded-2xl border-2 border-primary bg-primary px-10 py-3 text-3xl text-primary-foreground shadow-[3px_4px_0_oklch(0.35_0.05_50/0.5)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
              >
                <Play className="h-6 w-6" /> Start
              </button>
            ) : (
              <>
                <button
                  onClick={timer.togglePause}
                  className="hand inline-flex items-center gap-2 rounded-2xl border-2 border-pencil bg-card px-6 py-2 text-2xl transition-transform hover:-translate-y-0.5"
                >
                  {timer.paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                  {timer.paused ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={endSession}
                  className="hand inline-flex items-center gap-2 rounded-2xl border-2 border-pencil bg-secondary px-6 py-2 text-2xl text-secondary-foreground transition-transform hover:-translate-y-0.5"
                >
                  <Square className="h-5 w-5" /> End session
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <Link
        to="/summary"
        className="hand mt-8 inline-flex items-center gap-2 text-xl text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
      >
        <CalendarDays className="h-4 w-4" /> Weekly summary
      </Link>
    </main>
  );
}
