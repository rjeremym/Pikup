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
