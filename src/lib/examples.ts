import type { Session } from "./tracker";
import type { BacklogItem, Goal } from "./intentions";

/*
 * Sample content for the prototype, all about one imaginary hobby project ("a trail-log web app"),
 * so first-time visitors see what each page is for instead of a blank screen.
 * Goals and backlog are seeded once and then belong to the user; example notes are only shown
 * (never saved) until the user writes their own, so they can't skew the weekly stats.
 */

const DAY = 24 * 3600 * 1000;

function isoDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function exampleGoals(now = Date.now()): Goal[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Ship the trail-log MVP",
      due: isoDate(now + 24 * DAY),
      done: false,
    },
    {
      id: crypto.randomUUID(),
      title: "Write tests for the API routes",
      due: isoDate(now + 10 * DAY),
      done: false,
    },
    { id: crypto.randomUUID(), title: "Deploy to a custom domain", done: true },
  ];
}

export function exampleBacklog(): BacklogItem[] {
  const item = (title: string, topic: string, lane: BacklogItem["lane"]): BacklogItem => ({
    id: crypto.randomUUID(),
    title,
    topic,
    lane,
  });
  return [
    item("Add photo upload to trail entries", "Frontend", "next"),
    item("Fix map pins jumping on zoom", "Bug fix", "next"),
    item("Paginate the /trails endpoint", "Backend", "later"),
    item("Dark mode toggle", "Styling", "later"),
    item("Swap fetch calls to React Query", "Refactor", "later"),
    item("Read up on service workers", "Learning", "later"),
    item("Set up CI on every push", "Backend", "done"),
  ];
}

export function exampleNotes(now = Date.now()): Session[] {
  const note = (
    daysAgo: number,
    hour: number,
    minutes: number,
    topic: string,
    workedOn: string,
    nextThing: string,
  ): Session => {
    const day = new Date(now - daysAgo * DAY);
    day.setHours(hour, 0, 0, 0);
    const start = day.getTime();
    return {
      id: `example-${daysAgo}`,
      start,
      end: start + minutes * 60 * 1000,
      durationSec: minutes * 60,
      topic,
      workedOn,
      nextThing,
    };
  };
  return [
    note(1, 20, 52, "Frontend", "Built the trail card grid", "Add photo upload to trail entries"),
    note(
      2,
      21,
      38,
      "Bug fix",
      "Tracked map pins jumping on zoom down to the marker anchor",
      "Patch the anchor offset and test on mobile",
    ),
    note(4, 19, 70, "Backend", "Wrote GET /trails with filtering", "Paginate the /trails endpoint"),
    note(6, 22, 25, "Styling", "Tweaked the colour palette and spacing", "Try a dark mode toggle"),
    note(
      9,
      20,
      45,
      "Learning",
      "Read about service workers for offline support",
      "Prototype caching the trail list",
    ),
    note(
      13,
      18,
      60,
      "Refactor",
      "Pulled fetch logic into hooks",
      "Swap fetch calls to React Query",
    ),
    note(
      20,
      21,
      40,
      "Frontend",
      "Set up routing and the layout shell",
      "Build the trail card grid",
    ),
    note(34, 19, 30, "Backend", "Created the database schema", "Write GET /trails"),
  ];
}

/** Deep-work seconds across the example notes from the past seven days. */
export function exampleWeekSeconds(now = Date.now()): number {
  return exampleNotes(now)
    .filter((n) => n.start >= now - 7 * DAY)
    .reduce((acc, n) => acc + n.durationSec, 0);
}
