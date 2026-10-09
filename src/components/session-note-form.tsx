import { useEffect, useState } from "react";
import { Check, Hourglass, Shuffle, type LucideIcon } from "lucide-react";
import {
  fmtDuration,
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
  onChange,
  onSave,
  onSkip,
}: {
  pending: PendingSession;
  draft: SessionNoteDraft;
  onChange: (draft: SessionNoteDraft) => void;
  onSave: () => void;
  onSkip: () => void;
}) {
  const { workedOn, nextThing, topic, outcome } = draft;
  const planned = pending.planned;
  const [upNext, setUpNext] = useState<BacklogItem[]>([]);
  const [topics, setTopics] = useState<string[]>(TOPICS);
  useEffect(() => {
    setTopics(getTopics());
    setUpNext(getBacklog().filter((item) => item.lane === "next"));
  }, []);

  const pickOutcome = (value: SessionOutcome) => {
    let next = nextThing;
    if (planned && value === "in-progress" && !next.trim()) next = planned;
    else if (planned && value !== "in-progress" && next === planned) next = "";
    onChange({ ...draft, outcome: value, nextThing: next });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <p className="text-sm text-muted-foreground">
        Session duration: {fmtDuration(pending.elapsed)}
      </p>
      {planned ? (
        <fieldset className="mt-5">
          <legend className="hand text-2xl">How did it go?</legend>
          <div className="sticky-note mt-3">
            <div className="absolute -top-2 left-6 h-4 w-14 rotate-3 rounded-sm bg-accent/50" />
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Last time you planned
            </p>
            <p className="hand text-2xl leading-snug">{planned}</p>
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
                  className="sketch-option"
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
                autoFocus
              />
            </label>
          )}
        </fieldset>
      ) : (
        <label className="mt-5 block">
          <span className="hand text-2xl">What did you work on?</span>
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
          onChange={(e) => onChange({ ...draft, nextThing: e.target.value })}
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
              onClick={() => onChange({ ...draft, nextThing: item.title })}
              aria-pressed={nextThing === item.title}
              className="sketch-chip"
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
              className="sketch-chip"
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="min-h-11 text-sm text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
        >
          Save without a note
        </button>
        <button type="submit" className="sketch-btn-primary">
          <Check className="h-5 w-5" aria-hidden />
          Save session
        </button>
      </div>
    </form>
  );
}
