// Word-level JP↔EN alignment for color-coding. We align the *key words* we can
// map with confidence — the authored vocabulary of the passage and standalone
// kanji (from the kanji dictionary) — to their counterparts in the English
// translation, and give each matched pair a shared color. Particles, grammar,
// and non-vocabulary compounds are left neutral rather than guessed, so a color
// always means a real, trustworthy correspondence.

import type { Token } from '../data/types'
import { isKanjiChar } from './kanjiLookup'
import { getGlyph } from '../data/components'

export interface VocabItem {
  word: string
  meaning: string
}

export interface EnPart {
  text: string
  color?: number
}

export interface AlignedSentence {
  /** color index per JP token, or undefined */
  jpColors: (number | undefined)[]
  /** EN split into render parts (words + separators), matched words colored */
  enParts: EnPart[]
  /** number of colors consumed (so a paragraph can keep them distinct) */
  used: number
}

const STOP = new Set([
  'to', 'a', 'an', 'the', 'of', 'and', 'or', 'be', 'is', 'are', 'was', 'were', 'it', 'in', 'on',
  'at', 'for', 'with', 'that', 'this', 'one', 'something', 'someone', 'by', 'as', 'from', 'into',
  'etc', 'so', 'up', 'out',
])

function lemma(w: string): string {
  const s = w.toLowerCase().replace(/[^a-z]/g, '')
  return s.replace(/ies$/, 'y').replace(/(es|ed|ing|s)$/, '')
}

/** Content keywords from a dictionary gloss (first sense only). */
function glossKeywords(meaning: string): string[] {
  const first = meaning.split(/[;,/(]/)[0].trim().toLowerCase()
  return first
    .replace(/^(to|a|an|the)\s+/, '')
    .split(/\s+/)
    .map(lemma)
    .filter((w) => w.length >= 3 && !STOP.has(w))
}

/** Split English into render parts (alternating word / separator runs). */
function splitEn(text: string): { parts: EnPart[]; wordIdx: number[] } {
  const parts: EnPart[] = []
  const wordIdx: number[] = []
  const re = /[A-Za-z']+|[^A-Za-z']+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (/[A-Za-z]/.test(m[0])) wordIdx.push(parts.length)
    parts.push({ text: m[0] })
  }
  return { parts, wordIdx }
}

interface Group {
  tokenIdxs: number[]
  meaning: string
  firstToken: number
}

/** Align one sentence. `startColor` lets a paragraph keep colors distinct
 *  across its sentences. */
export function alignSentence(
  tokens: Token[],
  enText: string,
  vocab: VocabItem[],
  startColor: number,
  palette: number,
): AlignedSentence {
  const surfaces = tokens.map((t) => t.w)
  const surface = surfaces.join('')
  // char offset where each token begins
  const offsets: number[] = []
  let acc = 0
  for (const s of surfaces) {
    offsets.push(acc)
    acc += s.length
  }
  const tokensInRange = (start: number, end: number): number[] => {
    const out: number[] = []
    for (let k = 0; k < tokens.length; k++) {
      const s = offsets[k]
      const e = s + surfaces[k].length
      if (s < end && e > start) out.push(k)
    }
    return out
  }

  const claimed = new Array(surface.length).fill(false)
  const groups: Group[] = []

  // 1. vocabulary words (longest first, first occurrence, non-overlapping)
  for (const v of [...vocab].sort((a, b) => b.word.length - a.word.length)) {
    if (!v.word) continue
    const idx = surface.indexOf(v.word)
    if (idx < 0) continue
    let free = true
    for (let p = idx; p < idx + v.word.length; p++) if (claimed[p]) free = false
    if (!free) continue
    for (let p = idx; p < idx + v.word.length; p++) claimed[p] = true
    const idxs = tokensInRange(idx, idx + v.word.length)
    groups.push({ tokenIdxs: idxs, meaning: v.meaning, firstToken: Math.min(...idxs) })
  }

  // 2. standalone single-kanji tokens not already claimed (kanji-dict gloss)
  tokens.forEach((t, k) => {
    if (t.w.length !== 1 || !isKanjiChar(t.w)) return
    if (claimed[offsets[k]]) return
    const g = getGlyph(t.w)
    if (!g.isKanji || !g.meaning || g.meaning === '—') return
    claimed[offsets[k]] = true
    groups.push({ tokenIdxs: [k], meaning: g.meaning, firstToken: k })
  })

  groups.sort((a, b) => a.firstToken - b.firstToken)

  // 3. assign colors + match into the English sentence
  const { parts, wordIdx } = splitEn(enText)
  const enLemmas = wordIdx.map((i) => lemma(parts[i].text))
  const enUsed = new Array(parts.length).fill(false)
  const jpColors: (number | undefined)[] = tokens.map(() => undefined)
  let color = startColor

  for (const grp of groups) {
    const keys = glossKeywords(grp.meaning)
    if (keys.length === 0) continue
    // find the first unused EN word matching any keyword
    let hit = -1
    for (let w = 0; w < wordIdx.length; w++) {
      if (enUsed[wordIdx[w]]) continue
      const el = enLemmas[w]
      if (el.length < 2) continue
      if (keys.some((k) => k === el || (k.length >= 4 && (el.startsWith(k) || k.startsWith(el))))) {
        hit = w
        break
      }
    }
    if (hit < 0) continue // no confident EN counterpart — leave this word neutral
    const c = color % palette
    color++
    for (const ti of grp.tokenIdxs) jpColors[ti] = c
    parts[wordIdx[hit]].color = c
    enUsed[wordIdx[hit]] = true
  }

  return { jpColors, enParts: parts, used: color - startColor }
}
