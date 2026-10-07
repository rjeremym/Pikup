import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { endOfDay, format, isToday, isYesterday, parseISO, startOfDay, subDays } from "date-fns";
import { PageHeader } from "@/components/section-layout";
import { Notice } from "@/components/form-bits";
import { exampleNotes } from "@/lib/examples";
import { fmtMinutes, getSessions, type Session } from "@/lib/tracker";

export const Route = createFileRoute("/intentions/notes")({
  head: () => ({
    meta: [
      { title: "Notes — Pikup" },
      {
        name: "description",
        content: "Every note you've left yourself, searchable by topic or date.",
      },
    ],
  }),
  component: NotesPage,
});

const RANGES = [
  { id: "any", label: "Any time" },
  { id: "7d", label: "Past 7 days" },
  { id: "30d", label: "Past 30 days" },
  { id: "custom", label: "Pick dates…" },
] as const;
type Range = (typeof RANGES)[number]["id"];

const UNTAGGED = "Untagged";

function NotesPage() {
  const [notes, setNotes] = useState<Session[] | null>(null);
  const [examples, setExamples] = useState(false);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [range, setRange] = useState<Range>("any");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    const own = getSessions()
      .filter((s) => s.workedOn || s.nextThing)
      .sort((a, b) => b.start - a.start);
    setExamples(own.length === 0);
    setNotes(own.length ? own : exampleNotes());
  }, []);

  const topics = useMemo(() => {
    const set = new Set((notes ?? []).map((n) => n.topic ?? UNTAGGED));
    return [...set].sort((a, b) => (a === UNTAGGED ? 1 : b === UNTAGGED ? -1 : a.localeCompare(b)));
  }, [notes]);

  const filtered = useMemo(() => {
    if (!notes) return [];
    const q = query.trim().toLowerCase();
    const now = new Date();
    const [min, max] =
      range === "7d"
        ? [startOfDay(subDays(now, 6)).getTime(), Infinity]
        : range === "30d"
          ? [startOfDay(subDays(now, 29)).getTime(), Infinity]
          : range === "custom"
            ? [
                from ? startOfDay(parseISO(from)).getTime() : -Infinity,
                to ? endOfDay(parseISO(to)).getTime() : Infinity,
              ]
            : [-Infinity, Infinity];
    return notes.filter(
      (n) =>
        n.start >= min &&
        n.start <= max &&
        (!topic || (n.topic ?? UNTAGGED) === topic) &&
        (!q || `${n.workedOn ?? ""} ${n.nextThing ?? ""}`.toLowerCase().includes(q)),
    );
  }, [notes, query, topic, range, from, to]);

  const groups = useMemo(() => {
    const byDay = new Map<string, Session[]>();
    for (const n of filtered) {
      const key = format(n.start, "yyyy-MM-dd");
      byDay.set(key, [...(byDay.get(key) ?? []), n]);
    }
    return [...byDay.entries()];
  }, [filtered]);

  const filtering = Boolean(query.trim() || topic || range !== "any");
  const clear = () => {
    setQuery("");
    setTopic(null);
    setRange("any");
    setFrom("");
    setTo("");
  };

  return (
    <>
      <PageHeader
        title="Notes"
        lead="Every note you've left yourself at the end of a session. Search them, or narrow by date and topic."
      />

      {examples && (
        <Notice className="mb-6">
          <strong className="text-foreground">These are example notes.</strong> Yours will replace
          them as soon as you{" "}
          <Link to="/momentum/timer" className="underline decoration-dotted underline-offset-2">
            finish a session
          </Link>{" "}
          and leave a note.
        </Notice>
      )}

      {/* Filters: one block above the results, so it's clear they scope everything below */}
      <div
        role="search"
        aria-label="Filter notes"
        className="space-y-4 rounded-2xl border-2 border-dashed border-pencil/50 bg-card/70 p-4"
      >
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <label htmlFor="note-search" className="sr-only">
            Search notes
          </label>
          <input
            id="note-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search what you worked on or planned next…"
            className="sketch-input pl-10"
          />
        </div>

        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="sr-only">Date</legend>
          <span className="w-14 text-sm font-semibold text-muted-foreground" aria-hidden>
            When
          </span>
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={range === r.id}
              onClick={() => setRange(r.id)}
              className="sketch-chip"
            >
              {r.label}
            </button>
          ))}
          {/* progressive disclosure: date pickers only when asked for */}
          {range === "custom" && (
            <span className="flex w-full flex-wrap items-center gap-2 pl-0 sm:w-auto sm:pl-2">
              <label htmlFor="note-from" className="sr-only">
                From
              </label>
              <input
                id="note-from"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
                className="sketch-input w-auto py-1 text-sm"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <label htmlFor="note-to" className="sr-only">
                To
              </label>
              <input
                id="note-to"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
                className="sketch-input w-auto py-1 text-sm"
              />
            </span>
          )}
        </fieldset>

        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="sr-only">Topic</legend>
          <span className="w-14 text-sm font-semibold text-muted-foreground" aria-hidden>
            Topic
          </span>
          <button
            type="button"
            aria-pressed={topic === null}
            onClick={() => setTopic(null)}
            className="sketch-chip"
          >
            All
          </button>
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={topic === t}
              onClick={() => setTopic(topic === t ? null : t)}
              className="sketch-chip"
            >
              {t}
            </button>
          ))}
        </fieldset>
      </div>

      {notes && (
        <>
          <p
            className="mt-6 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground"
            aria-live="polite"
          >
            Showing {filtered.length} of {notes.length} {notes.length === 1 ? "note" : "notes"}
            {filtering && (
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-1 font-semibold text-foreground underline decoration-dotted underline-offset-2"
              >
                <X className="h-3.5 w-3.5" aria-hidden /> Clear filters
              </button>
            )}
          </p>

          {groups.length ? (
            <div className="mt-4 space-y-8">
              {groups.map(([day, dayNotes]) => (
                <section key={day} aria-label={dayLabel(day)}>
                  <h2 className="hand text-2xl">{dayLabel(day)}</h2>
                  <ul className="mt-2 space-y-3">
                    {dayNotes.map((n) => (
                      <NoteCard key={n.id} note={n} query={query} onTopic={setTopic} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border-2 border-dashed border-pencil/40 px-6 py-10 text-center">
              <p className="hand text-2xl">No notes match.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different word, a wider date range, or{" "}
                <button
                  type="button"
                  onClick={clear}
                  className="font-semibold text-foreground underline decoration-dotted underline-offset-2"
                >
                  clear the filters
                </button>
                .
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}

function dayLabel(isoDay: string) {
  const d = parseISO(isoDay);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMM d");
}

function NoteCard({
  note,
  query,
  onTopic,
}: {
  note: Session;
  query: string;
  onTopic: (topic: string) => void;
}) {
  return (
    <li className="rounded-2xl border-2 border-dashed border-pencil/50 bg-card px-5 py-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <time dateTime={new Date(note.start).toISOString()}>{format(note.start, "h:mm a")}</time>
        <span aria-hidden>·</span>
        <span>{fmtMinutes(note.durationSec)} session</span>
        {note.topic && (
          <button
            type="button"
            onClick={() => onTopic(note.topic!)}
            className="sketch-chip ml-auto text-xs"
            title={`Show only ${note.topic} notes`}
          >
            #{note.topic}
          </button>
        )}
      </div>
      {note.workedOn && (
        <p className="mt-2">
          <span className="font-semibold">Worked on: </span>
          <Highlight text={note.workedOn} query={query} />
        </p>
      )}
      {note.nextThing && (
        <p className="mt-1">
          <span className="font-semibold">Next up: </span>
          <Highlight text={note.nextThing} query={query} />
        </p>
      )}
    </li>
  );
}

/** Marks every match of the search, so it's obvious why a note made the cut. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-washi px-0.5 text-foreground">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
