import { useId } from "react";
import { FOCUS_LENGTHS } from "@/lib/tracker";
import { cn } from "@/lib/utils";

/**
 * An optional length to aim for. In testing, the focus timer was the feature that most predicted
 * wanting to use Pikup, but a plain stopwatch gave people nothing to work toward.
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
  const choices = [null, ...FOCUS_LENGTHS.map((min) => min * 60)];
  return (
    <div role="group" aria-labelledby={labelId} className={className}>
      <p id={labelId} className="text-sm font-semibold text-muted-foreground">
        Focus for
      </p>
      <div className={cn("mt-2 flex flex-wrap gap-2", align === "center" && "justify-center")}>
        {choices.map((sec) => (
          <button
            key={sec ?? "none"}
            type="button"
            aria-pressed={goalSec === sec}
            onClick={() => onPick(sec)}
            className="sketch-chip min-h-9"
          >
            {sec ? `${sec / 60} min` : "No limit"}
          </button>
        ))}
      </div>
    </div>
  );
}
