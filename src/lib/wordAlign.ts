// Word-level JP↔EN alignment for color-coding. Every content word we can gloss
// with confidence is matched to its counterpart in the English translation and
// the pair gets a shared color. Gloss sources, in priority order:
//   1. the token's authored gloss (`g`, hand-written in the stories)
//   2. the passage's authored vocabulary list
//   3. the common-word table (pronouns, everyday verbs, time words …)
//   4. the bundled kanji dictionary, for single-kanji words
// Particles and grammar are left neutral, and a word whose gloss finds no
// confident English counterpart stays uncolored — a color always means a real
// correspondence.

import type { Token } from '../data/types'
import { isKanjiChar } from './kanjiLookup'
import { getGlyph } from '../data/components'
import { COMMON_WORDS } from '../data/commonWords'

export interface VocabItem {
  word: string
  meaning: string
}

export interface EnPart {
  text: string
  color?: number
}

export interface AlignedSentence {
  jpColors: (number | undefined)[]
  enParts: EnPart[]
  used: number
}

// Function words that carry no alignable meaning on either side.
const STOP = new Set([
  'a', 'an', 'the', 'of', 'and', 'or', 'be', 'is', 'are', 'was', 'were', 'it', 'in', 'on',
  'at', 'for', 'with', 'that', 'this', 'to', 'as', 'from', 'into', 'by', 'etc', 'so',
  'something', 'someone', 'one', 'there', 'their', 'they', 'them', 'its', 'his', 'her',
])

function lemma(w: string): string {
  const s = w.toLowerCase().replace(/[^a-z]/g, '')
  if (s.length <= 3) return s
  return s.replace(/ies$/, 'y').replace(/(es|ed|ing|s)$/, '')
}

/** Content keywords from a gloss. Keeps every sense (split on , ; /) so
 *  "to see, watch" can match either verb in the translation. */
function glossKeywords(meaning: string): string[] {
  const out: string[] = []
  for (const sense of meaning.split(/[;,/]/)) {
    const cleaned = sense
      .replace(/\([^)]*\)/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/^(to|a|an|the)\s+/, '')
    for (const w of cleaned.split(/\s+/)) {
      const l = lemma(w)
      // keep short words like "I", "go", "up" — they are real translations
      if (l && !STOP.has(l)) out.push(l)
    }
  }
  return [...new Set(out)]
}

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

/** Best available English gloss for one token, or null. */
function glossFor(tok: Token, vocabMap: Map<string, string>): string | null {
  const forms = [tok.w, tok.b].filter(Boolean) as string[]
  if (tok.g) return tok.g // hand-authored gloss wins
  for (const f of forms) {
    const v = vocabMap.get(f)
    if (v) return v
  }
  for (const f of forms) {
    const c = COMMON_WORDS[f]
    if (c) return c
  }
  for (const f of forms) {
    if (f.length === 1 && isKanjiChar(f)) {
      const g = getGlyph(f)
      if (g.isKanji && g.meaning && g.meaning !== '—') return g.meaning
    }
  }
  return null
}

// Tokens that are pure grammar — never colored.
const SKIP_SURFACE = new Set([
  'は', 'が', 'を', 'に', 'へ', 'で', 'と', 'も', 'の', 'や', 'か', 'ね', 'よ', 'から',
  'まで', 'です', 'ます', 'ました', 'ません', 'だ', 'た', 'て', 'で', 'し', 'な', 'ない',
  'いる', 'ある', 'する', 'なる', 'れる', 'られる', 'そう', 'こと', 'もの', 'ため',
])

export function alignSentence(
  tokens: Token[],
  enText: string,
  vocab: VocabItem[],
  startColor: number,
  palette: number,
): AlignedSentence {
  const vocabMap = new Map<string, string>()
  for (const v of vocab) if (v.word) vocabMap.set(v.word, v.meaning)

  const { parts, wordIdx } = splitEn(enText)
  const enLemmas = wordIdx.map((i) => lemma(parts[i].text))
  const enUsed = new Array(parts.length).fill(false)
  const jpColors: (number | undefined)[] = tokens.map(() => undefined)
  let color = startColor

  // Multi-token vocabulary phrases (e.g. 朝ご飯 split as 朝+ご飯) — merge runs
  // of up to 3 tokens that together match a vocabulary entry or common word.
  const claimed = new Array(tokens.length).fill(false)
  interface Group { idxs: number[]; gloss: string }
  const groups: Group[] = []
  for (let i = 0; i < tokens.length; i++) {
    if (claimed[i]) continue
    let matched = false
    for (let run = Math.min(3, tokens.length - i); run >= 2 && !matched; run--) {
      const surface = tokens.slice(i, i + run).map((t) => t.w).join('')
      const g = vocabMap.get(surface) ?? COMMON_WORDS[surface]
      if (g) {
        const idxs = Array.from({ length: run }, (_, k) => i + k)
        idxs.forEach((k) => (claimed[k] = true))
        groups.push({ idxs, gloss: g })
        matched = true
      }
    }
    if (matched) continue
    const t = tokens[i]
    if (SKIP_SURFACE.has(t.w) || !/[一-龯ァ-ヶぁ-ん]/.test(t.w)) continue
    const g = glossFor(t, vocabMap)
    if (!g) continue
    claimed[i] = true
    groups.push({ idxs: [i], gloss: g })
  }

  for (const grp of groups) {
    const keys = glossKeywords(grp.gloss)
    if (keys.length === 0) continue
    // Best match: prefer an exact lemma hit over a prefix hit, and prefer
    // earlier keywords (the primary sense) over later ones.
    let best = -1
    let bestScore = -1
    for (let w = 0; w < wordIdx.length; w++) {
      if (enUsed[wordIdx[w]]) continue
      const el = enLemmas[w]
      if (!el || STOP.has(el)) continue
      for (let k = 0; k < keys.length; k++) {
        const key = keys[k]
        let score = -1
        if (key === el) score = 100 - k
        else if (key.length >= 4 && (el.startsWith(key) || key.startsWith(el))) score = 60 - k
        if (score > bestScore) {
          bestScore = score
          best = w
        }
      }
    }
    if (best < 0) continue // no confident counterpart — leave neutral
    const c = color % palette
    color++
    for (const ti of grp.idxs) jpColors[ti] = c
    parts[wordIdx[best]].color = c
    enUsed[wordIdx[best]] = true
  }

  return { jpColors, enParts: parts, used: color - startColor }
}
