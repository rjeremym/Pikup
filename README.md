# Pikup — First Three Screens

**Author:** Jeremy Richards  |  **Live Site:** [https://pikup-mocha.vercel.app/](https://pikup-mocha.vercel.app/)

**Affordance Sentence:** *"Start your timer and pick up exactly where you left off."*

# 1\. Core Concepts

| Concept | Description |
| :---- | :---- |
| **Need** (Why looking) | Solo hobbyist developers have limited weekly hours; reconstructing context from memory/comments eats time (only 10% of interrupted sessions start coding in \<1 min\*). Workaround notepads fail due to low habit adherence. They need a low-friction way to recover context the moment a session starts. |
| **Persona** (Who onboard first) | Hobbyist game/app developers working solo in short, scattered sessions (evenings/weekends around day jobs/school) who already track hours to gauge consistency. |
| **Capability** (Key action) | Track deep work hours and see the note from their last session immediately upon opening the app, starting the timer with zero reconstruction step. |
| **Value** (Material/Emotional) | Instantly **focused** and **purposeful**, eliminating the feeling that session time was wasted or nothing was accomplished. |

# 2\. The Three Screens & Navigation

| Screen | Job | Why It Earned a Slot | Design Question |
| :---- | :---- | :---- | :---- |
| **1\. Main Timer** (Landing) | Show last session note (worked on / next) and start/stop deep work timer. | Landing screen and core value proposition ("instantly focused"). Every other screen feeds this one. | Does the landing screen signal primary capability and value at first glance? |
| **2\. Note-Taking** | Prompt 2 short questions on session end: what you worked on, what's next. | Makes context creation frictionless enough to replace the manual notepad workaround. | Is it frictionless enough to fill out every single time? |
| **3\. Weekly Summary** | Show weekly hours logged \+ unlockable milestone stickers. | Bundles hour-tracking habit persona already has, reinforcing progress without cluttering timer flow. | Does reviewing progress reinforce "purposeful" feeling without competing with main flow? |

**Navigation & Loop:** Screens 2 and 3 stay strictly on mission and both link directly back to the Landing Screen, closing the user loop.

# 3\. Design Justification & First Read

**First Read & Visual Signaling:** Sticky-note and notebook styling (tape accent, dashed border, handwritten typography) instantly signals "note to self" before reading. Underlined "Next up" directs the eye to the primary actionable item, while the timer sits below with a prominent Start button. Every remaining element (note, timer, Start button, Weekly Summary link) supports the primary job; nothing competes with the note for attention.&nbsp;

**Gestalt Principles & Grouping:** Uses *Proximity* and *Common Region* to enclose last session context (Worked On \+ Next Up) inside a single dashed container. The timer and Start button form a distinct, visually less dominant group beneath it.

**Before-and-After Revision (Addressing AI Flaw):** The initial AI design over-weighted the timer and omitted the note for first-time users, leaving an empty timer with no information about core value. Corrected by prioritizing note prominence, adding a placeholder note for new users ("Nothing here yet..."), and making the running timer collapsible to prevent distraction during focus sessions. The landing-screen design question (whether the screen signals the primary capability and value before reading closely) is what surfaced the problem: a screen that's silent about its value for every new user fails that test. The fix was a signaling and grouping decision, not a cosmetic one.

<img width="977" height="788" alt="image1" src="https://github.com/user-attachments/assets/1b0cd231-c2c2-4d2a-8d63-53c5f7fbdd69" />
<img width="974" height="824" alt="image2" src="https://github.com/user-attachments/assets/03f9625a-a247-4af4-97c2-7292c8514231" />


*Before (top): landing screen with no note element. After (bottom): note prioritized with new user placeholder.*

# 4\. Feedback Questions & Predictions

| Category | Persona-Directed Question | Prediction & Rationale |
| :---- | :---- | :---- |
| **Need** | *"Tell me about the last time you sat down to work on your project after a few days away. What did you actually do first?"* | Predicts scrolling files/comments and losing minutes; rests on premise that context reconstruction is currently manual and slow. |
| **Value** | *"If you never had to spend time remembering what you were doing last session, what's the one word for what that would feel like?"* | Predicts "focused" or "relief"; rests on whether the note removes mental overhead rather than just displaying data. |
| **Persona** | *"How often do you actually get to sit down and work on your project, and what's usually happening right before you start?"* | Predicts irregular short sessions; rests on whether "next time" framing matches infrequent session cadence. |
| **Capability** | *"I'm going to show you this screen for five seconds, then hide it. What did you think this app does?"* | Predicts "timer that reminds me what I worked on"; rests on whether timer and note read as one cohesive unit. |

# 5\. References

\* **Parnin, C., & Rugaber, S. (2011).** "Resumption Strategies for Interrupted Programming Tasks." *Software Quality Journal*. Analysis of 10,000 programming sessions across 85 developers found only 10% had coding activity start in \<1 minute, with most spending time navigating code to relocate context.

