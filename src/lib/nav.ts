import type { LucideIcon } from "lucide-react";
import {
  ChartColumn,
  Compass,
  Flag,
  KeyRound,
  ListTodo,
  LogIn,
  NotebookPen,
  PenLine,
  Rocket,
  Timer,
  UserPlus,
  UserRound,
} from "lucide-react";
import type { FileRouteTypes } from "@/routeTree.gen";

/** Every navigable path, taken from the generated route tree so a typo fails the typecheck. */
export type AppPath = FileRouteTypes["to"];

export type SectionId = "momentum" | "intentions" | "account";

export interface NavPage {
  to: AppPath;
  label: string;
  /** shorter label for tight spots (e.g. the phone menu) */
  short?: string;
  blurb: string;
  icon: LucideIcon;
  /** only reachable through a flow (e.g. ending a session), so menus skip it */
  hidden?: boolean;
  children?: NavPage[];
}

export interface NavSection extends NavPage {
  id: SectionId;
  children: NavPage[];
}

/**
 * The site map. Home → section → page → sub-page.
 * The header, mobile menu, hub pages and landing map all read from here,
 * so the hierarchy only has to change in one place.
 */
export const SECTIONS: NavSection[] = [
  {
    id: "momentum",
    to: "/momentum",
    label: "Momentum",
    blurb: "Keep going — start a session and watch the hours add up.",
    icon: Rocket,
    children: [
      {
        to: "/momentum/timer",
        label: "Session",
        blurb: "Your focus timer and the note that helps you pick up where you left off.",
        icon: Timer,
        children: [
          {
            to: "/momentum/timer/wrap-up",
            label: "Wrap-up note",
            blurb: "Two quick lines for future-you.",
            icon: PenLine,
            hidden: true,
          },
        ],
      },
      {
        to: "/momentum/stats",
        label: "Weekly summary",
        short: "Summary",
        blurb: "Deep-work hours, task completion, streaks and milestone stickers.",
        icon: ChartColumn,
      },
    ],
  },
  {
    id: "intentions",
    to: "/intentions",
    label: "Intentions",
    blurb: "Know where you're headed before you sit down.",
    icon: Compass,
    children: [
      {
        to: "/intentions/goals",
        label: "Goals",
        blurb: "A weekly hours target and the bigger milestones.",
        icon: Flag,
      },
      {
        to: "/intentions/backlog",
        label: "Product backlog",
        short: "Backlog",
        blurb: "Everything you mean to build, with the next few up front.",
        icon: ListTodo,
      },
      {
        to: "/intentions/notes",
        label: "Notes",
        blurb: "Revisit your session notes and next steps — search by topic or date.",
        icon: NotebookPen,
      },
    ],
  },
  {
    id: "account",
    to: "/account",
    label: "Account",
    blurb: "Keep your sessions safe across devices.",
    icon: UserRound,
    children: [
      { to: "/account/sign-in", label: "Log in", blurb: "Welcome back.", icon: LogIn },
      {
        to: "/account/create",
        label: "Create account",
        short: "Create",
        blurb: "Takes about thirty seconds.",
        icon: UserPlus,
      },
      {
        to: "/account/password",
        label: "Change password",
        short: "Password",
        blurb: "Swap in a new password.",
        icon: KeyRound,
      },
    ],
  },
];

/** Section colours, drawn from the existing palette. Full class strings so Tailwind can see them. */
export const TONE: Record<SectionId, { dot: string; text: string; tape: string; bar: string }> = {
  momentum: {
    dot: "bg-primary",
    text: "text-primary",
    tape: "bg-primary/25",
    bar: "bg-primary",
  },
  intentions: {
    dot: "bg-accent",
    text: "text-accent-foreground",
    tape: "bg-accent/50",
    bar: "bg-accent",
  },
  account: {
    dot: "bg-pencil",
    text: "text-pencil",
    tape: "bg-washi",
    bar: "bg-pencil",
  },
};

export function findPage(to: AppPath): NavPage {
  const walk = (pages: NavPage[]): NavPage | undefined => {
    for (const p of pages) {
      if (p.to === to) return p;
      const hit = walk(p.children ?? []);
      if (hit) return hit;
    }
    return undefined;
  };
  const page = walk(SECTIONS);
  if (!page) throw new Error(`No nav entry for ${to}`);
  return page;
}

/** True when `pathname` is `to` or somewhere beneath it. */
export function isWithin(pathname: string, to: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === to || path.startsWith(`${to}/`);
}

/** Planning, sessions, and progress are visible directly in the global navbar. */
export const PRIMARY_NAV = [
  findPage("/intentions/goals"),
  findPage("/intentions/backlog"),
  findPage("/momentum/timer"),
  findPage("/intentions/notes"),
  findPage("/momentum/stats"),
];

export function primaryPathFor(pathname: string): AppPath | undefined {
  return PRIMARY_NAV.find((page) => isWithin(pathname, page.to))?.to;
}
