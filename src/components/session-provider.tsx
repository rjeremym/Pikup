import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, NotebookPen, Pause, Timer } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  clearPendingSession,
  getPendingSession,
  getPendingNoteDraft,
  savePendingNoteDraft,
  lastNote,
  saveEndedSession,
  updateSessionNote,
  fmtDuration,
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const FIRST_SESSION_WELCOME_KEY = "pikup.firstSessionWelcomeSeen";

const emptyDraft = (): SessionNoteDraft => ({ workedOn: "", nextThing: "" });

export function SessionProvider({ children }: { children: ReactNode }) {
  const timer = useTimer();
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState<PendingSession | null>(null);
  const [draft, setDraft] = useState<SessionNoteDraft>(emptyDraft);
  const [noteOpen, setNoteOpen] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [timeSaved, setTimeSaved] = useState(false);
  const [noteError, setNoteError] = useState("");
  const [reminder, setReminder] = useState<Session | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const [feedback, setFeedback] = useState("");
  const returnFocus = useRef<HTMLElement | null>(null);
  const dismissFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === "pikup.sessions" || event.key === null) setRevision((n) => n + 1);
    };
    const onSessionUpdate = () => setRevision((n) => n + 1);
    window.addEventListener("storage", onStorage);
    window.addEventListener("pikup:sessions", onSessionUpdate);

    const saved = getPendingSession();
    if (saved) {
      setPending(saved);
      setDraft(getPendingNoteDraft() ?? emptyDraft());
      setNoteOpen(true);
      try {
        setPending(saveEndedSession(saved));
        setTimeSaved(true);
      } catch {
        setNoteError("Your session time couldn’t be saved. Use either button below to try again.");
      }
    }
    setReady(true);
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
  };

  const endSession = () => {
    if (getPendingSession() || pending) return;
    rememberFocus();
    const planned = lastNote()?.nextThing;
    const stopped = timer.stop();
    if (!stopped) return;
    const next: PendingSession = {
      ...stopped,
      id: crypto.randomUUID(),
      end: Date.now(),
      planned,
    };
    const initial = emptyDraft();
    setDraft(initial);
    setPending(next);
    setTimeSaved(false);
    setNoteError("");
    setReminder(null);
    setWelcomeOpen(false);
    setConfirmClose(false);
    setNoteOpen(true);
    try {
      setPending(saveEndedSession(next));
      setTimeSaved(true);
      savePendingNoteDraft(initial);
      setFeedback("Session saved. Add a note for next time, or save without one.");
    } catch {
      setNoteError("Your session couldn’t be fully saved. Use either button below to try again.");
    }
  };

  const updateDraft = (next: SessionNoteDraft) => {
    setDraft(next);
    try {
      savePendingNoteDraft(next);
      setNoteError("");
    } catch {
      setNoteError(
        "Your draft couldn’t be kept for later. Keep this popup open and try saving again.",
      );
    }
  };

  const finishSession = (withNote: boolean) => {
    const current = getPendingSession();
    if (!pending || (current && current.start !== pending.start)) return;
    let workedOn = withNote ? draft.workedOn.trim() || undefined : undefined;
    if (withNote && pending.planned) {
      if (draft.outcome === "completed") workedOn = pending.planned;
      else if (draft.outcome === "in-progress") workedOn ||= pending.planned;
    }
    const nextThing = withNote ? draft.nextThing.trim() || undefined : undefined;
    const outcome = withNote && pending.planned ? draft.outcome : undefined;
    try {
      const saved = saveEndedSession(current ?? pending);
      setPending(saved);
      setTimeSaved(true);
      if (
        !updateSessionNote(saved.id, {
          workedOn,
          nextThing,
          topic: withNote ? draft.topic : undefined,
          outcome,
        })
      ) {
        setNoteError("This session is no longer available. Close the popup and refresh the page.");
        return;
      }
      if (pending.planned && outcome === "completed") {
        const backlog = getBacklog();
        const match = backlog.find(
          (item) => item.lane !== "done" && item.title === pending.planned,
        );
        if (match)
          saveBacklog(
            backlog.map((item) => (item.id === match.id ? { ...item, lane: "done" } : item)),
          );
      }
      clearPendingSession();
    } catch {
      setNoteError("Couldn’t save your changes. Your session and draft are still here. Try again.");
      return;
    }
    setPending(null);
    setDraft(emptyDraft());
    setNoteError("");
    setConfirmClose(false);
    setNoteOpen(false);
    const message =
      workedOn || nextThing
        ? "Session and note saved."
        : outcome
          ? "Session outcome saved."
          : "Session saved without a note.";
    setFeedback(message);
    toast.success(message);
  };

  const changeNoteOpen = (open: boolean) => {
    if (open) {
      setNoteOpen(true);
      return;
    }
    dismissFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setConfirmClose(true);
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

        <Dialog open={Boolean(pending) && noteOpen} onOpenChange={changeNoteOpen}>
          <DialogContent
            className="paper-card flex h-[85dvh] max-h-[42rem] w-[calc(100%-2rem)] max-w-xl flex-col gap-0 overflow-hidden p-0"
            onCloseAutoFocus={restoreFocus}
          >
            {pending && (
              <SessionNoteForm
                pending={pending}
                draft={draft}
                error={noteError}
                header={
                  <>
                    <DialogTitle className="hand pr-5 text-3xl font-normal">
                      {pending.planned ? "How did it go?" : "What did you work on?"}
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {timeSaved ? "Session saved" : "Timer stopped"} ·{" "}
                      {fmtDuration(pending?.elapsed ?? 0)}
                    </DialogDescription>
                  </>
                }
                onChange={updateDraft}
                onSave={() => finishSession(true)}
                onSkip={() => finishSession(false)}
              />
            )}
            <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
              <AlertDialogContent
                className="paper-card w-[calc(100%-2rem)] max-w-md rounded-2xl"
                onCloseAutoFocus={(event) => {
                  if (noteOpen && dismissFocus.current?.isConnected) {
                    event.preventDefault();
                    dismissFocus.current.focus({ preventScroll: true });
                  }
                }}
              >
                <AlertDialogTitle className="hand text-3xl font-normal">
                  Save without a note?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {timeSaved
                    ? "Your session time is already saved."
                    : "Your timer has stopped, but the session time hasn’t been saved yet."}{" "}
                  Saving without a note will discard this draft. Keep writing to finish and save
                  your note.
                </AlertDialogDescription>
                <div className="grid grid-cols-2 items-stretch gap-3">
                  <button
                    type="button"
                    className="sketch-btn min-h-11 px-3 text-xl"
                    onClick={() => {
                      setConfirmClose(false);
                      finishSession(false);
                    }}
                  >
                    Skip note
                  </button>
                  <AlertDialogCancel className="sketch-btn-primary m-0 h-auto min-h-11 border-primary bg-primary px-3 text-xl whitespace-normal text-primary-foreground hover:bg-primary hover:text-primary-foreground">
                    Keep writing
                  </AlertDialogCancel>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </DialogContent>
        </Dialog>
      </SessionRevisionContext.Provider>
    </SessionContext.Provider>
  );
}
