const KEY = 'matrix.collapsed';

/** Ids of collapsed sections (categories as `cat:<id>`, party tiers as `tier:<id>`). */
export function loadCollapsed(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    // storage unavailable or corrupt — start fresh
  }
  return new Set();
}

export function saveCollapsed(set: Set<string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    // ignore
  }
}
