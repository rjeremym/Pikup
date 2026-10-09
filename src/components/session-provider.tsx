import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowRight, NotebookPen, Pause, Timer } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  clearPendingSession,
  getPendingSession,
  getPendingNoteDraft,
  savePendingNoteDraft,
  lastNote,
  saveSession,
  setPendingSession,
  useTimer,
  workedOnLabel,
  type PendingSession,
  type Session,
  type SessionNoteDraft,
} from "@/lib/tracker";
import { getBacklog, saveBacklog } from "@/lib/intentions";
import { readJSON, writeJSON } from "@/lib/storage";
import { SessionContext, SessionRevisionContext } from "@/lib/session-context";
import { SessionNoteForm } from "@/components/session-note-form";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const FIRST_SESSION_WELCOME_KEY = "pikup.firstSessionWelcomeSeen";

const emptyDraft = (): SessionNoteDraft => ({ workedOn: "", nextThing: "" });

export function SessionProvider({ children }: { children: ReactNode }) {
  const timer = useTimer();
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState<PendingSession | null>(null);
  const [draft, setDraft] = useState<SessionNoteDraft>(emptyDraft);
  const [noteOpen, setNoteOpen] = useState(false);
  const [reminder, setReminder] = useState<Session | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const [feedback, setFeedback] = useState("");
  const returnFocus = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();
  const pathname = useLocation({ select: (location) => location.pathname });

  useEffect(() => {
    const saved = getPendingSession();
    setPending(saved);
    setDraft(getPendingNoteDraft() ?? emptyDraft());
    setNoteOpen(Boolean(saved));
    setReady(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === "pikup.sessions" || event.key === null) setRevision((n) => n + 1);
    };
    const onSessionUpdate = () => setRevision((n) => n + 1);
    window.addEventListener("storage", onStorage);
    window.addEventListener("pikup:sessions", onSessionUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pikup:sessions", onSessionUpdate);
    };
  }, []);

  const rememberFocus = () => {
    returnFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
  };

  const startSession = () => {
    if (!ready || timer.running || getPendingSession()) return;
    rememberFocus();
    const previous = lastNote();
    const showWelcome = readJSON<boolean>(FIRST_SESSION_WELCOME_KEY, () => false) !== true;
    timer.start();
    if (showWelcome) writeJSON(FIRST_SESSION_WELCOME_KEY, true);
    setWelcomeOpen(showWelcome);
    setReminder(previous ?? null);
    setFeedback("Session started.");
    // The home page only starts sessions; running one happens on the session page.
    if (pathname === "/") navigate({ to: "/momentum/timer" });
  };

  const endSession = () => {
    if (getPendingSession()) return;
    rememberFocus();
    const stopped = timer.stop();
    if (!stopped) return;
    const next: PendingSession = {
      ...stopped,
      end: Date.now(),
      planned: lastNote()?.nextThing,
    };
    setPendingSession(next);
    const initial = emptyDraft();
    savePendingNoteDraft(initial);
    setDraft(initial);
    setPending(next);
    setReminder(null);
    setWelcomeOpen(false);
    setNoteOpen(true);
    setFeedback("Session ended. Leave a note for next time.");
  };

  const updateDraft = (next: SessionNoteDraft) => {
    savePendingNoteDraft(next);
    setDraft(next);
  };

  const finishSession = (withNote: boolean) => {
    // Clearing the stored pending session makes repeated saves harmless.
    const current = getPendingSession();
    if (!pending || !current || current.start !== pending.start) return;
    let workedOn = withNote ? draft.workedOn.trim() || undefined : undefined;
    if (withNote && pending.planned) {
      if (draft.outcome === "completed") workedOn = pending.planned;
      else if (draft.outcome === "in-progress") workedOn ||= pending.planned;
    }
    const nextThing = withNote ? draft.nextThing.trim() || undefined : undefined;
    saveSession({
      id: crypto.randomUUID(),
      start: pending.start,
      end: pending.end ?? pending.start + pending.elapsed * 1000,
      durationSec: pending.elapsed,
      plannedTask: pending.planned,
      workedOn,
      nextThing,
      topic: withNote ? draft.topic : undefined,
      outcome: withNote && pending.planned ? draft.outcome : undefined,
    });
    if (withNote && pending.planned && draft.outcome === "completed") {
      const backlog = getBacklog();
      const match = backlog.find((item) => item.lane !== "done" && item.title === pending.planned);
      if (match)
        saveBacklog(
          backlog.map((item) => (item.id === match.id ? { ...item, lane: "done" } : item)),
        );
    }
    clearPendingSession();
    setPending(null);
    setDraft(emptyDraft());
    setNoteOpen(false);
    setRevision((n) => n + 1);
    const message =
      workedOn || nextThing ? "Session and note saved." : "Session saved without a note.";
    setFeedback(message);
    toast.success(message);
    navigate({ to: "/momentum/stats" });
  };

  const restoreFocus = (event: Event) => {
    if (returnFocus.current?.isConnected) {
      event.preventDefault();
      returnFocus.current.focus();
    }
  };

  return (
    <SessionContext.Provider
      value={{
        timer,
        pending,
        ready,
        startSession,
        endSession,
        finishNote: () => {
          rememberFocus();
          setNoteOpen(true);
        },
      }}
    >
      <SessionRevisionContext.Provider value={revision}>
        {children}
        <Toaster position="bottom-right" />
        <p className="sr-only" role="status" aria-live="polite">
          {feedback}
        </p>

        <Dialog
          open={welcomeOpen || Boolean(reminder)}
          onOpenChange={(open) => {
            if (!open) {
              setWelcomeOpen(false);
              setReminder(null);
            }
          }}
        >
          <DialogContent
            className="paper-card max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto p-6 sm:p-8"
            onCloseAutoFocus={restoreFocus}
          >
            <DialogTitle className="hand pr-5 text-3xl font-normal">
              {welcomeOpen ? "Congrats, you just started a session!" : "Pick up where you left off"}
            </DialogTitle>
            <DialogDescription>
              {welcomeOpen
                ? "A session is time you set aside to focus on a task. Your timer is running now."
                : "Your session has started. Here’s the note you left last time."}
            </DialogDescription>
            {welcomeOpen && (
              <div className="space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <Timer className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                    <p>
                      <strong>Keep working.</strong> Work on your project while Pikup tracks your
                      focus time in the background.
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <Pause className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                    <p>
                      <strong>Take a break.</strong> Use Pause in the navigation. Paused time
                      doesn’t count toward deep-work hours.
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <NotebookPen className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                    <p>
                      <strong>Finish with a note.</strong> Use the End button to record what you
                      worked on and leave your next step for next time.
                    </p>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Your saved sessions and task outcomes appear in Weekly summary.
                </p>
              </div>
            )}
            {reminder && !welcomeOpen && (
              <div className="space-y-4 rounded-xl border-2 border-dashed border-pencil/40 bg-muted/60 p-5">
                {reminder?.workedOn && (
                  <p className="break-words">
                    <span className="mb-1 block text-sm font-semibold text-muted-foreground">
                      {workedOnLabel(reminder)}
                    </span>
                    {reminder.workedOn}
                  </p>
                )}
                {reminder?.nextThing && (
                  <p className="break-words">
                    <span className="mb-1 block text-sm font-semibold text-muted-foreground">
                      Next up
                    </span>
                    <span className="scribble-underline">{reminder.nextThing}</span>
                  </p>
                )}
              </div>
            )}
            <button
              type="button"
              className="sketch-btn-primary justify-self-start"
              onClick={() => {
                setWelcomeOpen(false);
                setReminder(null);
              }}
            >
              <ArrowRight className="h-5 w-5" aria-hidden />
              Got it — let’s work
            </button>
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(pending) && noteOpen} onOpenChange={setNoteOpen}>
          <DialogContent
            className="paper-card max-h-[85dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto p-6 sm:p-8"
            onCloseAutoFocus={restoreFocus}
          >
            <DialogTitle className="hand pr-5 text-3xl font-normal">
              Leave a note for next time
            </DialogTitle>
            <DialogDescription>
              Your session has ended. Save what you worked on and what’s next.
            </DialogDescription>
            {pending && (
              <SessionNoteForm
                pending={pending}
                draft={draft}
                onChange={updateDraft}
                onSave={() => finishSession(true)}
                onSkip={() => finishSession(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </SessionRevisionContext.Provider>
    </SessionContext.Provider>
  );
}
