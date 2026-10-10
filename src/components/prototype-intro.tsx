import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { readJSON, writeJSON } from "@/lib/storage";
import { getPendingSession } from "@/lib/tracker";
import { PROTOTYPE_INTRO_EVENT } from "@/lib/prototype-intro";

const SEEN_KEY = "pikup.prototypeIntroSeen";

const GOAL_STEPS = [
  "Look over your backlog and pick something to work on.",
  "Run a short session, then leave a note for next time.",
  "Start another session and see Pikup bring that note back.",
  "Check how your week is adding up.",
];

/**
 * First visit, on whichever page a tester lands: says this is an early prototype, sets the scene
 * and gives them a goal. Once closed it stays closed in this browser until reopened.
 */
export function PrototypeIntro() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // read after mount so the server render and first client render match; skip it while a
    // session note is waiting so two popups never stack
    if (!readJSON(SEEN_KEY, () => false) && !getPendingSession()) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(PROTOTYPE_INTRO_EVENT, reopen);
    return () => window.removeEventListener(PROTOTYPE_INTRO_EVENT, reopen);
  }, []);

  const changeOpen = (next: boolean) => {
    if (!next) writeJSON(SEEN_KEY, true);
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="paper-card max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto p-6 sm:p-8">
        <DialogTitle className="hand pr-5 text-3xl font-normal">
          Welcome to the Pikup prototype
        </DialogTitle>
        <DialogDescription>
          This is an early, low-fidelity prototype. We’re testing the idea and how the pages flow
          together, so some parts aren’t meant to look finished yet. Nothing you enter leaves this
          browser.
        </DialogDescription>
        <div className="space-y-4 rounded-xl border-2 border-dashed border-pencil/40 bg-muted/60 p-5 text-sm">
          <div>
            <p className="mb-1 font-semibold text-muted-foreground">Picture this</p>
            <p>
              You’re a hobbyist developer building a trail-log web app in your spare evenings. You
              haven’t touched it in a few days, and tonight you’ve got an hour.
            </p>
          </div>
          <div>
            <p className="mb-1 font-semibold text-muted-foreground">Your goal</p>
            <p className="font-semibold">
              Get back into your project quickly, and leave yourself a clear next step.
            </p>
            <p className="mt-2">Along the way, try to:</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              {GOAL_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          There’s no set path. Use the navigation at the top to go anywhere, in any order.
        </p>
        <button
          type="button"
          className="sketch-btn-primary justify-self-start"
          onClick={() => changeOpen(false)}
        >
          <ArrowRight className="h-5 w-5" aria-hidden />
          Got it — let’s go
        </button>
      </DialogContent>
    </Dialog>
  );
}
