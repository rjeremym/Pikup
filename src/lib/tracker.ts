import { useEffect, useState } from "react";

export interface Session {
  id: string;
  start: number;
  end: number;
  durationSec: number;
  workedOn?: string | undefined;
  nextThing?: string | undefined;
}

const SESSIONS_KEY = "pikup.sessions";
const STICKERS_KEY = "pikup.stickers";
const PLACED_KEY = "pikup.placedSticker";
const TIMER_KEY = "pikup.timer";
const PENDING_KEY = "pikup.pendingSession";

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
    if (!sessionStorage.getItem(PENDING_KEY) && sessionStorage.getItem("devsketch.pendingSession")) {
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
}

export function lastNote(): Session | undefined {
  const withNote = getSessions().filter((s) => s.workedOn || s.nextThing);
  return withNote[withNote.length - 1];
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

export function getPendingSession(): { start: number; elapsed: number } | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as { start: number; elapsed: number }) : null;
  } catch {
    return null;
  }
}

export function setPendingSession(pending: { start: number; elapsed: number }) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function clearPendingSession() {
  sessionStorage.removeItem(PENDING_KEY);
}

/** seconds accumulated in the week containing `ref` (default now) */
export function weekSeconds(ref = new Date()): number {
  const day = (ref.getDay() + 6) % 7; // Monday = 0
  const weekStart = new Date(ref);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(ref.getDate() - day);
  return getSessions()
    .filter((s) => s.start >= weekStart.getTime())
    .reduce((acc, s) => acc + s.durationSec, 0);
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

  // Hydrate from localStorage after mount (avoids SSR mismatch; restores mid-session)
  useEffect(() => {
    const loaded = loadTimer();
    setTimer(loaded);
    setElapsed(wallElapsedSec(loaded));
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
