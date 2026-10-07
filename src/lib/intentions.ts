import { readJSON, writeJSON } from "./storage";
import { exampleBacklog, exampleGoals } from "./examples";

export interface Goal {
  id: string;
  title: string;
  /** yyyy-mm-dd */
  due?: string | undefined;
  done: boolean;
}

export type Lane = "next" | "later" | "done";

export interface BacklogItem {
  id: string;
  title: string;
  topic?: string | undefined;
  lane: Lane;
}

/** "Up next" is deliberately small: a short queue keeps sessions focused. */
export const UP_NEXT_LIMIT = 3;

const GOALS_KEY = "pikup.goals";
const BACKLOG_KEY = "pikup.backlog";
const WEEKLY_GOAL_KEY = "pikup.weeklyGoalHours";

/** First visit: store the examples so they behave like the user's own items from then on. */
function seed<T>(key: string, value: T): T {
  if (typeof localStorage !== "undefined") writeJSON(key, value);
  return value;
}

export function getGoals(): Goal[] {
  return readJSON(GOALS_KEY, () => seed(GOALS_KEY, exampleGoals()));
}

export function saveGoals(goals: Goal[]) {
  writeJSON(GOALS_KEY, goals);
}

export function getBacklog(): BacklogItem[] {
  return readJSON(BACKLOG_KEY, () => seed(BACKLOG_KEY, exampleBacklog()));
}

export function saveBacklog(items: BacklogItem[]) {
  writeJSON(BACKLOG_KEY, items);
}

export function getWeeklyGoalHours(): number {
  return readJSON(WEEKLY_GOAL_KEY, () => 6);
}

export function saveWeeklyGoalHours(hours: number) {
  writeJSON(WEEKLY_GOAL_KEY, hours);
}
