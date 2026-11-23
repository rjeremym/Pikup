import { useId, useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { updateSessionNote, workedOnLabel, type Session } from "@/lib/tracker";

/**
 * Edits the text of a saved note in place, so the next step can be corrected at the moment you
 * pick it back up (testers asked for this when they couldn't change "their" note).
 */
export function NoteEditForm({ note, onDone }: { note: Session; onDone: () => void }) {
  const [workedOn, setWorkedOn] = useState(note.workedOn ?? "");
  const [nextThing, setNextThing] = useState(note.nextThing ?? "");
  const [error, setError] = useState("");
  const workedOnId = useId();
  const nextThingId = useId();
  const errorId = useId();

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!workedOn.trim() && !nextThing.trim()) {
      setError("Write what you worked on or your next step, or cancel to keep the note as it was.");
      return;
    }
    try {
      const updated = updateSessionNote(note.id, {
        workedOn: workedOn.trim() || undefined,
        nextThing: nextThing.trim() || undefined,
      });
      if (!updated) {
        setError("This note is no longer available. Refresh the page and try again.");
        return;
      }
      toast.success("Note updated.");
      onDone();
    } catch {
      setError("Couldn’t save your changes. Please try again.");
    }
  };

  const describedBy = error ? errorId : undefined;
  return (
    <form onSubmit={save} className="space-y-4 text-left">
      <div>
        <label htmlFor={workedOnId} className="block text-sm font-semibold text-muted-foreground">
          {workedOnLabel(note)}
        </label>
        <textarea
          id={workedOnId}
          value={workedOn}
          onChange={(event) => {
            setWorkedOn(event.target.value);
            setError("");
          }}
          rows={2}
          maxLength={140}
          className="sketch-input mt-1 resize-none"
          aria-describedby={describedBy}
        />
      </div>
      <div>
        <label htmlFor={nextThingId} className="block text-sm font-semibold text-muted-foreground">
          Next up
        </label>
        <textarea
          id={nextThingId}
          value={nextThing}
          onChange={(event) => {
            setNextThing(event.target.value);
            setError("");
          }}
          rows={2}
          maxLength={140}
          className="sketch-input mt-1 resize-none"
          aria-describedby={describedBy}
          autoFocus
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button type="button" className="sketch-btn" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className="sketch-btn-primary">
          <Check className="h-5 w-5" aria-hidden />
          Save note
        </button>
      </div>
    </form>
  );
}
