import { useSessionRevision } from "@/lib/session-context";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { lastNote, workedOnLabel, type Session } from "@/lib/tracker";
import { useSessionControls } from "@/lib/session-context";
import { useAccount } from "@/lib/account";
import { findPage } from "@/lib/nav";
import { PageLinkContent } from "@/components/site-header";
import { cn } from "@/lib/utils";
import { Notice } from "@/components/form-bits";
import { readJSON, writeJSON } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pikup — pick up where you left off" },
      {
        name: "description",
        content:
          "A session tracker for solo devs building side projects. Pikup opens with the note you left last time, times your coding session, and keeps your next backlog tasks ready.",
      },
      { property: "og:title", content: "Pikup — pick up where you left off" },
      {
        property: "og:description",
        content:
          "A session tracker for solo devs building side projects. Pikup opens with the note you left last time, times your coding session, and keeps your next backlog tasks ready.",
      },
    ],
  }),
  component: Landing,
});

const LOOP = [
  {
    n: "1",
    title: "Start your session",
    body: "If you left a note last time, it appears when you start so you know where to pick up.",
  },
  {
    n: "2",
    title: "Focus on your task",
    body: "Let the timer track your deep-work time. Pause whenever you need a break.",
  },
  {
    n: "3",
    title: "Leave your next step",
    body: "End your session, record how your planned task went, and leave a note for next time.",
  },
];

function Landing() {
  const revision = useSessionRevision();
  const { timer, pending, ready, startSession, finishNote } = useSessionControls();
  const account = useAccount();
  const [note, setNote] = useState<Session | undefined>();

  useEffect(() => {
    setNote(lastNote());
  }, [revision]);

  return (
    <main>
      <PrototypeBanner />

      {/* Hero: the promise, one primary action, and a peek at the core value (last note) */}
      <section className="mx-auto grid max-w-5xl gap-12 px-4 pt-12 pb-16 sm:pt-20 lg:grid-cols-[1fr_17rem] lg:items-center">
        <div>
          {/* Who it's for, before the promise */}
          <p className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            For solo devs building side projects
          </p>
          <h1 className="hand text-5xl leading-[1.08] sm:text-7xl">
            <span className="text-primary">Pick up</span> where you left off.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            You only get a few hours a week for your project. Pikup opens with the note you left
            last time, times your coding session, and keeps your next few backlog tasks ready, so
            you&apos;re building in the first minute, not the tenth.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            {timer.running ? (
              <Link to="/momentum/timer" className="sketch-btn-primary px-8 py-3 text-3xl">
                Back to your session
              </Link>
            ) : (
              <button
                type="button"
                disabled={!ready}
                onClick={pending ? finishNote : startSession}
                className="sketch-btn-primary px-8 py-3 text-3xl"
              >
                <Play className="h-6 w-6" aria-hidden />
                {pending ? "Finish your note" : "Start a session"}
              </button>
            )}
            {!account && (
              <Link to="/account/create" className="sketch-link">
                or create an account
              </Link>
            )}
          </div>
          {/* The discovery research behind the promise */}
          <p className="mt-6 max-w-xl text-sm text-muted-foreground">
            In a study of 10,000 programming sessions, only 1 in 10 got back to coding within a
            minute (Parnin &amp; Rugaber, 2011).
          </p>
        </div>

        <aside
          aria-label="Your last note"
          className="paper-card relative mx-auto w-full max-w-xs rotate-2 px-5 pt-9 pb-5"
        >
          <div className="washi absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-3" />
          <p className="hand text-2xl text-primary">Note to self</p>
          {note && (note.workedOn || note.nextThing) ? (
            <div className="mt-2 space-y-1.5 text-sm">
              {note.workedOn && (
                <p>
                  <span className="font-semibold">{workedOnLabel(note)}: </span>
                  {note.workedOn}
                </p>
              )}
              {note.nextThing && (
                <p>
                  <span className="font-semibold">Next up: </span>
                  <span className="scribble-underline">{note.nextThing}</span>
                </p>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground italic">
              Nothing here yet… finish a session and the note you leave lands right here.
            </p>
          )}
          <Link to="/momentum/timer" className="sketch-link mt-3 text-base">
            pick up from here <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </aside>
      </section>

      {/* Direct destinations grouped by the work they support. */}
      <section aria-labelledby="map-heading" className="mx-auto max-w-5xl px-4 pb-16">
        <h2 id="map-heading" className="hand text-4xl">
          Plan, focus, and see your progress
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Choose what to build, pick up where you left off, and see what your focus time
          accomplished. Each page is one click away in the navigation.
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {WORKFLOW_GROUPS.map((group) => (
            <WorkflowCard key={group.title} group={group} />
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Try a session right away. You can start, pause, or end it from any page using the session
          controls above.
        </p>
      </section>

      {/* The core loop, in three steps */}
      <section aria-labelledby="loop-heading" className="mx-auto max-w-5xl px-4 pb-20">
        <h2 id="loop-heading" className="hand text-4xl">
          One session, three steps
        </h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {LOOP.map((step) => (
            <li
              key={step.n}
              className="rounded-2xl border-2 border-dashed border-pencil/50 bg-card/70 px-5 py-4"
            >
              <span className="hand text-4xl text-primary" aria-hidden>
                {step.n}
              </span>
              <p className="hand text-2xl">{step.title}</p>
              <p className="text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="border-t-2 border-dashed border-pencil/30 py-6 text-center text-sm text-muted-foreground">
        Pikup · low-fidelity prototype · your data stays in this browser
      </footer>
    </main>
  );
}

const PROTOTYPE_NOTICE_KEY = "pikup.prototypeNoticeDismissed";

/** Sets expectations for testers; once dismissed it stays dismissed in this browser. */
function PrototypeBanner() {
  // read after mount so the server render and first client render match
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(!readJSON(PROTOTYPE_NOTICE_KEY, () => false));
  }, []);

  if (!open) return null;
  return (
    <div className="mx-auto max-w-5xl px-4 pt-6">
      <Notice
        onDismiss={() => {
          writeJSON(PROTOTYPE_NOTICE_KEY, true);
          setOpen(false);
        }}
      >
        <strong className="text-foreground">This is a prototype.</strong> It&apos;s here to test the
        idea and how the pages flow together. Nothing you enter is saved to an account or sent
        anywhere (it stays in this browser), and some parts of the site aren&apos;t meant to look
        good yet.
      </Notice>
    </div>
  );
}

const WORKFLOW_GROUPS = [
  {
    title: "Plan your work",
    blurb: "Set a direction and choose what to build next.",
    tape: "bg-accent/50",
    text: "text-accent-foreground",
    pages: [findPage("/intentions/goals"), findPage("/intentions/backlog")],
  },
  {
    title: "Pick up & focus",
    blurb: "Spend less time remembering and more time making progress.",
    tape: "bg-primary/25",
    text: "text-primary",
    pages: [findPage("/momentum/timer"), findPage("/intentions/notes")],
  },
  {
    title: "See your progress",
    blurb: "See whether your focus time is turning into finished tasks.",
    tape: "bg-washi",
    text: "text-foreground",
    pages: [findPage("/momentum/stats")],
  },
];

function WorkflowCard({ group }: { group: (typeof WORKFLOW_GROUPS)[number] }) {
  return (
    <div className="paper-card relative px-5 pt-9 pb-5">
      <span
        className={cn("absolute -top-3 left-8 h-7 w-24 -rotate-3 rounded-sm", group.tape)}
        aria-hidden
      />
      <h3 className={cn("hand text-3xl", group.text)}>{group.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{group.blurb}</p>
      <ul className="mt-4 space-y-1">
        {group.pages.map((page) => (
          <li key={page.to}>
            <Link
              to={page.to}
              className="flex items-start gap-3 rounded-xl px-2 py-3 hover:bg-muted"
            >
              <PageLinkContent page={page} />
              <ArrowRight className="mt-1 ml-auto h-4 w-4 shrink-0 opacity-40" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
