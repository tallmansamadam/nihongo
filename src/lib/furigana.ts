import kuromoji from '@sglkc/kuromoji'
import type { Token } from '../data/types'

// Lazily build a single in-browser tokenizer backed by the IPADIC dictionary
// served from /dict. The first call downloads ~17MB of dictionary data, so it
// is cached for the lifetime of the page.
type Tokenizer = {
  tokenize: (text: string) => Array<{ surface_form: string; reading?: string }>
}

let tokenizerPromise: Promise<Tokenizer> | null = null

export function getTokenizer(): Promise<Tokenizer> {
  if (!tokenizerPromise) {
    tokenizerPromise = new Promise((resolve, reject) => {
      kuromoji
        .builder({ dicPath: `${import.meta.env.BASE_URL}dict` })
        .build((err: Error | null, tokenizer: Tokenizer) => {
          if (err) reject(err)
          else resolve(tokenizer)
        })
    })
  }
  return tokenizerPromise
}

const HAS_KANJI = /[一-龯々]/

// Katakana → hiragana so furigana matches the rest of the app.
function kataToHira(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x60),
  )
}

/** Tokenize one line into furigana-ready tokens (reading only over kanji). */
export async function tokenizeLine(line: string): Promise<Token[]> {
  const t = await getTokenizer()
  return t.tokenize(line).map((tok) => {
    const w = tok.surface_form
    const reading =
      tok.reading && tok.reading !== '*' ? kataToHira(tok.reading) : undefined
    return HAS_KANJI.test(w) && reading ? { w, r: reading } : { w }
  })
}

/** Tokenize a multi-line block; blank lines become empty token arrays. */
export async function tokenizeText(text: string): Promise<Token[][]> {
  const lines = text.split('\n')
  const out: Token[][] = []
  for (const line of lines) {
    out.push(line.trim() === '' ? [] : await tokenizeLine(line))
  }
  return out
}
