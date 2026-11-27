import type { Session } from "./tracker";
import type { BacklogItem, Goal } from "./intentions";

/*
 * Starting content for the prototype, so a first-time visitor lands mid-project instead of on blank
 * screens: a recipe-sharing website, partway through its login feature. Goals, backlog and a short
 * session history are seeded once and then belong to the user; example notes are only shown, never
 * saved, if every note has been deleted.
 */

const DAY = 24 * 3600 * 1000;
const HOUR = 3600 * 1000;

function isoDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function exampleGoals(now = Date.now()): Goal[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Finish user accounts",
      due: isoDate(now + 7 * DAY),
      done: false,
    },
    {
      id: crypto.randomUUID(),
      title: "Share the site with friends",
      due: isoDate(now + 21 * DAY),
      done: false,
    },
    { id: crypto.randomUUID(), title: "Pick a name for the site", done: true },
  ];
}

/** The first Up next item must match the seeded note's "Next up" exactly, so completing it checks it off. */
export function exampleBacklog(): BacklogItem[] {
  const item = (title: string, topic: string, lane: BacklogItem["lane"]): BacklogItem => ({
    id: crypto.randomUUID(),
    title,
    topic,
    lane,
  });
  return [
    item("Connect the login form to the API", "Backend", "next"),
    item("Show an error for a wrong password", "Frontend", "next"),
    item("Add a “Forgot password” link", "Frontend", "next"),
    item("Let users save favorite recipes", "Backend", "later"),
    item("Add a recipe search bar", "Frontend", "later"),
    item("Make the site work on phones", "Styling", "later"),
    item("Build the sign-up page", "Frontend", "done"),
    item("Save new users to the database", "Backend", "done"),
    item("Build the login form", "Frontend", "done"),
  ];
}

/**
 * Saved on a first visit so the class demo starts mid-project: a session in each of the two weeks
 * before, then two this week, the last one partway through the login feature. That last note is
 * the one Pikup brings back. This week adds up to 1h 58m, just under the first sticker's 2h, so
 * a 2-minute focus session unlocks it.
 */
export function exampleSessions(now = new Date()): Session[] {
  const daysIntoWeek = (now.getDay() + 6) % 7; // Monday = 0
  const startOn = (daysBeforeToday: number, hour: number) => {
    const day = new Date(now);
    day.setDate(now.getDate() - daysBeforeToday);
    day.setHours(hour, 0, 0, 0);
    return day.getTime();
  };
  const weekStart = startOn(daysIntoWeek, 0);
  // Both of this week's sessions have to land in this week, even when presenting on a Monday
  const latest = daysIntoWeek >= 1 ? startOn(1, 21) : Math.max(weekStart, now.getTime() - 3 * HOUR);
  const earlier =
    daysIntoWeek >= 2
      ? startOn(2, 20)
      : daysIntoWeek === 1
        ? startOn(1, 12)
        : Math.max(weekStart, latest - 2 * HOUR);

  const session = (
    id: string,
    start: number,
    minutes: number,
    topic: string,
    workedOn: string,
    nextThing: string,
  ): Session => ({
    id: `seed-${id}`,
    start,
    end: start + minutes * 60 * 1000,
    durationSec: minutes * 60,
    topic,
    workedOn,
    nextThing,
  });
  // oldest first: the last one is the note Pikup shows as "where you left off"
  const sessions = [
    session(
      "setup",
      startOn(daysIntoWeek + 9, 20),
      45,
      "Frontend",
      "Set up the project and the page layout",
      "Build the sign-up page",
    ),
    session(
      "sign-up",
      startOn(daysIntoWeek + 3, 14),
      70,
      "Frontend",
      "Built the sign-up page",
      "Save new users to the database",
    ),
    session(
      "save-users",
      earlier,
      38,
      "Backend",
      "Saved new users to the database",
      "Build the login form",
    ),
    session(
      "login",
      latest,
      80,
      "Frontend",
      "Built the login form, but it isn't connected to anything yet.",
      "Connect the login form to the API",
    ),
  ];
  // each session planned whatever the one before it left as "next up", and got it done
  return sessions.map((s, i) =>
    i ? { ...s, plannedTask: sessions[i - 1]!.nextThing, outcome: "completed" as const } : s,
  );
}

/** The seeded sessions, newest first, for showing as examples without saving them. */
export function exampleNotes(now = Date.now()): Session[] {
  return exampleSessions(new Date(now)).reverse();
}

/** Deep-work seconds across the example notes from the past seven days. */
export function exampleWeekSeconds(now = Date.now()): number {
  return exampleNotes(now)
    .filter((n) => n.start >= now - 7 * DAY)
    .reduce((acc, n) => acc + n.durationSec, 0);
}
