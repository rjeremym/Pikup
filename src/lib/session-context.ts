import { createContext, useContext } from "react";
import type { PendingSession, TimerState } from "@/lib/tracker";

export interface SessionControls {
  timer: TimerState;
  pending: PendingSession | null;
  ready: boolean;
  startSession: () => void;
  endSession: () => void;
  finishNote: () => void;
}

export const SessionContext = createContext<SessionControls | null>(null);
export const SessionRevisionContext = createContext(0);

export function useSessionControls() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("Session controls require SessionProvider");
  return context;
}

/** Refresh saved-session views without subscribing them to every timer tick. */
export function useSessionRevision() {
  return useContext(SessionRevisionContext);
}
