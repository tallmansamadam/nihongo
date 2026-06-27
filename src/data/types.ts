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
  /** Original teaching sentences in the spirit of the song (NOT the lyrics) */
  phrases: Phrase[]
  vocab: VocabEntry[]
  grammar: GrammarNote[]
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
