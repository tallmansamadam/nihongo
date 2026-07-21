import { useEffect, useRef, useState } from 'react'
import { getGlyph, glyphMeaning } from '../data/components'
import { decompose } from '../lib/kvgDecompose'
import { ensureKanjiForText } from '../lib/kanjiLookup'
import { pronounceReading } from '../lib/tts'
import type { Component, Token } from '../data/types'
import StrokeOrder from './StrokeOrder'

const KANJI_RE = /[一-龯々]/

type View =
  | { type: 'glyph'; char: string; meaning?: string }
  | { type: 'compound'; token: Token }

/** The navigable popover: drill into graphemes, or (with Alt / long-press) view
 *  the whole compound word and pick any kanji from it. */
export default function KanjiPopover({
  token,
  char,
  compound,
}: {
  token: Token
  char: string
  compound: boolean
}) {
  const rootView = (): View =>
    compound && [...token.w].some((c) => KANJI_RE.test(c))
      ? { type: 'compound', token }
      : { type: 'glyph', char }

  const [stack, setStack] = useState<View[]>([rootView()])

  // Replaying the stroke animation when compound mode turns off (e.g. releasing
  // Alt) — the glyph view returns and should redraw from scratch, as if freshly
  // hovered.
  const [replay, setReplay] = useState(0)
  const prevCompound = useRef(compound)

  // When compound mode toggles while open and we're at the root, swap the root.
  useEffect(() => {
    setStack((s) => (s.length === 1 ? [rootView()] : s))
    if (prevCompound.current && !compound) setReplay((r) => r + 1)
    prevCompound.current = compound
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compound])

  // Reset when the hovered kanji changes.
  useEffect(() => {
    setStack([rootView()])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char, token])

  const view = stack[stack.length - 1]
  const push = (v: View) => setStack((s) => [...s, v])
  const back = () => setStack((s) => s.slice(0, -1))
  /** Drill into a grapheme/radical/compound character — and pronounce it, the
   *  same way clicking that character in the body text would. */
  const pickGlyph = (c: string, meaning?: string) => {
    push({ type: 'glyph', char: c, meaning })
    const g = getGlyph(c, meaning)
    pronounceReading(g.kun, g.on, c)
  }

  return (
    <div className="kanji-card">
      {stack.length > 1 && (
        <button className="kc-back" onClick={back}>← back</button>
      )}
      {view.type === 'compound' ? (
        <CompoundView token={view.token} onPick={pickGlyph} />
      ) : (
        <GlyphView char={view.char} fallbackMeaning={view.meaning} onPick={pickGlyph} replay={replay} />
      )}
    </div>
  )
}

function CompoundView({
  token,
  onPick,
}: {
  token: Token
  onPick: (char: string, meaning?: string) => void
}) {
  const chars = [...token.w]
  return (
    <div className="compound">
      <div className="cmp-head">
        <div className="cmp-word">{token.w}</div>
        {token.r && <div className="cmp-reading">{token.r}</div>}
        {token.g && <div className="cmp-gloss">{token.g}</div>}
      </div>
      <div className="cmp-label">Tap a character to break it down</div>
      <div className="cmp-tiles">
        {chars.map((c, i) => {
          const isKanji = KANJI_RE.test(c)
          const meaning = isKanji ? getGlyph(c).meaning : undefined
          return isKanji ? (
            <button className="cmp-tile" key={i} onClick={() => onPick(c, meaning)}>
              <span className="cmp-tile-char">{c}</span>
              {meaning && <span className="cmp-tile-meaning">{meaning}</span>}
            </button>
          ) : (
            <span className="cmp-tile kana" key={i}>
              <span className="cmp-tile-char">{c}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

function GlyphView({
  char,
  fallbackMeaning,
  onPick,
  replay,
}: {
  char: string
  fallbackMeaning?: string
  onPick: (char: string, meaning?: string) => void
  replay?: number
}) {
  const g = getGlyph(char, fallbackMeaning)

  // Curated kanji have hand-authored graphemes. For everything else, derive the
  // component breakdown from the KanjiVG stroke file so EVERY kanji can be
  // drilled into, and backfill component meanings from the dictionary.
  const [derived, setDerived] = useState<Component[] | null>(null)
  useEffect(() => {
    setDerived(null)
    if (g.components.length > 0 || !g.isKanji) return
    let cancelled = false
    decompose(char).then(async (chars) => {
      if (cancelled || !chars || chars.length === 0) return
      await ensureKanjiForText(chars.join(''))
      if (cancelled) return
      setDerived(chars.map((c) => ({ char: c, meaning: glyphMeaning(c) })))
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char])
  const components = g.components.length > 0 ? g.components : (derived ?? [])

  return (
    <>
      <div className="kc-top">
        <StrokeOrder char={g.char} replay={replay} />
        <div className="kc-head">
          <div className="kc-glyph">{g.char}</div>
          <div className="kc-meanings">{g.meanings ? g.meanings.join(', ') : g.meaning}</div>
          <div className="kc-tags">
            {g.jlpt && <span className="tag jlpt">{g.jlpt}</span>}
            {g.strokes != null && <span className="tag">{g.strokes} strokes</span>}
            {!g.isKanji && <span className="tag part">component</span>}
          </div>
          {g.isKanji && (
            <button
              className="kc-practice"
              onClick={() =>
                window.dispatchEvent(new CustomEvent('nihongo:practice-draw', { detail: g.char }))
              }
            >
              ✍ Practice drawing
            </button>
          )}
        </div>
      </div>

      {(g.kun?.length || g.on?.length) ? (
        <div className="kc-readings">
          {g.kun && g.kun.length > 0 && (
            <div className="kc-row">
              <span className="kc-label">kun</span>
              <span className="kc-vals">{g.kun.join('、')}</span>
            </div>
          )}
          {g.on && g.on.length > 0 && (
            <div className="kc-row">
              <span className="kc-label">on</span>
              <span className="kc-vals on">{g.on.join('、')}</span>
            </div>
          )}
        </div>
      ) : null}

      {g.radical && (
        <div className="kc-section">
          <div className="kc-section-title">Radical</div>
          <button className="kc-radical chip" onClick={() => onPick(g.radical!.char, g.radical!.meaning)}>
            <span className="rad-glyph">{g.radical.char}</span>
            <span className="rad-meaning">{g.radical.meaning}</span>
          </button>
        </div>
      )}

      {components.length > 0 && (
        <div className="kc-section">
          <div className="kc-section-title">Graphemes <span className="kc-hint">— tap to go deeper</span></div>
          <div className="kc-components">
            {components.map((c, i) => (
              <button className="comp chip" key={i} onClick={() => onPick(c.char, c.meaning)}>
                <span className="comp-glyph">{c.char}</span>
                <span className="comp-meaning">{c.meaning}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {g.mnemonic && (
        <div className="kc-section">
          <div className="kc-section-title">Mnemonic</div>
          <p className="kc-mnemonic">{g.mnemonic}</p>
        </div>
      )}
    </>
  )
}
