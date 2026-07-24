// User preferences, persisted in localStorage and observable so any view
// re-renders when a preference changes.

export interface Prefs {
  /** Color-code each sentence to its translation when English is shown. */
  colorCodeTranslations: boolean
}

const DEFAULTS: Prefs = {
  colorCodeTranslations: true,
}

const KEY = 'nihongo:prefs:v1'

export function loadPrefs(): Prefs {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return { ...DEFAULTS }
  }
}

const listeners = new Set<() => void>()

export function onPrefsChange(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  const next = { ...loadPrefs(), [key]: value }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((fn) => fn())
}
