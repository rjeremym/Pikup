# WRITTEN DESCRIPTION

By Jeremy Richards

Link to live site: https://pikup-mocha.vercel.app/

# Question 1-4 Answers

## 1\. Need — Why the person is looking

Solo hobbyist developers only have a few hours a week for their personal project, so a slow start eats into limited time. Right now they reconstruct context from memory or scattered code comments, which is unreliable: studies of interrupted programmers found only 10% of sessions have coding activity start in under a minute\*, and most involve navigating around just to find where they left off. Some keep a notepad, but it requires a habit they don't reliably keep, opening it at the start and end of every session, so the note often isn't there when they need it. They already track work hours to gauge how consistently they're working deeply, so their attention is already anchored to time and the calendar. The real gap is a reliable, low-friction way to reconstruct "where was I" the moment a session starts.

## 2\. Persona — Who is most likely to jump on board first

Hobbyist game / app developers that work on their project solo, in short scattered sessions rather than a daily habit — often just a few hours spread across the week, squeezed into evenings or weekends around a day job or school. Already tracks their hours to see how consistently they're putting in deep work.

## 3\. Capability — Key observable action product lets them complete

Track deep work hours, and see the note from their last session the moment they open the app, so they can start the timer with no reconstruction step.

## 4\. Value — What is materially or emotionally better afterward

Instantly **focused** and **purposeful**. This matters because the solo developer has little time, and frequently sits down to work on their project but comes away feeling like nothing significant was accomplished or time was wasted.

**Affordance Sentence:** *"Start your timer and pick up exactly where you left off."*

# 3 Screens

## Main Timer Screen

* **Job:** Show the note from the last session (what was worked on, what's next) and let the user start/stop a deep work timer.  
* **Why it earned a slot:** This is the landing screen and the core of the value proposition. It's the single moment where "instantly focused and purposeful" either happens or doesn't. Every other screen exists to feed this one.  
* **Design question:** Does the landing screen signal the primary capability and value at first glance, before the user reads anything closely?

## Note-Taking Screen

* **Job:** Prompt two short questions when a session ends: what you worked on, and what you plan to do next, so the next session's reminder actually exists.  
* **Why it earned a slot:** The main screen's note is only useful if it gets written in the first place. This screen is what makes the habit low-friction enough to actually stick, unlike the notepad workaround it replaces.  
* **Design question:** Is this screen frictionless enough that a user will realistically fill it out every single time, rather than skipping it the way they skip the notepad?

## Weekly Summary Screen

* **Job:** Show deep work hours logged per week, plus unlockable stickers at hour milestones.  
* **Why it earned a slot:** The persona already tracks hours as part of how they gauge deep work consistency, so this bundles a habit they already have into the same app instead of requiring a separate tool. The stickers give a lightweight sense of progress without turning the app into a metrics dashboard.  
* **Design question:** Does reviewing progress reinforce the "purposeful, not wasted" feeling, and does the gamified element stay a nice-to-have without competing with the primary timer/note flow?

# Feedback Questions

## Need

*"Tell me about the last time you sat down to work on your project after a few days away. What did you actually do first?"*

**Prediction:** They'll describe opening their code editor, scrolling through recent files, or re-reading old comments to remember where they left off, and admit it ate up several minutes before they started actual work. This rests on the Main Timer Screen's core premise: that reconstructing context is currently a manual, unreliable step.

## Value

*"If you never had to spend time remembering what you were doing last session, what's the one word for what that would feel like?"*

**Prediction:** Something like "focused" or "relief," pointing at the anxiety of feeling behind rather than pure time savings. This rests on whether the Main Timer Screen's note actually reads as removing that mental step, not just displaying information.

## Persona

*"How often do you actually get to sit down and work on your project, and what's usually happening right before you start?"*

**Prediction:** They'll describe irregular, short windows (an evening here, a weekend afternoon there) squeezed around other commitments, rather than a consistent daily block. This rests on whether the app's framing (a note for "next time" rather than "tomorrow") matches how infrequently sessions actually happen.

## Capability

*"I'm going to show you this screen for five seconds, then hide it. What did you think this app does?"*

**Prediction:** They'll say something like "it's a timer that also reminds me what I was working on," correctly identifying both halves of the capability. This rests entirely on the Main Timer Screen's grouping: whether the timer and the last-session note read as one unit at a glance, or as two unrelated pieces of the screen competing for attention.

# Design Justification and First Read

### Does the landing screen signal the value at first glance?

Yes. The sticky-note-and-notebook styling (the tape accent, the dashed border, the handwritten type) reads immediately as "a note to yourself" before any text is parsed. The "Next up" line is underlined, directing the eye to the single most actionable piece of information on the screen. The timer sits below with one large Start button, making the next action obvious and singular.

### Does every element earn its place?

Mostly. The note is the dominant element and the timer is intentionally secondary now (see change below), so nothing currently competes with the primary job.

### Grouping and Gestalt Principles

The note's contents (Worked On \+ Next Up) are grouped inside a single dashed-border container, using proximity and common region to signal they're one unit: last session's context. The timer and Start button are grouped separately below, visually subordinate to the note through smaller emphasis and their position underneath.

### Navigation

Screens 2 and 3 stay on mission and both link back to the landing screen, so the loop is easy to close.

### What the AI Got Wrong and What Changed

The first version over-weighted the timer and treated the note as an afterthought, which broke down completely for a first-time user with no session history: the screen was just a bare timer with nothing to signal the app's actual value. I fixed this by adding a placeholder note for new users explaining that their first note gets created after their first session, and by giving the note more visual prominence than the timer. I also made the timer collapsible, since testing it myself showed a visible running timer was distracting during a work session, working against the "focused" value the app is supposed to deliver.

### What Motivated the Change

The landing-screen design question, whether the screen signals the primary capability and value before reading closely, is what surfaced the problem: a screen that's silent about its value for every new user fails that test by definition. The fix was a direct signaling and grouping decision, not a cosmetic one.

<img width="977" height="788" alt="image1" src="https://github.com/user-attachments/assets/4843a2e6-8278-4cb5-a657-d8f1a0aec3e0" />
<img width="974" height="824" alt="image2" src="https://github.com/user-attachments/assets/55b61132-4546-497b-8ec3-0cb29b056efa" />

*Before (left): landing screen with no note element, silent about the app's value for a first-time user. After (right): note given top visual priority, with a placeholder shown for new users.*

## References

\* **Parnin, C., & Rugaber, S.** "Resumption Strategies for Interrupted Programming Tasks." *Software Quality Journal*, 2011\. Based on analysis of 10,000 recorded programming sessions across 85 programmers, the study found only 10% of sessions had coding activity begin within a minute of starting, with most involving navigation to relocate prior context before editing could resume.


