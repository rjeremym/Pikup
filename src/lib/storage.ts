/** Small JSON helpers over localStorage, safe to call during SSR. */
export function readJSON<T>(key: string, fallback: () => T): T {
  if (typeof localStorage === "undefined") return fallback();
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback();
  } catch {
    return fallback();
  }
}

export function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Clears everything Pikup saved in this browser (including old DevSketch keys, which would be
 * migrated back) and reloads, so the example project is seeded again from scratch.
 */
export function resetPrototypeData() {
  for (const store of [localStorage, sessionStorage]) {
    for (const key of Object.keys(store)) {
      if (key.startsWith("pikup.") || key.startsWith("devsketch.")) store.removeItem(key);
    }
  }
  window.location.assign("/");
}
