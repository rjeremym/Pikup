import { useEffect, useState } from "react";

export interface Session {
  id: string;
  start: number;
  end: number;
  durationSec: number;
  workedOn?: string;
  nextThing?: string;
}

const SESSIONS_KEY = "devsketch.sessions";
const STICKERS_KEY = "devsketch.stickers";
const PLACED_KEY = "devsketch.placedSticker";

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
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startTs, setStartTs] = useState<number | null>(null);

  useEffect(() => {
    if (!running || paused) return;
    const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(iv);
  }, [running, paused]);

  return {
    running,
    paused,
    elapsed,
    start: () => {
      setStartTs(Date.now());
      setElapsed(0);
      setPaused(false);
      setRunning(true);
    },
    togglePause: () => setPaused((p) => !p),
    stop: () => {
      if (startTs == null) return null;
      setRunning(false);
      setPaused(false);
      return { start: startTs, elapsed };
    },
    reset: () => {
      setRunning(false);
      setPaused(false);
      setElapsed(0);
      setStartTs(null);
    },
  };
}
