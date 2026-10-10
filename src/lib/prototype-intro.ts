/** Fired to reopen the first-visit prototype intro from anywhere, e.g. the home page footer. */
export const PROTOTYPE_INTRO_EVENT = "pikup:prototype-intro";

export function openPrototypeIntro() {
  window.dispatchEvent(new Event(PROTOTYPE_INTRO_EVENT));
}
