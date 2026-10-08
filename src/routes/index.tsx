import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { lastNote, useTimer, workedOnLabel, type Session } from "@/lib/tracker";
import { useAccount } from "@/lib/account";
import { TONE, sectionById, visibleChildren, type NavSection } from "@/lib/nav";
import { PageLinkContent } from "@/components/site-header";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pikup — keep your momentum and your intentions" },
      {
        name: "description",
        content:
          "A sketchbook for solo developers: a focus timer that remembers where you left off, plus your goals, backlog and notes.",
      },
      { property: "og:title", content: "Pikup — keep your momentum and your intentions" },
      {
        property: "og:description",
        content:
          "A sketchbook for solo developers: a focus timer that remembers where you left off, plus your goals, backlog and notes.",
      },
    ],
  }),
  component: Landing,
});

const LOOP = [
  { n: "1", title: "Read your note", body: "Last session's “next up” is waiting on the timer." },
  { n: "2", title: "Start the clock", body: "Deep work, with the clock tucked away if you like." },
  { n: "3", title: "Leave a note", body: "Two lines for future-you before you stop." },
];

function Landing() {
  const timer = useTimer();
  const account = useAccount();
  const [note, setNote] = useState<Session | undefined>();

  useEffect(() => {
    setNote(lastNote());
  }, []);

  return (
    <main>
      {/* Hero: the promise, one primary action, and a peek at the core value (last note) */}
      <section className="mx-auto grid max-w-5xl gap-12 px-4 pt-12 pb-16 sm:pt-20 lg:grid-cols-[1fr_17rem] lg:items-center">
        <div>
          <p className="hand text-xl text-muted-foreground">a sketchbook for solo devs</p>
          <h1 className="hand mt-3 text-5xl leading-[1.08] sm:text-7xl">
            Keep your <span className="scribble-underline text-primary">momentum</span>{" "}
            <span className="relative inline-block px-1">
              <span
                className="washi absolute inset-x-0 top-1/2 h-[0.62em] -translate-y-1/2 -rotate-2"
                aria-hidden
              />
              <span className="relative">AND</span>
            </span>{" "}
            your{" "}
            <span className="relative inline-block">
              <span
                className="absolute -inset-x-1 bottom-[0.1em] h-[0.45em] -rotate-1 rounded-sm bg-accent/60"
                aria-hidden
              />
              <span className="relative text-accent-foreground">intentions</span>
            </span>{" "}
            in development
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Pikup remembers where you left off, so even a short session starts moving straight away
            — and keeps your goals, backlog and notes close, so the hours point somewhere.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link to="/momentum/timer" className="sketch-btn-primary px-8 py-3 text-3xl">
              <Play className="h-6 w-6" aria-hidden />
              {timer.running ? "Back to your session" : "Start a session"}
            </Link>
            {!account && (
              <Link to="/account/create" className="sketch-link">
                or create an account
              </Link>
            )}
          </div>
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

      {/* The site map, visible: two halves of the headline, each with its pages */}
      <section aria-labelledby="map-heading" className="mx-auto max-w-5xl px-4 pb-16">
        <h2 id="map-heading" className="hand text-4xl">
          Where to next?
        </h2>
        <p className="text-muted-foreground">
          Pikup has two halves, just like the headline. Pick one, then a page.
        </p>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <SectionMap section={sectionById("momentum")} />
          <SectionMap section={sectionById("intentions")} />
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          {account ? (
            <>
              Signed in as <span className="font-semibold text-foreground">{account.name}</span> ·{" "}
              <Link to="/account" className="underline decoration-dotted underline-offset-4">
                your account
              </Link>
            </>
          ) : (
            <>
              Using Pikup on more than one computer?{" "}
              <Link
                to="/account/sign-in"
                className="underline decoration-dotted underline-offset-4"
              >
                Sign in
              </Link>{" "}
              or{" "}
              <Link to="/account/create" className="underline decoration-dotted underline-offset-4">
                create an account
              </Link>
              .
            </>
          )}
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

function SectionMap({ section }: { section: NavSection }) {
  const tone = TONE[section.id];
  return (
    <div className="paper-card relative px-6 pt-10 pb-5">
      <span
        className={cn("absolute -top-3 left-8 h-7 w-24 -rotate-3 rounded-sm", tone.tape)}
        aria-hidden
      />
      <Link to={section.to} className="group inline-flex items-baseline gap-2">
        <h3 className={cn("hand text-4xl", tone.text)}>{section.label}</h3>
        <span className="text-sm text-muted-foreground group-hover:text-foreground">
          overview →
        </span>
      </Link>
      <p className="text-sm text-muted-foreground">{section.blurb}</p>
      <ul className="mt-4 space-y-1 border-l-2 border-dashed border-pencil/40 pl-2">
        {visibleChildren(section).map((page) => (
          <li key={page.to}>
            <Link
              to={page.to}
              className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-muted"
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
