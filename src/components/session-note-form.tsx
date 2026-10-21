import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, Hourglass, Shuffle, type LucideIcon } from "lucide-react";
import {
  TOPICS,
  getTopics,
  OUTCOME_LABELS,
  type SessionOutcome,
  type PendingSession,
  type SessionNoteDraft,
} from "@/lib/tracker";
import { UP_NEXT_LIMIT, getBacklog, type BacklogItem } from "@/lib/intentions";
import { cn } from "@/lib/utils";

const OUTCOMES: SessionOutcome[] = ["completed", "in-progress", "other"];
const OUTCOME_ICONS: Record<SessionOutcome, LucideIcon> = {
  completed: Check,
  "in-progress": Hourglass,
  other: Shuffle,
};

export function SessionNoteForm({
  pending,
  draft,
  error,
  header,
  onChange,
  onSave,
  onSkip,
}: {
  pending: PendingSession;
  draft: SessionNoteDraft;
  error?: string;
  header: ReactNode;
  onChange: (draft: SessionNoteDraft) => void;
  onSave: () => void;
  onSkip: () => void;
}) {
  const { workedOn, nextThing, topic, outcome } = draft;
  const planned = pending.planned;
  const automaticNextStep = useRef(false);
  const nextThingId = useId();
  const backlogId = useId();
  const [upNext, setUpNext] = useState<BacklogItem[]>([]);
  const [topics, setTopics] = useState<string[]>(TOPICS);
  const [backlogOpen, setBacklogOpen] = useState(false);
  const backlogRef = useRef<HTMLDivElement>(null);

  // close the backlog picker on an outside click or Escape
  useEffect(() => {
    if (!backlogOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!backlogRef.current?.contains(event.target as Node)) setBacklogOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setBacklogOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [backlogOpen]);

  // A task marked Completed is done: it leaves the picker (and, on save, the
  // backlog's Up next lane), so it can't be lined up again by mistake.
  const visibleUpNext =
    outcome === "completed" && planned
      ? upNext.filter((item) => item.title !== planned)
      : upNext;

  const selectedItem = visibleUpNext.find((item) => item.title === nextThing);

  const pickBacklogItem = (title: string) => {
    automaticNextStep.current = false;
    onChange({ ...draft, nextThing: title });
    setBacklogOpen(false);
  };
  useEffect(() => {
    setTopics(getTopics());
    setUpNext(getBacklog().filter((item) => item.lane === "next"));
  }, []);

  const pickOutcome = (value: SessionOutcome) => {
    let next = nextThing;
    if (planned && value === "completed" && next === planned) {
      // the finished task can't also be the next thing
      next = "";
      automaticNextStep.current = false;
    } else if (planned && value === "in-progress" && !next.trim()) {
      next = planned;
      automaticNextStep.current = true;
    } else if (value !== "in-progress" && automaticNextStep.current && next === planned) {
      next = "";
      automaticNextStep.current = false;
    }
    onChange({ ...draft, outcome: value, nextThing: next });
  };

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [overflow-anchor:none] [scrollbar-gutter:stable] px-6 py-6 sm:px-8 sm:pt-8">
        {header}
        {planned ? (
          <fieldset className="mt-5">
            <legend className="sr-only">How did it go?</legend>
            <div className="sticky-note">
              <div className="absolute -top-2 left-6 h-4 w-14 rotate-3 rounded-sm bg-accent/50" />
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Last time you planned
              </p>
              <p
                className="hand text-2xl leading-snug [overflow-wrap:anywhere]"
                data-clarity-mask="true"
              >
                {planned}
              </p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {OUTCOMES.map((o) => {
                const Icon = OUTCOME_ICONS[o];
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => pickOutcome(o)}
                    aria-pressed={outcome === o}
                    className={
                      o === "completed"
                        ? "sketch-option sketch-option-done hover:translate-y-0"
                        : "sketch-option hover:translate-y-0"
                    }
                  >
                    <Icon className="h-6 w-6" aria-hidden />
                    {OUTCOME_LABELS[o]}
                  </button>
                );
              })}
            </div>
            {(outcome === "in-progress" || outcome === "other") && (
              <label className="mt-4 block">
                <span className="text-sm text-muted-foreground">
                  {outcome === "in-progress"
                    ? "Where did you get to? (optional)"
                    : "What did you work on instead? (optional)"}
                </span>
                <input
                  value={workedOn}
                  onChange={(e) => onChange({ ...draft, workedOn: e.target.value })}
                  placeholder={
                    outcome === "in-progress"
                      ? "e.g. collision works, still jittery on slopes"
                      : "e.g. fixed the save-file crash"
                  }
                  className="mt-1 w-full rounded-xl border-2 border-input bg-background px-4 py-3 outline-none focus:border-ring"
                  maxLength={140}
                />
              </label>
            )}
          </fieldset>
        ) : (
          <label className="mt-5 block">
            <span className="sr-only">What did you work on?</span>
            <input
              value={workedOn}
              onChange={(e) => onChange({ ...draft, workedOn: e.target.value })}
              placeholder="e.g. tile collision for the jump mechanic"
              className="mt-1 w-full rounded-xl border-2 border-input bg-background px-4 py-3 outline-none focus:border-ring"
              maxLength={140}
            />
          </label>
        )}

        <div className="mt-5 border-t-2 border-dashed border-pencil/30 pt-5">
          <label htmlFor={nextThingId} className="hand block text-2xl">
            What's the next thing to tackle?
          </label>

          {/* Recognition over recall: pick the next thing straight from the backlog.
              Rows mirror the backlog page, so items are recognised, not re-read. */}
          {visibleUpNext.length > 0 && (
            <div className="mt-3" data-clarity-mask="true">
              <p id={backlogId} className="text-sm font-semibold">
                Pick from your backlog{" "}
                <span className="font-normal text-muted-foreground">(Up next)</span>
              </p>
              <div ref={backlogRef} className="relative mt-1">
                <button
                  type="button"
                  onClick={() => setBacklogOpen((open) => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={backlogOpen}
                  aria-labelledby={backlogId}
                  className="item-row items-center hover:bg-muted"
                >
                  <span className="min-w-0 flex-1">
                    {selectedItem ? (
                      <>
                        <span className="block leading-snug break-words">
                          {selectedItem.title}
                        </span>
                        {selectedItem.topic && (
                          <span className="mt-1 block text-xs text-muted-foreground">
                            #{selectedItem.topic}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="block leading-snug text-muted-foreground">
                        Choose from Up next…
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                      backlogOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>

                {backlogOpen && (
                  <div className="paper-card absolute inset-x-0 top-full z-20 mt-3 px-3 pt-8 pb-3">
                    {/* the mint tape + heading from the backlog page's Up next card */}
                    <div className="absolute -top-3 left-8 h-7 w-24 -rotate-2 rounded-sm bg-accent/50" />
                    <div className="flex items-baseline justify-between gap-2 px-1">
                      <span className="hand text-2xl">Up next</span>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {visibleUpNext.length}/{UP_NEXT_LIMIT}
                      </span>
                    </div>
                    <ul role="listbox" aria-labelledby={backlogId} className="mt-2 space-y-2">
                      {visibleUpNext.map((item) => {
                        const selected = item.title === nextThing;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={selected}
                              onClick={() => pickBacklogItem(item.title)}
                              className={cn(
                                "item-row items-center hover:bg-muted",
                                selected && "item-row-selected",
                              )}
                            >
                              <span className="min-w-0 flex-1">
                                <span className="block leading-snug break-words">
                                  {item.title}
                                </span>
                                {item.topic && (
                                  <span className="mt-1 block text-xs text-muted-foreground">
                                    #{item.topic}
                                  </span>
                                )}
                              </span>
                              {selected && (
                                <Check
                                  className="h-5 w-5 shrink-0 text-accent-foreground"
                                  aria-hidden
                                />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    {selectedItem && (
                      <button
                        type="button"
                        onClick={() => pickBacklogItem("")}
                        className="mt-2 px-1 text-xs text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
                      >
                        Clear pick — I'll write my own
                      </button>
                    )}
                  </div>
                )}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">…or write your own below.</p>
            </div>
          )}

          <input
            id={nextThingId}
            value={nextThing}
            onChange={(e) => {
              automaticNextStep.current = false;
              onChange({ ...draft, nextThing: e.target.value });
            }}
            placeholder="e.g. wire up the coyote-time buffer"
            className={`w-full rounded-xl border-2 border-input bg-background px-4 py-3 outline-none focus:border-ring ${
              visibleUpNext.length > 0 ? "mt-3" : "mt-1"
            }`}
            maxLength={140}
          />
        </div>

        <fieldset className="mt-5 border-t-2 border-dashed border-pencil/30 pt-6">
          <legend className="sr-only">Topic (optional)</legend>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Topic</span> (optional) · helps you find this note later
          </p>
          <div className="mt-2 flex flex-wrap gap-2" data-clarity-mask="true">
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ ...draft, topic: topic === t ? undefined : t })}
                aria-pressed={topic === t}
                className="sketch-chip-quiet max-w-full text-left [overflow-wrap:anywhere]"
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 border-t-2 border-dashed border-pencil/30 bg-card pt-3 sm:pt-2">
          {error && (
            <p role="alert" className="mb-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <button
              type="button"
              onClick={onSkip}
              className="min-h-11 rounded-lg px-2 text-sm font-semibold text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
            >
              Save without a note
            </button>
            <button type="submit" className="sketch-btn-primary min-h-11 text-xl">
              <Check className="h-5 w-5" aria-hidden />
              Save note &amp; close
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
