import { useId, useState, type FormEvent } from "react";
import { Check, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  OUTCOME_LABELS,
  fmtDuration,
  updateSessionTask,
  type Session,
  type SessionOutcome,
} from "@/lib/tracker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type OutcomeChoice = SessionOutcome | "unrecorded";
const choices: { value: OutcomeChoice; label: string }[] = [
  { value: "completed", label: OUTCOME_LABELS.completed },
  { value: "in-progress", label: OUTCOME_LABELS["in-progress"] },
  { value: "other", label: OUTCOME_LABELS.other },
  { value: "unrecorded", label: "Not recorded" },
];

export function SessionOutcomeEditor({
  session,
  compact = false,
}: {
  session: Session;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState("");
  const [outcome, setOutcome] = useState<OutcomeChoice>("unrecorded");
  const [error, setError] = useState("");
  const taskId = useId();
  const errorId = useId();
  const choiceName = useId();
  const date = new Date(session.start).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const changeOpen = (next: boolean) => {
    if (next) {
      setTask(
        session.plannedTask || (session.outcome === "completed" ? session.workedOn : "") || "",
      );
      setOutcome(session.outcome ?? "unrecorded");
      setError("");
    }
    setOpen(next);
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    const plannedTask = task.trim();
    if (outcome !== "unrecorded" && !plannedTask) {
      setError("Enter the task you planned before saving an outcome.");
      return;
    }
    try {
      const updated = updateSessionTask(session.id, {
        plannedTask: plannedTask || undefined,
        outcome: outcome === "unrecorded" ? undefined : outcome,
      });
      if (!updated) {
        setError("This session is no longer available. Close this dialog and refresh the page.");
        return;
      }
      setOpen(false);
      toast.success("Session task and outcome updated.");
    } catch {
      setError("Couldn’t save your changes. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-primary underline decoration-dotted underline-offset-4 hover:text-foreground"
          aria-label={`Edit task and outcome for ${date}`}
        >
          <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {compact ? "Edit" : "Edit task & outcome"}
        </button>
      </DialogTrigger>
      <DialogContent className="paper-card max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto p-6 sm:p-8">
        <DialogTitle className="hand pr-5 text-3xl font-normal">
          Edit session task &amp; outcome
        </DialogTitle>
        <DialogDescription>
          {date} · Deep work {fmtDuration(session.durationSec)}
        </DialogDescription>
        <form onSubmit={save} className="space-y-5">
          <div>
            <label htmlFor={taskId} className="block text-sm font-semibold">
              What task did you plan for this session?
            </label>
            <input
              id={taskId}
              value={task}
              onChange={(event) => {
                setTask(event.target.value);
                setError("");
              }}
              required={outcome !== "unrecorded"}
              maxLength={140}
              placeholder="e.g. Add photo uploads"
              className="sketch-input mt-2"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
            />
          </div>
          <fieldset>
            <legend className="text-sm font-semibold">How did it go?</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {choices.map((choice) => (
                <label
                  key={choice.value}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                    outcome === choice.value
                      ? "border-primary bg-washi/40 font-semibold"
                      : "border-pencil/30 bg-card hover:bg-muted",
                  )}
                >
                  <input
                    type="radio"
                    name={choiceName}
                    value={choice.value}
                    checked={outcome === choice.value}
                    onChange={() => {
                      setOutcome(choice.value);
                      setError("");
                    }}
                    className="h-4 w-4 shrink-0 accent-primary"
                  />
                  {choice.label}
                </label>
              ))}
            </div>
          </fieldset>
          {error && (
            <p id={errorId} role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-dashed border-pencil/30 pt-4">
            <button type="button" className="sketch-btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="sketch-btn-primary">
              <Check className="h-5 w-5" aria-hidden />
              Save changes
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
