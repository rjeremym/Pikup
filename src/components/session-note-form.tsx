import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Hourglass, Shuffle, type LucideIcon } from "lucide-react";
import {
  TOPICS,
  getTopics,
  OUTCOME_LABELS,
  type SessionOutcome,
  type PendingSession,
  type SessionNoteDraft,
} from "@/lib/tracker";
import { getBacklog, type BacklogItem } from "@/lib/intentions";

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
  const [upNext, setUpNext] = useState<BacklogItem[]>([]);
  const [topics, setTopics] = useState<string[]>(TOPICS);
  useEffect(() => {
    setTopics(getTopics());
    setUpNext(getBacklog().filter((item) => item.lane === "next"));
  }, []);

  const pickOutcome = (value: SessionOutcome) => {
    let next = nextThing;
    if (planned && value === "in-progress" && !next.trim()) {
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
              <p className="hand text-2xl leading-snug [overflow-wrap:anywhere]">{planned}</p>
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
                    className="sketch-option hover:translate-y-0"
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

        <label className="mt-5 block border-t-2 border-dashed border-pencil/30 pt-5">
          <span className="hand text-2xl">What's the next thing to tackle?</span>
          <input
            value={nextThing}
            onChange={(e) => {
              automaticNextStep.current = false;
              onChange({ ...draft, nextThing: e.target.value });
            }}
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
                onClick={() => {
                  automaticNextStep.current = false;
                  onChange({ ...draft, nextThing: item.title });
                }}
                aria-pressed={nextThing === item.title}
                className="sketch-chip max-w-full text-left [overflow-wrap:anywhere]"
              >
                {item.title}
              </button>
            ))}
          </div>
        )}

        <fieldset className="mt-5 border-t-2 border-dashed border-pencil/30 pt-6">
          <legend className="sr-only">Topic (optional)</legend>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Topic</span> (optional) · helps you find this note later
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ ...draft, topic: topic === t ? undefined : t })}
                aria-pressed={topic === t}
                className="sketch-chip max-w-full text-left [overflow-wrap:anywhere]"
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
