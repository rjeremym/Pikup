import { useId, useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { FOCUS_LENGTHS, fmtFocusLength } from "@/lib/tracker";
import { cn } from "@/lib/utils";

type Unit = "sec" | "min";
const UNIT_LABELS: Record<Unit, string> = { sec: "seconds", min: "minutes" };
const MAX_SEC = 12 * 3600;

/**
 * An optional length to aim for, counted from when it's picked. In testing, the focus timer was the
 * feature that most predicted wanting to use Pikup, but a plain stopwatch gave people nothing to
 * work toward.
 */
export function FocusLengthPicker({
  goalSec,
  onPick,
  align = "center",
  className,
}: {
  goalSec: number | null;
  onPick: (sec: number | null) => void;
  align?: "center" | "start";
  className?: string;
}) {
  const labelId = useId();
  const amountId = useId();
  const errorId = useId();
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState("");
  // seconds first, so the class demo's "10 seconds" works by just typing 10
  const [unit, setUnit] = useState<Unit>("sec");
  const [error, setError] = useState("");
  const presets = [null, ...FOCUS_LENGTHS.map((min) => min * 60)];
  const isCustom = goalSec != null && !presets.includes(goalSec);
  const rowClass = cn("flex flex-wrap gap-2", align === "center" && "justify-center");

  const pickPreset = (sec: number | null) => {
    setEditing(false);
    setError("");
    onPick(sec);
  };

  /**
   * Sets the typed length; returns false if it isn't a usable length. Only an explicit Set says
   * why: a message appearing on blur would shift the layout under the click that caused it.
   */
  const applyCustom = (u: Unit, explain: boolean) => {
    const sec = Math.round(Number(amount) * (u === "min" ? 60 : 1));
    if (!amount.trim() || !Number.isFinite(sec) || sec < 1 || sec > MAX_SEC) {
      if (explain) setError("Enter a length between 1 second and 12 hours.");
      return false;
    }
    setError("");
    // re-picking the same length would restart its countdown
    if (sec !== goalSec) onPick(sec);
    return true;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (applyCustom(unit, true)) setEditing(false);
  };

  const changeUnit = (u: Unit) => {
    setUnit(u);
    applyCustom(u, false);
  };

  return (
    <div role="group" aria-labelledby={labelId} className={className}>
      <p id={labelId} className="text-sm font-semibold text-muted-foreground">
        Focus for
      </p>
      <div className={cn("mt-2", rowClass)}>
        {presets.map((sec) => (
          <button
            key={sec ?? "none"}
            type="button"
            aria-pressed={goalSec === sec}
            onClick={() => pickPreset(sec)}
            className="sketch-chip min-h-9"
          >
            {sec ? `${sec / 60} min` : "No limit"}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={isCustom}
          aria-expanded={editing}
          onClick={() => setEditing((open) => !open)}
          className="sketch-chip min-h-9"
        >
          {/* Same label while the box is open, so the chip can't grow and wrap the row mid-click */}
          {isCustom && !editing ? `Custom: ${fmtFocusLength(goalSec)}` : "Custom…"}
        </button>
      </div>
      {editing && (
        <form onSubmit={submit} className={cn("mt-3 items-center", rowClass)}>
          <label htmlFor={amountId} className="sr-only">
            Focus length in {UNIT_LABELS[unit]}
          </label>
          <input
            id={amountId}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setError("");
            }}
            // Applies as soon as focus leaves the box, so typing a length and going straight for
            // "Got it" (or anywhere else) still sets it; Set and Enter aren't required
            onBlur={() => applyCustom(unit, false)}
            placeholder="10"
            className="sketch-input w-24 py-1.5"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            autoFocus
          />
          {(Object.keys(UNIT_LABELS) as Unit[]).map((u) => (
            <button
              key={u}
              type="button"
              aria-pressed={unit === u}
              onClick={() => changeUnit(u)}
              className="sketch-chip min-h-9"
            >
              {UNIT_LABELS[u]}
            </button>
          ))}
          <button type="submit" className="sketch-btn min-h-9 px-4 py-1 text-lg">
            <Check className="h-4 w-4" aria-hidden />
            Set
          </button>
        </form>
      )}
      {editing && error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
