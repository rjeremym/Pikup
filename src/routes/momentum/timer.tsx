import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pause, Play, Square, Eye, EyeOff, NotebookPen } from "lucide-react";
import {
  fmtDuration,
  lastNote,
  getPlacedSticker,
  workedOnLabel,
  type Session,
} from "@/lib/tracker";
import { useSessionControls, useSessionRevision } from "@/lib/session-context";
import { STICKER_IMAGES } from "@/lib/stickers";

export const Route = createFileRoute("/momentum/timer")({
  head: () => ({
    meta: [
      { title: "Session — Pikup" },
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
  component: TimerPage,
});

function TimerPage() {
  const { timer, pending, ready, startSession, endSession, finishNote } = useSessionControls();
  const revision = useSessionRevision();
  const [note, setNote] = useState<Session | undefined>();
  const [sticker, setSticker] = useState<string | null>(null);
  const [timerHidden, setTimerHidden] = useState(false);

  useEffect(() => {
    setNote(lastNote());
    setSticker(getPlacedSticker());
  }, [revision]);

  // Reveal clock again when the session ends
  useEffect(() => {
    if (!timer.running) setTimerHidden(false);
  }, [timer.running]);

  const hasNote = Boolean(note && (note.workedOn || note.nextThing));

  return (
    <main className="flex flex-col items-center pt-8">
      <header className="mb-8 flex w-full items-center justify-between gap-4">
        <div>
          <h1 className="hand text-4xl">Session</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pick up exactly where you left off.</p>
        </div>
        <Link to="/intentions/notes" className="sketch-link whitespace-nowrap">
          <NotebookPen className="h-4 w-4" aria-hidden />
          Past notes
        </Link>
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
                    <span className="font-semibold">{workedOnLabel(note)}: </span>
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
                  No note from your last session.
                </p>
                <p className="text-sm text-muted-foreground">
                  End a session and leave a short note — next time you'll know exactly where to pick
                  up.
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

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {!timer.running ? (
              <button
                onClick={pending ? finishNote : startSession}
                disabled={!ready}
                className="hand inline-flex items-center gap-2 rounded-2xl border-2 border-primary bg-primary px-5 py-3 text-2xl sm:px-10 sm:text-3xl text-primary-foreground shadow-[3px_4px_0_oklch(0.35_0.05_50/0.5)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
              >
                <Play className="h-6 w-6" aria-hidden /> {pending ? "Finish note" : "Start session"}
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
    </main>
  );
}
