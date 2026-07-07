import { KANJI } from '../data/kanji'
import { KANJI_BASE } from '../data/kanji-base'
import type { BaseKanji } from '../data/types'

// Runtime kanji dictionary: for kanji that appear in fetched content but aren't
// bundled, we look them up on demand from kanjiapi.dev (KANJIDIC2 data) and
// cache them in localStorage. This keeps the executable small while still giving
// every kanji a hover card.

const KANJI_RANGE = /[一-龯㐀-䶿]/
const CACHE_PREFIX = 'nihongo:kanji:'
const runtime = new Map<string, BaseKanji>()

export function isKanjiChar(ch: string): boolean {
  return KANJI_RANGE.test(ch)
}

function readCache(ch: string): BaseKanji | undefined {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + ch)
    if (raw) return JSON.parse(raw) as BaseKanji
  } catch {
    /* ignore */
  }
  return undefined
}

function writeCache(ch: string, data: BaseKanji) {
  try {
    localStorage.setItem(CACHE_PREFIX + ch, JSON.stringify(data))
  } catch {
    /* storage full / unavailable */
  }
}

/** Baseline data for a kanji from the runtime store or localStorage cache. */
export function runtimeKanji(ch: string): BaseKanji | undefined {
  const hit = runtime.get(ch)
  if (hit) return hit
  const cached = readCache(ch)
  if (cached) {
    runtime.set(ch, cached)
    return cached
  }
  return undefined
}

/** True if we already have data for this kanji (curated, baseline, or fetched). */
export function hasKanjiData(ch: string): boolean {
  return ch in KANJI || ch in KANJI_BASE || runtimeKanji(ch) !== undefined
}

const dedupe = (a: string[]) => [...new Set(a)]

/** Ensure baseline data exists for every kanji in `text`, fetching the missing
 *  ones from kanjiapi.dev. Resolves to true if any new data was added. */
export async function ensureKanjiForText(text: string): Promise<boolean> {
  const missing = dedupe([...text].filter(isKanjiChar)).filter((ch) => !hasKanjiData(ch))
  if (missing.length === 0) return false
  let added = false
  await Promise.all(
    missing.map(async (ch) => {
      try {
        const res = await fetch(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(ch)}`)
        if (!res.ok) return
        const j = await res.json()
        const meanings: string[] = (j.meanings ?? []).slice(0, 5)
        if (meanings.length === 0) return
        const data: BaseKanji = {
          meanings,
          on: [...new Set<string>(j.on_readings ?? [])],
          kun: [...new Set<string>((j.kun_readings ?? []).map((r: string) => r.replace(/[-.]/g, '')))],
          strokes: j.stroke_count ?? 0,
        }
        runtime.set(ch, data)
        writeCache(ch, data)
        added = true
      } catch {
        /* offline or lookup failed — kanji simply stays non-hoverable */
      }
    }),
  )
  return added
}
