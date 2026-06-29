export interface Component {
  /** The component/grapheme character or radical glyph */
  char: string
  /** Plain-English meaning of the component */
  meaning: string
}

export interface KanjiEntry {
  char: string
  meanings: string[]
  /** On'yomi (Chinese-derived) readings, in katakana */
  on: string[]
  /** Kun'yomi (native Japanese) readings, in hiragana */
  kun: string[]
  strokes: number
  jlpt: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  /** The classifying radical for dictionary lookup */
  radical: Component
  /** Visual building blocks (graphemes) that make up the kanji */
  components: Component[]
  /** A memory hook that ties the components to the meaning */
  mnemonic: string
}

/** A single word token in a story sentence. */
export interface Token {
  /** Surface text as written (may contain kanji + kana) */
  w: string
  /** Reading in hiragana for furigana, omitted for kana-only / punctuation */
  r?: string
  /** Optional gloss shown on hover for the whole word */
  g?: string
}

export interface VocabEntry {
  word: string
  reading: string
  meaning: string
}

export interface GrammarNote {
  point: string
  explanation: string
  example: string
  exampleEn: string
}

/** An original (non-lyric) example sentence used to teach a song's language. */
export interface Phrase {
  line: Token[]
  en: string
  note?: string
}

export interface Song {
  id: string
  title: string
  titleReading?: string
  titleRomaji: string
  titleEn: string
  artist: string
  anime: string
  year: number
  level: 'N5' | 'N4' | 'N3' | 'N2'
  /** Short factual description of the song and what it's good for studying */
  about: string
  /** Original teaching sentences in the spirit of the song (NOT the lyrics).
   *  Used for copyrighted songs where lyrics cannot be bundled. */
  phrases?: Phrase[]
  /** Actual lyrics — only for public-domain songs. Plain text, one line per
   *  line; rendered with auto-furigana. */
  lyrics?: string
  /** True when the song is in the public domain (lyrics may be bundled). */
  publicDomain?: boolean
  /** Attribution line shown with public-domain lyrics. */
  credit?: string
  vocab: VocabEntry[]
  grammar: GrammarNote[]
}

/** Baseline dictionary data for a kanji that isn't hand-authored — meanings,
 *  readings, and stroke count from KANJIDIC2 (via kanjiapi.dev). No mnemonic or
 *  grapheme breakdown; those exist only for the curated set. */
export interface BaseKanji {
  meanings: string[]
  on: string[]
  kun: string[]
  strokes: number
}

/** A plain-text reading (story / article / folktale) rendered with
 *  auto-furigana and hover-kanji. Cheaper to author than tokenized stories. */
export interface Reading {
  id: string
  title: string
  titleReading?: string
  titleEn: string
  level: 'N5' | 'N4' | 'N3'
  category: 'story' | 'article' | 'folktale'
  summary: string
  /** Public-domain or original; shown as a small credit line. */
  credit?: string
  /** Paragraphs of plain Japanese text. */
  paragraphs: string[]
  vocab: VocabEntry[]
  grammar?: GrammarNote[]
}

export interface Story {
  id: string
  title: string
  titleReading: string
  titleEn: string
  level: 'N5' | 'N4'
  summary: string
  /** Paragraphs, each an array of sentences, each an array of tokens */
  paragraphs: Token[][][]
  vocab: VocabEntry[]
  grammar: GrammarNote[]
}
