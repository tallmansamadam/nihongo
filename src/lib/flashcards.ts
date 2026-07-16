import { STORIES } from '../data/stories'
import { READINGS } from '../data/readings'
import { SONGS } from '../data/songs'
import { KANJI } from '../data/kanji'
import { KANJI_BASE } from '../data/kanji-base'
import type { Level } from '../data/quizzes'

// Flashcard decks are built from data already in the app — the vocabulary lists
// across every story/article/song, and the curated kanji set — so nothing new
// needs to be bundled.

export interface Flashcard {
  key: string
  front: string
  reading?: string
  back: string
  sub?: string
}

export interface Deck {
  id: string
  name: string
  cards: Flashcard[]
}

function vocabCards(): Flashcard[] {
  const seen = new Set<string>()
  const cards: Flashcard[] = []
  const add = (word: string, reading: string, meaning: string) => {
    if (seen.has(word)) return
    seen.add(word)
    cards.push({ key: `v:${word}`, front: word, reading, back: meaning })
  }
  for (const s of STORIES) for (const v of s.vocab) add(v.word, v.reading, v.meaning)
  for (const r of READINGS) for (const v of r.vocab) add(v.word, v.reading, v.meaning)
  for (const s of SONGS) for (const v of s.vocab) add(v.word, v.reading, v.meaning)
  return cards
}

function kanjiCards(level?: Level): Flashcard[] {
  const cards: Flashcard[] = []
  const seen = new Set<string>()
  const add = (char: string, kun: string[], on: string[], meanings: string[], jlpt: string | undefined, strokes: number) => {
    if (seen.has(char)) return
    if (level && jlpt !== level) return
    seen.add(char)
    cards.push({
      key: `k:${char}`,
      front: char,
      reading: [...kun.slice(0, 3), ...on.slice(0, 2)].filter(Boolean).join('、'),
      back: meanings.slice(0, 4).join(', '),
      sub: `${jlpt ?? '—'} · ${strokes} strokes`,
    })
  }
  for (const k of Object.values(KANJI)) add(k.char, k.kun, k.on, k.meanings, k.jlpt, k.strokes)
  // full JLPT lists from the generated base dictionary
  for (const [char, b] of Object.entries(KANJI_BASE)) {
    if (b.jlpt) add(char, b.kun, b.on, b.meanings, b.jlpt, b.strokes)
  }
  return cards
}

export function buildDecks(): Deck[] {
  const decks: Deck[] = [
    { id: 'vocab', name: 'Vocabulary — all', cards: vocabCards() },
    { id: 'kanji-all', name: 'Kanji — all', cards: kanjiCards() },
  ]
  for (const lvl of ['N5', 'N4', 'N3', 'N2', 'N1'] as Level[]) {
    const cards = kanjiCards(lvl)
    if (cards.length) decks.push({ id: `kanji-${lvl}`, name: `Kanji — ${lvl}`, cards })
  }
  return decks.filter((d) => d.cards.length > 0)
}

// --- known-card tracking (spaced-ish: known cards drop out of the rotation) ---
const knownKey = (deckId: string) => `nihongo:flash-known:${deckId}`

export function loadKnown(deckId: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(knownKey(deckId)) ?? '[]'))
  } catch {
    return new Set()
  }
}
export function saveKnown(deckId: string, known: Set<string>) {
  try {
    localStorage.setItem(knownKey(deckId), JSON.stringify([...known]))
  } catch {
    /* ignore */
  }
}
