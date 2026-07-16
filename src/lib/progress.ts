// Points + progress store backing the Report Card. Everything is persisted in
// localStorage so progress survives restarts (per device; no accounts).

import type { Level } from '../data/quizzes'

export interface LedgerEntry {
  /** epoch ms */
  t: number
  /** activity kind, e.g. 'draw-quiz', 'exam', 'test', 'flashcards' */
  kind: string
  /** short human label, e.g. '水 drawn (92%)' or 'N5 exam 18/25' */
  label: string
  pts: number
}

export interface KanjiStat {
  tries: number
  /** best drawing accuracy 0-100 */
  best: number
  /** last practiced, epoch ms */
  last: number
}

export interface TestRecord {
  t: number
  level: Level
  mode: 'practice' | 'exam'
  score: number
  total: number
  /** seconds actually used (exam mode) */
  seconds?: number
}

export interface Progress {
  points: number
  ledger: LedgerEntry[]
  kanji: Record<string, KanjiStat>
  tests: TestRecord[]
  /** ISO dates (YYYY-MM-DD) with any activity — for streaks */
  days: string[]
}

const KEY = 'nihongo:progress:v1'
const MAX_LEDGER = 200

function empty(): Progress {
  return { points: 0, ledger: [], kanji: {}, tests: [], days: [] }
}

export function loadProgress(): Progress {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? '')
    return { ...empty(), ...p }
  } catch {
    return empty()
  }
}

function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage full/unavailable — progress is best-effort */
  }
}

function touchDay(p: Progress) {
  const today = new Date().toISOString().slice(0, 10)
  if (!p.days.includes(today)) p.days.push(today)
}

/** Listeners (e.g. the sidebar points badge) re-render on any progress write. */
const listeners = new Set<() => void>()
export function onProgressChange(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
function notify() {
  listeners.forEach((fn) => fn())
}

export function addPoints(kind: string, label: string, pts: number) {
  const p = loadProgress()
  p.points += pts
  p.ledger.unshift({ t: Date.now(), kind, label, pts })
  if (p.ledger.length > MAX_LEDGER) p.ledger.length = MAX_LEDGER
  touchDay(p)
  save(p)
  notify()
}

export function recordDrawing(char: string, accuracy: number, pts: number, label: string) {
  const p = loadProgress()
  const stat = p.kanji[char] ?? { tries: 0, best: 0, last: 0 }
  stat.tries += 1
  stat.best = Math.max(stat.best, Math.round(accuracy))
  stat.last = Date.now()
  p.kanji[char] = stat
  p.points += pts
  p.ledger.unshift({ t: Date.now(), kind: 'draw', label, pts })
  if (p.ledger.length > MAX_LEDGER) p.ledger.length = MAX_LEDGER
  touchDay(p)
  save(p)
  notify()
}

export function recordTest(rec: Omit<TestRecord, 't'>, pts: number) {
  const p = loadProgress()
  p.tests.unshift({ ...rec, t: Date.now() })
  if (p.tests.length > 100) p.tests.length = 100
  p.points += pts
  const label = `${rec.level} ${rec.mode === 'exam' ? 'exam' : 'practice'} ${rec.score}/${rec.total}`
  p.ledger.unshift({ t: Date.now(), kind: rec.mode, label, pts })
  if (p.ledger.length > MAX_LEDGER) p.ledger.length = MAX_LEDGER
  touchDay(p)
  save(p)
  notify()
}

/** Consecutive days of activity ending today or yesterday. */
export function streak(p: Progress): number {
  const days = new Set(p.days)
  let d = new Date()
  if (!days.has(d.toISOString().slice(0, 10))) d = new Date(d.getTime() - 86400_000)
  let n = 0
  while (days.has(d.toISOString().slice(0, 10))) {
    n++
    d = new Date(d.getTime() - 86400_000)
  }
  return n
}

/** Letter grade from average accuracy/scores — friendly, not punitive. */
export function letterGrade(pct: number): string {
  if (pct >= 95) return 'S'
  if (pct >= 85) return 'A'
  if (pct >= 70) return 'B'
  if (pct >= 55) return 'C'
  if (pct > 0) return 'D'
  return '—'
}
