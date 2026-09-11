import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pause, Play, Square, CalendarDays, Eye, EyeOff } from "lucide-react";
import {
  useTimer,
  fmtDuration,
  lastNote,
  getPlacedSticker,
  setPendingSession,
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
      { title: "Pikup — pick up right where you left off" },
      {
        name: "description",
        content:
          "A sketchbook-style session tracker for solo devs. Leave a note for next time, start the timer, and pick up exactly where you left off.",
      },
      { property: "og:title", content: "Pikup — pick up right where you left off" },
      {
        property: "og:description",
        content:
          "A sketchbook-style session tracker for solo devs. Leave a note for next time, start the timer, and pick up exactly where you left off.",
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
  const [timerHidden, setTimerHidden] = useState(false);

  useEffect(() => {
    setNote(lastNote());
    setSticker(getPlacedSticker());
  }, []);

  // Reveal clock again when the session ends
  useEffect(() => {
    if (!timer.running) setTimerHidden(false);
  }, [timer.running]);

  const endSession = () => {
    const result = timer.stop();
    if (!result) return;
    setPendingSession(result);
    timer.reset();
    navigate({ to: "/note" });
  };

  const hasNote = Boolean(note && (note.workedOn || note.nextThing));

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="hand text-5xl text-primary sm:text-6xl">Pikup</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start your timer and pick up exactly where you left off.
        </p>
      </header>

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

        {/* Note + timer grouped as one unit — note leads */}
        <div className="paper-card relative px-6 pt-12 pb-8 text-center sm:px-10">
          <div className="washi absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 -rotate-2" />

          <section className="mb-8 -rotate-1 rounded-lg border-2 border-dashed border-pencil/60 bg-muted/60 px-5 py-5 text-left">
            <p className="hand text-2xl text-primary sm:text-3xl">
              Last time, you left yourself this note:
            </p>
            {hasNote ? (
              <>
                {note?.workedOn && (
                  <p className="mt-3 text-base sm:text-lg">
                    <span className="font-semibold">Worked on: </span>
                    {note.workedOn}
                  </p>
                )}
                {note?.nextThing && (
                  <p className="mt-2 text-base sm:text-lg">
                    <span className="font-semibold">Next up: </span>
                    <span className="scribble-underline">{note.nextThing}</span>
                  </p>
                )}
              </>
            ) : (
              <div className="mt-3 space-y-2 opacity-60">
                <p className="text-base italic text-muted-foreground sm:text-lg">
                  Nothing here yet…
                </p>
                <p className="text-sm text-muted-foreground">
                  End a session and leave a short note — next time you'll know exactly where to
                  pick up.
                </p>
              </div>
            )}
          </section>

          <div className="mt-2">
            {timer.running && (
              <button
                type="button"
                onClick={() => setTimerHidden((h) => !h)}
                className="hand mb-2 inline-flex items-center gap-1.5 text-lg text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
              >
                {timerHidden ? (
                  <>
                    <Eye className="h-3.5 w-3.5" /> show clock
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5" /> hide clock
                  </>
                )}
              </button>
            )}

            {!timerHidden ? (
              <>
                <p
                  className="font-mono text-4xl font-semibold tracking-tight tabular-nums text-foreground/80 sm:text-5xl"
                  aria-live="off"
                >
                  {fmtDuration(timer.elapsed)}
                </p>
                <p className="hand mt-1 text-lg text-muted-foreground">
                  {timer.running
                    ? timer.paused
                      ? "Paused"
                      : "deep work in progress…"
                    : "ready when you are"}
                </p>
              </>
            ) : (
              <p className="hand text-lg text-muted-foreground">clock tucked away — keep going</p>
            )}
          </div>

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

      {!timer.running && (
        <Link
          to="/summary"
          className="hand mt-8 inline-flex items-center gap-2 text-xl text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
        >
          <CalendarDays className="h-4 w-4" /> Weekly summary
        </Link>
      )}
    </main>
  );
}
