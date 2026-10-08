import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Check, Circle, CircleAlert, Eye, EyeOff, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  /** something to overlay at the right edge of the input, e.g. a show/hide toggle */
  adornment?: ReactNode;
}

/** Label above, message below, wired up with aria so screen readers hear errors too. */
export function TextField({
  label,
  error,
  hint,
  adornment,
  id,
  className,
  ...props
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const msgId = `${inputId}-msg`;
  const message = error ?? hint;

  return (
    <div className={className}>
      <label htmlFor={inputId} className="hand text-xl">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? msgId : undefined}
          className={cn("sketch-input", adornment && "pr-12", error && "border-primary")}
          {...props}
        />
        {adornment}
      </div>
      {message && (
        <p
          id={msgId}
          className={cn(
            "mt-1 flex items-center gap-1 text-sm",
            error ? "font-semibold text-primary" : "text-muted-foreground",
          )}
        >
          {error && <CircleAlert className="h-4 w-4 shrink-0" aria-hidden />}
          {message}
        </p>
      )}
    </div>
  );
}

export function PasswordField(props: Omit<TextFieldProps, "type" | "adornment">) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      adornment={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-1 my-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  );
}

/** Requirements that tick themselves off as you type. */
export function Checklist({ items }: { items: { label: string; met: boolean }[] }) {
  return (
    <ul className="space-y-1 text-sm" aria-label="Password requirements">
      {items.map((item) => (
        <li
          key={item.label}
          className={cn(
            "flex items-center gap-2",
            item.met ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {item.met ? (
            <Check className="h-4 w-4 text-accent-foreground" aria-hidden />
          ) : (
            <Circle className="h-4 w-4" aria-hidden />
          )}
          {item.label}
          <span className="sr-only">{item.met ? "(done)" : "(not yet)"}</span>
        </li>
      ))}
    </ul>
  );
}

export function Notice({
  children,
  tone = "info",
  className,
}: {
  children: ReactNode;
  tone?: "info" | "success";
  className?: string | undefined;
}) {
  return (
    <div
      role={tone === "success" ? "status" : undefined}
      className={cn(
        "flex gap-3 rounded-xl border-2 border-dashed px-4 py-3 text-sm",
        tone === "success"
          ? "border-accent-foreground/50 bg-accent/25"
          : "border-pencil/40 bg-muted/60 text-muted-foreground",
        className,
      )}
    >
      {tone === "success" ? (
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" aria-hidden />
      ) : (
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      )}
      <div>{children}</div>
    </div>
  );
}

export function PrototypeNotice({ className }: { className?: string }) {
  return (
    <Notice className={className}>
      <strong className="text-foreground">Prototype:</strong> there are no real accounts yet.
      Nothing you type here leaves this browser, and passwords are never saved, so please don't use
      a real one.
    </Notice>
  );
}
