import { useEffect, useState } from "react";

export interface Session {
  id: string;
  start: number;
  end: number;
  durationSec: number;
  /** The task planned for this session; absent on older sessions. */
  plannedTask?: string | undefined;
  workedOn?: string | undefined;
  nextThing?: string | undefined;
  topic?: string | undefined;
  /** How the previous session's "next thing" went; absent on older notes */
  outcome?: SessionOutcome | undefined;
}

export type SessionOutcome = "completed" | "in-progress" | "other";

export const OUTCOME_LABELS: Record<SessionOutcome, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  other: "Did something else",
};

/** Label shown before a note's `workedOn` text. */
export function workedOnLabel(s: Session): string {
  return s.outcome ? OUTCOME_LABELS[s.outcome] : "Worked on";
}

/** Topics a session note (or backlog item) can be tagged with. */
export const TOPICS = ["Frontend", "Backend", "Styling", "Bug fix", "Refactor", "Learning"];

const CUSTOM_TOPICS_KEY = "pikup.customTopics";

/** Built-in topics followed by any the user has added. */
export function getTopics(): string[] {
  if (typeof localStorage === "undefined") return TOPICS;
  return [...TOPICS, ...read<string[]>(CUSTOM_TOPICS_KEY, [])];
}

/** Saves a custom topic and returns its stored spelling (reusing an existing match, case-insensitive). */
export function addTopic(name: string): string {
  const trimmed = name.trim();
  const existing = getTopics().find((t) => t.toLowerCase() === trimmed.toLowerCase());
  if (existing) return existing;
  const custom = read<string[]>(CUSTOM_TOPICS_KEY, []);
  localStorage.setItem(CUSTOM_TOPICS_KEY, JSON.stringify([...custom, trimmed]));
  return trimmed;
}

const SESSIONS_KEY = "pikup.sessions";
const STICKERS_KEY = "pikup.stickers";
const PLACED_KEY = "pikup.placedSticker";
const TIMER_KEY = "pikup.timer";
const PENDING_KEY = "pikup.pendingSession";
const PENDING_DRAFT_KEY = "pikup.pendingNoteDraft";

export interface PendingSession {
  /** The already-recorded session this unfinished note belongs to. */
  id?: string | undefined;
  start: number;
  elapsed: number;
  end?: number | undefined;
  planned?: string | undefined;
}

export interface SessionNoteDraft {
  workedOn: string;
  nextThing: string;
  topic?: string | undefined;
  outcome?: SessionOutcome | undefined;
}
/** Fired whenever the timer is saved, so every useTimer() on screen (e.g. the header pill) stays in sync. */
const TIMER_EVENT = "pikup:timer";

/** Migrate old DevSketch keys once so existing local data isn't lost. */
function migrateKeys() {
  if (typeof localStorage === "undefined") return;
  const pairs: [string, string][] = [
    ["devsketch.sessions", SESSIONS_KEY],
    ["devsketch.stickers", STICKERS_KEY],
    ["devsketch.placedSticker", PLACED_KEY],
  ];
  for (const [oldKey, newKey] of pairs) {
    if (!localStorage.getItem(newKey) && localStorage.getItem(oldKey)) {
      localStorage.setItem(newKey, localStorage.getItem(oldKey)!);
    }
  }
  if (typeof sessionStorage !== "undefined") {
    if (
      !sessionStorage.getItem(PENDING_KEY) &&
      sessionStorage.getItem("devsketch.pendingSession")
    ) {
      sessionStorage.setItem(PENDING_KEY, sessionStorage.getItem("devsketch.pendingSession")!);
      sessionStorage.removeItem("devsketch.pendingSession");
    }
  }
}

migrateKeys();

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getSessions(): Session[] {
  return read<Session[]>(SESSIONS_KEY, []);
}

export function saveSession(s: Session) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify([...getSessions(), s]));
  window.dispatchEvent(new Event("pikup:sessions"));
}

type SessionDetails = Pick<Session, "plannedTask" | "outcome" | "workedOn" | "nextThing" | "topic">;

function updateSessionDetails(id: string, changes: Partial<SessionDetails>): boolean {
  const sessions = getSessions();
  if (!sessions.some((session) => session.id === id)) return false;
  const next = sessions.map((session) =>
    session.id === id ? { ...session, ...changes } : session,
  );
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("pikup:sessions"));
  return true;
}

/** Edits an existing session without changing its time, notes, or position in history. */
export function updateSessionTask(
  id: string,
  changes: Pick<Session, "plannedTask" | "outcome">,
): boolean {
  return updateSessionDetails(id, changes);
}

/** Adds a note to the session recorded when its timer stopped, without duplicating it. */
export function updateSessionNote(
  id: string,
  changes: Pick<Session, "workedOn" | "nextThing" | "topic" | "outcome">,
): boolean {
  return updateSessionDetails(id, changes);
}

export function lastNote(): Session | undefined {
  const latest = getSessions().at(-1);
  return latest && (latest.workedOn?.trim() || latest.nextThing?.trim()) ? latest : undefined;
}

export function getUnlockedStickers(): string[] {
  return read<string[]>(STICKERS_KEY, []);
}

export function unlockSticker(id: string) {
  const cur = getUnlockedStickers();
  if (!cur.includes(id)) localStorage.setItem(STICKERS_KEY, JSON.stringify([...cur, id]));
}

export function getPlacedSticker(): string | null {
  return read<string | null>(PLACED_KEY, null);
}

export function placeSticker(id: string | null) {
  localStorage.setItem(PLACED_KEY, JSON.stringify(id));
}

export function getPendingSession(): PendingSession | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingSession) : null;
  } catch {
    return null;
  }
}

export function setPendingSession(pending: PendingSession) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

/** Records ended time once, including unfinished sessions from the older wrap-up flow. */
export function saveEndedSession(pending: PendingSession): PendingSession & { id: string } {
  const existing = getSessions().find((session) =>
    pending.id ? session.id === pending.id : session.start === pending.start,
  );
  const saved = { ...pending, id: existing?.id ?? pending.id ?? crypto.randomUUID() };
  // Keep the identity before writing the record so a retry or reload cannot duplicate it.
  setPendingSession(saved);
  if (!existing) {
    saveSession({
      id: saved.id,
      start: saved.start,
      end: saved.end ?? saved.start + saved.elapsed * 1000,
      durationSec: saved.elapsed,
      plannedTask: saved.planned,
    });
  }
  return saved;
}

export function clearPendingSession() {
  sessionStorage.removeItem(PENDING_KEY);
  sessionStorage.removeItem(PENDING_DRAFT_KEY);
}

export function getPendingNoteDraft(): SessionNoteDraft | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as SessionNoteDraft) : null;
  } catch {
    return null;
  }
}

export function savePendingNoteDraft(draft: SessionNoteDraft) {
  sessionStorage.setItem(PENDING_DRAFT_KEY, JSON.stringify(draft));
}

/** Monday 00:00 of the week containing `ref` */
export function startOfWeek(ref = new Date()): Date {
  const day = (ref.getDay() + 6) % 7; // Monday = 0
  const weekStart = new Date(ref);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(ref.getDate() - day);
  return weekStart;
}

/** seconds accumulated in the week containing `ref` (default now) */
export function weekSeconds(ref = new Date()): number {
  return sessionsThisWeek(ref).reduce((acc, s) => acc + s.durationSec, 0);
}

export function sessionsThisWeek(ref = new Date()): Session[] {
  const weekStart = startOfWeek(ref).getTime();
  return getSessions().filter((s) => s.start >= weekStart);
}

export interface DayBucket {
  label: string;
  date: number;
  seconds: number;
  isToday: boolean;
}

/** Mon–Sun of the current week, seconds per day */
export function daysThisWeek(now = new Date()): DayBucket[] {
  const weekStart = startOfWeek(now);
  const sessions = getSessions();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    return {
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      date: d.getTime(),
      seconds: sessions
        .filter((s) => s.start >= d.getTime() && s.start < next.getTime())
        .reduce((a, s) => a + s.durationSec, 0),
      isToday: d.toDateString() === now.toDateString(),
    };
  });
}

/** Consecutive days with at least one session, counting back from today (or yesterday, if today is still empty). */
export function dayStreak(now = new Date()): number {
  const days = new Set(getSessions().map((s) => new Date(s.start).toDateString()));
  const cursor = new Date(now);
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export interface WeekBucket {
  label: string;
  weekStart: number;
  seconds: number;
}

export function recentWeeks(count = 6): WeekBucket[] {
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - day);
  const weeks: WeekBucket[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const ws = new Date(start);
    ws.setDate(start.getDate() - i * 7);
    const we = ws.getTime() + 7 * 24 * 3600 * 1000;
    const seconds = getSessions()
      .filter((s) => s.start >= ws.getTime() && s.start < we)
      .reduce((a, s) => a + s.durationSec, 0);
    weeks.push({
      label: ws.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      weekStart: ws.getTime(),
      seconds,
    });
  }
  return weeks;
}

export function fmtDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function fmtHours(sec: number): string {
  const h = sec / 3600;
  return `${Math.round(h * 10) / 10}h`;
}

/** 48m, 1h 12m */
export function fmtMinutes(sec: number): string {
  const totalMin = Math.round(sec / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

/** Wall-clock timer persistence — elapsed is derived from Date.now(), not ticks. */
interface PersistedTimer {
  running: boolean;
  paused: boolean;
  /** Wall-clock ms when the session started */
  startTs: number;
  /** Total ms spent paused before the current pause (if any) */
  pausedAccumMs: number;
  /** Wall-clock ms when the current pause began, or null if running */
  pauseStartedAt: number | null;
}

function emptyTimer(): PersistedTimer {
  return {
    running: false,
    paused: false,
    startTs: 0,
    pausedAccumMs: 0,
    pauseStartedAt: null,
  };
}

function loadTimer(): PersistedTimer {
  return read<PersistedTimer>(TIMER_KEY, emptyTimer());
}

function saveTimer(t: PersistedTimer) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(TIMER_KEY, JSON.stringify(t));
  window.dispatchEvent(new Event(TIMER_EVENT));
}

/** Elapsed seconds from wall clock, excluding paused time. */
export function wallElapsedSec(t: PersistedTimer, now = Date.now()): number {
  if (!t.running || !t.startTs) return 0;
  const currentPause = t.pauseStartedAt != null ? now - t.pauseStartedAt : 0;
  const ms = now - t.startTs - t.pausedAccumMs - currentPause;
  return Math.max(0, Math.floor(ms / 1000));
}

export interface TimerState {
  running: boolean;
  paused: boolean;
  elapsed: number;
  start: () => void;
  togglePause: () => void;
  /** ends the session, returns its id + duration */
  stop: () => { start: number; elapsed: number } | null;
  reset: () => void;
}

export function useTimer(): TimerState {
  const [timer, setTimer] = useState<PersistedTimer>(emptyTimer);
  const [elapsed, setElapsed] = useState(0);

  // Hydrate from localStorage after mount (avoids SSR mismatch; restores mid-session),
  // then follow changes made by other useTimer() instances or other tabs.
  useEffect(() => {
    const sync = () => {
      const loaded = loadTimer();
      setTimer(loaded);
      setElapsed(wallElapsedSec(loaded));
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === TIMER_KEY) sync();
    };
    sync();
    window.addEventListener(TIMER_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(TIMER_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const commit = (next: PersistedTimer) => {
    saveTimer(next);
    setTimer(next);
    setElapsed(wallElapsedSec(next));
  };

  // Recalculate from wall clock on an interval + when tab becomes visible again
  useEffect(() => {
    if (!timer.running || timer.paused) {
      setElapsed(wallElapsedSec(timer));
      return;
    }

    const tick = () => setElapsed(wallElapsedSec(timer));
    tick();
    const iv = setInterval(tick, 250);

    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [timer]);

  return {
    running: timer.running,
    paused: timer.paused,
    elapsed,
    start: () => {
      if (loadTimer().running) return;
      commit({
        running: true,
        paused: false,
        startTs: Date.now(),
        pausedAccumMs: 0,
        pauseStartedAt: null,
      });
    },
    togglePause: () => {
      const cur = loadTimer();
      if (!cur.running) return;
      let next: PersistedTimer;
      if (cur.paused && cur.pauseStartedAt != null) {
        next = {
          ...cur,
          paused: false,
          pausedAccumMs: cur.pausedAccumMs + (Date.now() - cur.pauseStartedAt),
          pauseStartedAt: null,
        };
      } else {
        next = {
          ...cur,
          paused: true,
          pauseStartedAt: Date.now(),
        };
      }
      commit(next);
    },
    stop: () => {
      const cur = loadTimer();
      if (!cur.running || !cur.startTs) return null;
      const secs = wallElapsedSec(cur);
      const result = { start: cur.startTs, elapsed: secs };
      commit(emptyTimer());
      return result;
    },
    reset: () => {
      commit(emptyTimer());
    },
  };
}
