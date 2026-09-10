# Pick Up

Prompt for Lovable — Solo Dev Session Tracker

Product description

A minimal time tracker for solo hobbyist game/app developers. It's not a project manager — it's a single dedicated space that does two things: tracks deep-work hours, and eliminates the "what was I doing again?" friction at the start of every session by surfacing a short note the person left themselves last time. When they stop, it prompts them to leave a note for next time. Think "sketchbook," not "corporate dashboard."

Need, persona, capability, value (carry these into your design decisions)

Need: Solo hobbyist developers only get a few hours a week on their personal project. They already track their hours to see how consistently they're working deeply, but they don't have a clean way to remind themselves what they were doing and what to do next — a notepad exists but the friction of opening it at the start/end of a session means the habit gets skipped.

Persona: Solo game or app developers working on a personal project in their spare time, sitting down for isolated, infrequent sessions rather than a daily habit.

Capability: Track deep work hours and reduce the "getting started" friction at the beginning of each session.

Fundamental value (lead with this): Instantly focused and purposeful. The person has little time and often finishes a session feeling like nothing significant happened or time was wasted — this app exists to prevent that feeling.

The affordance sentence a first-time user must get immediately: "Start your timer and pick up exactly where you left off."

The three screens

1. Landing / Timer screen (primary screen, default view)

Job: Signal the core value (instant focus) and let the user start tracking immediately. Design question it answers: Does the landing screen communicate the value fast, before reading anything closely?

A large, calm stopwatch-style timer (counts UP, not down — this isn't a pomodoro countdown). Should feel focused and quiet, not urgent or gamified.

Before starting the timer, the screen shows the note from the end of the last session front and center — framed like "Last time, you left yourself this note" — since this is the single most important element on the page.

One obvious primary action: Start.

Once running: Pause and End Session controls. Keep these secondary in visual weight to the timer itself.

Nothing else competes with the timer + last note. No stats, no navigation clutter — just a small, unobtrusive way to reach the Weekly Summary.

2. End-of-Session Note screen

Job: Capture a short note for future-self before the user leaves. Design question it answers: Does this screen make it effortless enough that the person will actually do it every time (removing the friction that kills the notepad habit)?

Appears automatically when the user hits "End Session."

Two short prompts, kept brief and low-pressure (not a journal entry):

What did you work on this session?

What's the next thing to tackle?

Big, easy Save action. Should take under 30 seconds to fill out.

Clear way back to the landing screen.

3. Weekly Summary screen

Job: Let the user review their deep work hours by week, for a lightweight sense of progress. Design question it answers: Does reviewing progress reinforce the "purposeful, not wasted" feeling without turning this into a metrics dashboard?

Simple weekly total hours, shown as a small chart or list of recent weeks — nothing dense or corporate-dashboard-like.

Optional lightweight reward concept: hitting a weekly hours milestone unlocks a small hand-drawn sticker the user can place on the Landing screen. Include this only if it doesn't add complexity to the primary flow — it's a nice-to-have, not the point of the screen.

Clear way back to the landing screen.

Navigation

All three screens must have obvious, consistent navigation back to the Landing screen. Landing screen is home base.

Aesthetic direction

Lighthearted, artful, sketchbook / hand-drawn feel — this is a personal tool, not a corporate SaaS product. Think handwritten-style accents, warm and personal, not sleek and minimal-corporate.

Avoid anything that reads as "another productivity app" — no aggressive gradients, no generic dashboard cards, no stock icon sets.

The three screens should clearly look like one product (consistent type, color palette, spacing) without needing a full design system — keep this simple.

Use Gestalt grouping (proximity/similarity) to visually tie the timer and the "last session note" together on the landing screen, since they're conceptually one unit (start + context).

Scope constraints for this prototype

This is a three-screen interactive mock-up, not a full backend product. Mock/local data is fine — no auth, no real accounts needed.

Do not build a settings screen, login screen, or anything beyond these three screens.

Do not spend effort on a full design system, component library, or reusable tokens — just make the three screens consistent and functional enough to demonstrate the concept.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d3c1e939-7c91-4a8e-8eb7-e02b58f622f1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
