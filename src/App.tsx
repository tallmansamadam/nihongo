import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { tokenizeText } from './lib/furigana'
import { STORIES } from './data/stories'
import { SONGS } from './data/songs'
import { READINGS } from './data/readings'
import { getGlyph } from './data/components'
import { ensureKanjiForText, isKanjiChar } from './lib/kanjiLookup'
import {
  cachedCatalog,
  cachedReading,
  fetchCatalog,
  fetchReading,
  isDownloaded,
  type CatalogEntry,
} from './lib/library'
import type { GrammarNote, Reading, Song, Story, Token } from './data/types'
import GrammarModal from './components/GrammarModal'
import { LEVELS, type Level } from './data/quizzes'
import {
  getJapaneseVoices,
  loadSettings,
  pronounceReading,
  saveSettings,
  speak,
  stopSpeaking,
  ttsSupported,
  usingNativeTts,
} from './lib/tts'
import KanjiPopover from './components/KanjiCard'
import TestView from './components/TestView'
import ExamView from './components/ExamView'
import FlashcardView from './components/FlashcardView'
import DrawPractice from './components/DrawPractice'
import ReportCard from './components/ReportCard'
import Splash from './components/Splash'
import { loadProgress, onProgressChange } from './lib/progress'

const CATEGORY_LABEL: Record<Reading['category'], string> = {
  story: 'Story',
  article: 'Article',
  folktale: 'Folktale',
}

interface Hover {
  char: string
  token: Token
  rect: DOMRect
}

interface HoverApi {
  open: (char: string, token: Token, el: HTMLElement, compound?: boolean) => void
}
const HoverCtx = createContext<HoverApi>({ open: () => {} })

type Selection =
  | { kind: 'story'; id: string }
  | { kind: 'reading'; id: string }
  | { kind: 'remote'; id: string }
  | { kind: 'song'; id: string }
  | { kind: 'test'; level: Level }
  | { kind: 'exam'; level: Level }
  | { kind: 'flashcards' }
  | { kind: 'draw'; char?: string }
  | { kind: 'report' }

export default function App() {
  const [splash, setSplash] = useState(true)
  const [sel, setSel] = useState<Selection>({ kind: 'story', id: STORIES[0].id })
  // Navigation history so a Back button can return to the previous view. Kept
  // in a ref (mutated synchronously) so rapid successive navigations/backs stay
  // consistent regardless of React batching; a counter forces re-render so the
  // Back button's visibility tracks the ref.
  const historyRef = useRef<Selection[]>([])
  const [, forceNav] = useState(0)
  const selRef = useRef(sel)
  selRef.current = sel
  const go = (next: Selection) => {
    historyRef.current = [...historyRef.current, selRef.current]
    setSel(next)
    setNavOpen(false)
    forceNav((n) => n + 1)
  }
  const goBack = () => {
    const h = historyRef.current
    if (h.length === 0) return
    historyRef.current = h.slice(0, -1)
    setSel(h[h.length - 1])
    forceNav((n) => n + 1)
  }
  const canGoBack = historyRef.current.length > 0
  // Mobile navigation drawer (the sidebar is a slide-over on small screens).
  const [navOpen, setNavOpen] = useState(false)
  // Points badge in the sidebar, live-updated on any progress write.
  const [points, setPoints] = useState(() => loadProgress().points)
  useEffect(() => onProgressChange(() => setPoints(loadProgress().points)), [])

  // "Practice drawing" buttons in kanji popovers jump to the drawing pad.
  useEffect(() => {
    const onDraw = (e: Event) => {
      const char = (e as CustomEvent<string>).detail
      go({ kind: 'draw', char })
      setHover(null)
    }
    window.addEventListener('nihongo:practice-draw', onDraw)
    return () => window.removeEventListener('nihongo:practice-draw', onDraw)
  }, [])

  // Grammar chips open the lesson modal; its cross-references navigate.
  const [grammarNote, setGrammarNote] = useState<GrammarNote | null>(null)
  useEffect(() => {
    const onGrammar = (e: Event) => setGrammarNote((e as CustomEvent<GrammarNote>).detail)
    const onGoto = (e: Event) => {
      const d = (e as CustomEvent<{ kind: 'story' | 'reading' | 'song'; id: string }>).detail
      go(d)
    }
    window.addEventListener('nihongo:grammar', onGrammar)
    window.addEventListener('nihongo:goto', onGoto)
    return () => {
      window.removeEventListener('nihongo:grammar', onGrammar)
      window.removeEventListener('nihongo:goto', onGoto)
    }
  }, [])
  const select = (s: Selection) => go(s)
  const [hover, setHover] = useState<Hover | null>(null)
  const [altDown, setAltDown] = useState(false)
  // Compound view triggered without a keyboard (long-press on touch).
  const [touchCompound, setTouchCompound] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Track Alt/Option so hovering can switch into the surrounding-compound view.
  useEffect(() => {
    const down = (e: KeyboardEvent) => e.key === 'Alt' && setAltDown(true)
    const up = (e: KeyboardEvent) => e.key === 'Alt' && setAltDown(false)
    const blur = () => setAltDown(false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])

  const api: HoverApi = {
    open(char, token, el, compound = false) {
      setTouchCompound(compound)
      setHover({ char, token, rect: el.getBoundingClientRect() })
    },
  }

  // Sticky popover: once open it stays put — through grapheme drill-downs and
  // their size changes — until you tap/click outside it or press Escape.
  // Works for mouse and touch (pointerdown covers both). Tapping another kanji
  // is ignored here so its own handler can replace the card.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      if (popoverRef.current?.contains(t as Node)) return
      if (t?.closest?.('.kanji')) return
      setHover(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHover(null)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  // Remote library catalog (fetched on demand; hydrated from cache if present).
  const [catalog, setCatalog] = useState<CatalogEntry[] | null>(() => cachedCatalog())
  const [catalogStatus, setCatalogStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  async function loadCatalog() {
    setCatalogStatus('loading')
    try {
      setCatalog(await fetchCatalog())
      setCatalogStatus('idle')
    } catch {
      setCatalogStatus('error')
    }
  }
  // Fetch the library catalog automatically on startup (cached copy shows
  // instantly; this refreshes it) so the Library never looks empty.
  useEffect(() => {
    loadCatalog()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const story = sel.kind === 'story' ? STORIES.find((s) => s.id === sel.id)! : null
  const reading = sel.kind === 'reading' ? READINGS.find((s) => s.id === sel.id)! : null
  const song = sel.kind === 'song' ? SONGS.find((s) => s.id === sel.id)! : null
  const remoteMeta = sel.kind === 'remote' ? catalog?.find((c) => c.id === sel.id) : undefined

  return (
    <HoverCtx.Provider value={api}>
      {splash && <Splash onDone={() => setSplash(false)} />}
      <div className="app">
        <button
          className="nav-burger"
          aria-label="Menu"
          onClick={() => setNavOpen((o) => !o)}
        >
          ☰
        </button>
        {canGoBack && (
          <button className="nav-back" aria-label="Back" onClick={goBack}>
            ← Back
          </button>
        )}
        {navOpen && <div className="nav-backdrop" onClick={() => setNavOpen(false)} />}
        <aside className={'sidebar' + (navOpen ? ' open' : '')}>
          <div className="brand">
            <span className="brand-jp">日本語</span>
            <span className="brand-en">Nihongo Reader</span>
          </div>

          <div className="nav-group">
            <div className="nav-label">Stories</div>
            <nav className="story-list">
              {STORIES.map((s) => (
                <button
                  key={s.id}
                  className={'story-item' + (sel.kind === 'story' && s.id === sel.id ? ' active' : '')}
                  onClick={() => select({ kind: 'story', id: s.id })}
                >
                  <span className="si-title">{s.title}</span>
                  <span className="si-en">{s.titleEn}</span>
                  <span className="si-level">{s.level}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="nav-group">
            <div className="nav-label">Articles &amp; Tales</div>
            <nav className="story-list">
              {READINGS.map((r) => (
                <button
                  key={r.id}
                  className={'story-item' + (sel.kind === 'reading' && r.id === sel.id ? ' active' : '')}
                  onClick={() => select({ kind: 'reading', id: r.id })}
                >
                  <span className="si-title">{r.title}</span>
                  <span className="si-en">{r.titleEn}</span>
                  <span className="si-level">{r.level}</span>
                  <span className="si-cat">{CATEGORY_LABEL[r.category]}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="nav-group">
            <div className="nav-label">Songs</div>
            <nav className="story-list">
              {SONGS.map((s) => (
                <button
                  key={s.id}
                  className={'story-item song' + (sel.kind === 'song' && s.id === sel.id ? ' active' : '')}
                  onClick={() => select({ kind: 'song', id: s.id })}
                >
                  <span className="si-title song">♪ {s.title}</span>
                  <span className="si-en">{s.anime.split('—')[0].trim()}</span>
                  <span className="si-level">{s.level}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="nav-group">
            <div className="nav-label">
              Library
              <button className="lib-refresh" onClick={loadCatalog} disabled={catalogStatus === 'loading'}>
                {catalog ? '↻' : 'Browse'}
              </button>
            </div>
            {catalogStatus === 'loading' && <div className="lib-note">Loading library…</div>}
            {catalogStatus === 'error' && <div className="lib-note">Couldn’t reach the library (offline?).</div>}
            {!catalog && catalogStatus === 'idle' && (
              <div className="lib-note">More stories &amp; articles, downloaded on demand.</div>
            )}
            {catalog && (
              <nav className="story-list">
                {catalog.map((c) => (
                  <button
                    key={c.id}
                    className={'story-item' + (sel.kind === 'remote' && c.id === sel.id ? ' active' : '')}
                    onClick={() => select({ kind: 'remote', id: c.id })}
                  >
                    <span className="si-title">{c.title}</span>
                    <span className="si-en">{c.titleEn}</span>
                    <span className="si-level">{c.level}</span>
                    <span className="si-cat">
                      {CATEGORY_LABEL[c.category]}
                      {isDownloaded(c.id) ? ' · saved' : ''}
                    </span>
                  </button>
                ))}
              </nav>
            )}
          </div>

          <div className="nav-group">
            <div className="nav-label">Practice</div>
            <button
              className={'story-item' + (sel.kind === 'flashcards' ? ' active' : '')}
              onClick={() => select({ kind: 'flashcards' })}
            >
              <span className="si-title">🗂 Flashcards</span>
              <span className="si-en">Vocab &amp; kanji decks — full JLPT lists</span>
            </button>
            <button
              className={'story-item' + (sel.kind === 'draw' ? ' active' : '')}
              onClick={() => select({ kind: 'draw' })}
            >
              <span className="si-title">✍ Drawing Practice</span>
              <span className="si-en">Trace &amp; draw kanji, earn points</span>
            </button>
            <button
              className={'story-item' + (sel.kind === 'report' ? ' active' : '')}
              onClick={() => select({ kind: 'report' })}
            >
              <span className="si-title">📊 Report Card</span>
              <span className="si-en">
                {points} points · progress &amp; grades
              </span>
            </button>
            <div className="lib-note">Quick practice tests — 100 variations each</div>
            <div className="test-levels">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  className={
                    'test-level' + (sel.kind === 'test' && sel.level === lvl ? ' active' : '')
                  }
                  onClick={() => select({ kind: 'test', level: lvl })}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <div className="lib-note">Simulated JLPT exams — timed &amp; sectioned</div>
            <div className="test-levels">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  className={
                    'test-level exam' + (sel.kind === 'exam' && sel.level === lvl ? ' active' : '')
                  }
                  onClick={() => select({ kind: 'exam', level: lvl })}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-foot">
            Hover any <b>kanji</b> for readings, radicals, graphemes, stroke order &amp; a mnemonic.
          </div>
        </aside>

        <main className="reader">
          {/* keyed so per-item view state (read-aloud, toggles) resets on switch */}
          {story && <StoryView key={story.id} story={story} />}
          {reading && <ReadingView key={reading.id} reading={reading} />}
          {sel.kind === 'remote' && <RemoteReadingView id={sel.id} meta={remoteMeta} />}
          {song && <SongView key={song.id} song={song} />}
          {sel.kind === 'test' && <TestView level={sel.level} />}
          {sel.kind === 'exam' && <ExamView level={sel.level} />}
          {sel.kind === 'flashcards' && <FlashcardView />}
          {sel.kind === 'draw' && <DrawPractice key={sel.char ?? 'free'} initialChar={sel.char} />}
          {sel.kind === 'report' && <ReportCard />}
        </main>

        {grammarNote && <GrammarModal note={grammarNote} onClose={() => setGrammarNote(null)} />}

        {hover && isKanjiChar(hover.char) && (
          <Popover rect={hover.rect} innerRef={popoverRef}>
            <KanjiPopover token={hover.token} char={hover.char} compound={altDown || touchCompound} />
          </Popover>
        )}
      </div>
    </HoverCtx.Provider>
  )
}

// One hoverable/tappable kanji. Mouse: opens on hover (Alt = compound view).
// Touch: opens on tap; a long-press opens the surrounding-compound view.
function KanjiSpan({ ch, tok }: { ch: string; tok: Token }) {
  const { open } = useContext(HoverCtx)
  const lpTimer = useRef<number | undefined>(undefined)
  const lpFired = useRef(false)
  const start = useRef<{ x: number; y: number } | null>(null)
  const clearLP = () => window.clearTimeout(lpTimer.current)

  return (
    <span
      className="kanji"
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') open(ch, tok, e.currentTarget)
      }}
      onPointerDown={(e) => {
        lpFired.current = false
        if (e.pointerType === 'mouse') return // desktop uses Alt for compound
        start.current = { x: e.clientX, y: e.clientY }
        const el = e.currentTarget
        clearLP()
        lpTimer.current = window.setTimeout(() => {
          lpFired.current = true
          open(ch, tok, el, true) // long-press → compound view
          speak(tok.r ?? tok.w) // …and pronounce the whole word
        }, 500)
      }}
      onPointerMove={(e) => {
        if (!start.current) return
        if (Math.abs(e.clientX - start.current.x) > 10 || Math.abs(e.clientY - start.current.y) > 10) {
          clearLP() // finger is scrolling, not long-pressing
        }
      }}
      onPointerUp={clearLP}
      onPointerLeave={clearLP}
      onPointerCancel={clearLP}
      onContextMenu={(e) => e.preventDefault()} // suppress the long-press menu on touch
      onClick={(e) => {
        if (lpFired.current) {
          lpFired.current = false
          return // long-press already opened the compound view
        }
        open(ch, tok, e.currentTarget)
        if (e.altKey) {
          // Alt+click: the card shows the surrounding compound — say the
          // whole word (its furigana reading beats per-kanji guesses).
          speak(tok.r ?? tok.w)
        } else {
          // Plain click/tap pronounces the single kanji (kun, else on).
          const g = getGlyph(ch)
          pronounceReading(g.kun, g.on, ch)
        }
      }}
    >
      {ch}
    </span>
  )
}

function TokenView({ tok, furigana }: { tok: Token; furigana: boolean }) {
  const base = (
    <span className="word" title={tok.g}>
      {[...tok.w].map((ch, i) =>
        // Every kanji is interactive; its card data is fetched on open if not
        // already bundled/cached (so kanji in uploaded lyrics respond too).
        isKanjiChar(ch) ? (
          <KanjiSpan key={i} ch={ch} tok={tok} />
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </span>
  )
  if (tok.r && furigana) {
    return (
      <ruby>
        {base}
        <rt>{tok.r}</rt>
      </ruby>
    )
  }
  return base
}

function Line({ tokens, furigana = true }: { tokens: Token[]; furigana?: boolean }) {
  return (
    <>
      {tokens.map((t, i) => (
        <TokenView key={i} tok={t} furigana={furigana} />
      ))}
    </>
  )
}

function Popover({
  rect,
  children,
  innerRef,
}: {
  rect: DOMRect
  children: React.ReactNode
  innerRef: React.Ref<HTMLDivElement>
}) {
  const width = 320
  const margin = 12
  const gap = 10
  // Clamp horizontally within the viewport.
  let left = rect.left + rect.width / 2 - width / 2
  left = Math.max(margin, Math.min(left, window.innerWidth - width - margin))
  // Place on whichever side has more room, and cap the height so it always fits
  // on screen — the card scrolls internally if a deep drill-down runs long.
  const spaceBelow = window.innerHeight - rect.bottom - gap - margin
  const spaceAbove = rect.top - gap - margin
  const below = spaceBelow >= spaceAbove
  const maxHeight = Math.max(140, Math.floor(below ? spaceBelow : spaceAbove))
  const style: React.CSSProperties = below
    ? { left, top: rect.bottom + gap, width, maxHeight, overflowY: 'auto' }
    : { left, bottom: window.innerHeight - rect.top + gap, width, maxHeight, overflowY: 'auto' }
  return (
    <div ref={innerRef} className={'popover ' + (below ? 'below' : 'above')} style={style}>
      {children}
    </div>
  )
}

/* ---------------- Story view ---------------- */

function StoryView({ story }: { story: Story }) {
  const [furigana, setFurigana] = useState(true)
  const [showEn, setShowEn] = useShowEn()
  const hasEn = !!story.paragraphsEn?.length
  const paraTexts = story.paragraphs.map((p) =>
    p.map((s) => s.map((t) => t.w).join('')).join(''),
  )
  const read = useReadAloud(paraTexts)
  return (
    <>
      <header className="reader-head">
        <div>
          <h1 className="story-title">{story.title}</h1>
          <div className="story-sub">
            <span className="story-reading">{story.titleReading}</span>
            <span className="dot">·</span>
            <span>{story.titleEn}</span>
          </div>
          <p className="story-summary">{story.summary}</p>
        </div>
        <div className="head-controls">
          <ReadAllButton playing={read.playing} start={read.start} stop={read.stop} />
          <VoiceMenu />
          {hasEn && <EnToggle on={showEn} set={setShowEn} />}
          <FuriToggle on={furigana} set={setFurigana} />
        </div>
      </header>

      <article className="story-body">
        {story.paragraphs.map((para, pi) => {
          const en = showEn ? story.paragraphsEn?.[pi] : undefined
          return (
            <div
              className={
                'para' + (en ? ' bilingual' : '') + (read.idx === pi ? ' reading' : '')
              }
              key={pi}
            >
              <p className="para-jp">
                {para.map((sentence, si) => (
                  <SentenceSpan key={si} tokens={sentence} furigana={furigana} />
                ))}
                <SpeakButton text={paraTexts[pi]} />
              </p>
              {en && <div className="para-en">{en}</div>}
            </div>
          )
        })}
      </article>

      <Panels vocab={story.vocab} grammar={story.grammar} />
    </>
  )
}

/* ---------------- Song view ---------------- */

function SongView({ song }: { song: Song }) {
  const [furigana, setFurigana] = useState(true)
  const [showEn, setShowEn] = useShowEn()
  const hasEn = !!song.lyricsEn
  // Read the bundled lyrics when we have them, otherwise the teaching phrases.
  const readParts = song.lyrics
    ? song.lyrics.split('\n').filter((l) => l.trim())
    : (song.phrases ?? []).map((p) => p.line.map((t) => t.w).join(''))
  const read = useReadAloud(readParts)
  return (
    <>
      <header className="reader-head">
        <div>
          <h1 className="story-title">{song.title}</h1>
          <div className="story-sub">
            {song.titleReading && (
              <>
                <span className="story-reading">{song.titleReading}</span>
                <span className="dot">·</span>
              </>
            )}
            <span>{song.titleRomaji}</span>
            {song.titleRomaji !== song.titleEn && (
              <>
                <span className="dot">·</span>
                <span>{song.titleEn}</span>
              </>
            )}
          </div>
          <div className="song-meta">
            <span className="meta-pill">♪ {song.artist}</span>
            <span className="meta-pill">{song.anime}</span>
            <span className="meta-pill">{song.year}</span>
          </div>
          {song.credits && <div className="song-credits">{song.credits}</div>}
          <p className="story-summary">{song.about}</p>
        </div>
        <div className="head-controls">
          {readParts.length > 0 && (
            <ReadAllButton playing={read.playing} start={read.start} stop={read.stop} />
          )}
          <VoiceMenu />
          {hasEn && <EnToggle on={showEn} set={setShowEn} />}
          <FuriToggle on={furigana} set={setFurigana} />
        </div>
      </header>

      {song.lyrics && (
        <section className="phrase-block">
          <h2 className="block-title">Lyrics <span className="block-sub">— public domain</span></h2>
          {showEn && song.lyricsEn ? (
            <div className="lyrics-render bundled">
              {song.lyrics.split('\n').map((line, i) => {
                const en = song.lyricsEn!.split('\n')[i]
                if (!line.trim()) return <div className="lyric-gap" key={i} />
                return (
                  <div className="para bilingual lyric-row" key={i}>
                    <div className="para-jp">
                      <FuriganaText text={line} furigana={furigana} />
                    </div>
                    {en?.trim() && <div className="para-en">{en}</div>}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="lyrics-render bundled">
              <FuriganaText text={song.lyrics} furigana={furigana} />
            </div>
          )}
          {song.credit && <p className="lyrics-credit">{song.credit}</p>}
        </section>
      )}

      {song.phrases && (
        <section className="phrase-block">
          <h2 className="block-title">Key phrases <span className="block-sub">— example sentences in the spirit of the song</span></h2>
          <ul className="phrases">
            {song.phrases.map((p, i) => (
              <li className="phrase" key={i}>
                <div className="phrase-jp">
                  <Line tokens={p.line} furigana={furigana} />
                </div>
                <div className="phrase-en">{p.en}</div>
                {p.note && <div className="phrase-note">{p.note}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Panels vocab={song.vocab} grammar={song.grammar} />

      {/* keyed by song so pasted lyrics can never bleed into another entry */}
      <LyricsBox key={song.id} songId={song.id} furigana={furigana} />

      {!song.publicDomain && (
        <p className="copyright-note">
          Song lyrics are copyrighted, so they aren't bundled with this app. The vocabulary and
          grammar above are taught with original example sentences. Paste lyrics you have legal
          access to into your library below — they're saved on this device and rendered with full
          hover-kanji support.
        </p>
      )}
    </>
  )
}

/* ---------------- Reading view (text + auto-furigana) ---------------- */

function ReadingView({ reading }: { reading: Reading }) {
  const [furigana, setFurigana] = useState(true)
  const [showEn, setShowEn] = useShowEn()
  const hasEn = !!reading.paragraphsEn?.length
  const read = useReadAloud(reading.paragraphs)
  return (
    <>
      <header className="reader-head">
        <div>
          <h1 className="story-title">{reading.title}</h1>
          <div className="story-sub">
            {reading.titleReading && (
              <>
                <span className="story-reading">{reading.titleReading}</span>
                <span className="dot">·</span>
              </>
            )}
            <span>{reading.titleEn}</span>
            <span className="dot">·</span>
            <span className="cat-pill">{CATEGORY_LABEL[reading.category]}</span>
          </div>
          <p className="story-summary">{reading.summary}</p>
        </div>
        <div className="head-controls">
          <ReadAllButton playing={read.playing} start={read.start} stop={read.stop} />
          <VoiceMenu />
          {hasEn && <EnToggle on={showEn} set={setShowEn} />}
          <FuriToggle on={furigana} set={setFurigana} />
        </div>
      </header>

      <article className="story-body reading-body">
        {reading.paragraphs.map((para, i) => {
          const en = showEn ? reading.paragraphsEn?.[i] : undefined
          return (
            <div
              className={
                'para' + (en ? ' bilingual' : '') + (read.idx === i ? ' reading' : '')
              }
              key={i}
            >
              <div className="para-jp">
                <FuriganaText text={para} furigana={furigana} />
                <SpeakButton text={para} />
              </div>
              {en && <div className="para-en">{en}</div>}
            </div>
          )
        })}
      </article>

      {reading.credit && <p className="lyrics-credit">{reading.credit}</p>}

      <Panels vocab={reading.vocab} grammar={reading.grammar ?? []} />
    </>
  )
}

function FuriToggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <label className="furi-toggle">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} />
      Furigana
    </label>
  )
}

/* Side-by-side English: one persistent preference across all reader views. */
const SHOW_EN_KEY = 'nihongo:show-en'
function useShowEn(): [boolean, (v: boolean) => void] {
  const [on, setOn] = useState(() => {
    try {
      return localStorage.getItem(SHOW_EN_KEY) === '1'
    } catch {
      return false
    }
  })
  const set = (v: boolean) => {
    setOn(v)
    try {
      localStorage.setItem(SHOW_EN_KEY, v ? '1' : '0')
    } catch {
      /* ignore */
    }
  }
  return [on, set]
}

function EnToggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <label className="furi-toggle">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} />
      English
    </label>
  )
}

/* ---------------- Voice reader ---------------- */

/* ---------------- Read-aloud: whole text + per-sentence ---------------- */

const SENT_END = /[。！？!?]/

/** Split a run of tokens into sentences (the ending punctuation stays with the
 *  sentence it closes). */
function groupSentences(tokens: Token[]): Token[][] {
  const out: Token[][] = []
  let cur: Token[] = []
  for (const t of tokens) {
    cur.push(t)
    if (SENT_END.test(t.w)) {
      out.push(cur)
      cur = []
    }
  }
  if (cur.length) out.push(cur)
  return out
}

/** Split plain text into sentences, keeping the punctuation. */
function splitSentences(text: string): string[] {
  const parts = text.match(/[^。！？!?]*[。！？!?]|[^。！？!?]+/g)
  return parts ? parts.filter((s) => s.trim()) : [text]
}

/** Reads a list of blocks in order, exposing which one is currently playing so
 *  the view can highlight it. */
function useReadAloud(parts: string[]) {
  const [idx, setIdx] = useState<number | null>(null)
  const cancelled = useRef(false)
  useEffect(
    () => () => {
      cancelled.current = true
      stopSpeaking()
    },
    [],
  )
  const stop = () => {
    cancelled.current = true
    stopSpeaking()
    setIdx(null)
  }
  const start = (from = 0) => {
    cancelled.current = false
    const run = (i: number) => {
      if (cancelled.current) return
      if (i >= parts.length) {
        setIdx(null)
        return
      }
      setIdx(i)
      speak(parts[i], () => run(i + 1))
    }
    run(from)
  }
  return { idx, playing: idx !== null, start, stop }
}

/** Header button that reads the whole story / article / song aloud. */
function ReadAllButton({
  playing,
  start,
  stop,
}: {
  playing: boolean
  start: () => void
  stop: () => void
}) {
  if (!ttsSupported()) return null
  return (
    <button
      className={'read-all' + (playing ? ' playing' : '')}
      onClick={() => (playing ? stop() : start())}
      title={playing ? 'Stop reading' : 'Read the whole text aloud'}
    >
      {playing ? '⏹ Stop' : '▶ Read all'}
    </button>
  )
}

// Hold a sentence longer than the kanji long-press (which opens the compound
// card at 500ms) to escalate: tap = kanji, hold = word, hold longer = sentence.
const SENTENCE_HOLD_MS = 1100

function useSentenceHold(text: string) {
  const timer = useRef<number | null>(null)
  const origin = useRef<{ x: number; y: number } | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const clear = () => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = null
    origin.current = null
  }
  useEffect(() => () => clear(), [])

  return {
    speaking,
    holdProps: {
      onPointerDown: (e: React.PointerEvent) => {
        clear()
        origin.current = { x: e.clientX, y: e.clientY }
        timer.current = window.setTimeout(() => {
          timer.current = null
          setSpeaking(true)
          speak(text, () => setSpeaking(false))
        }, SENTENCE_HOLD_MS)
      },
      onPointerMove: (e: React.PointerEvent) => {
        if (!origin.current) return
        if (
          Math.abs(e.clientX - origin.current.x) > 10 ||
          Math.abs(e.clientY - origin.current.y) > 10
        ) {
          clear() // scrolling / dragging, not holding
        }
      },
      onPointerUp: clear,
      onPointerLeave: clear,
      onPointerCancel: clear,
    },
  }
}

/** One sentence of body text: renders its tokens and reads itself aloud when
 *  held down (anywhere in it). */
function SentenceSpan({ tokens, furigana }: { tokens: Token[]; furigana: boolean }) {
  const text = tokens.map((t) => t.w).join('')
  const { holdProps, speaking } = useSentenceHold(text)
  return (
    <span className={'sentence' + (speaking ? ' speaking' : '')} {...holdProps}>
      <Line tokens={tokens} furigana={furigana} />
    </span>
  )
}

/** Play/stop button that reads one block of Japanese text aloud. */
function SpeakButton({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false)
  useEffect(() => () => stopSpeaking(), []) // stop if the view unmounts
  if (!ttsSupported()) return null
  return (
    <button
      className={'speak-btn' + (playing ? ' playing' : '')}
      title={playing ? 'Stop' : 'Read aloud'}
      onClick={() => {
        if (playing) {
          stopSpeaking()
          setPlaying(false)
        } else {
          setPlaying(true)
          speak(text, () => setPlaying(false))
        }
      }}
    >
      {playing ? '⏹' : '🔊'}
    </button>
  )
}

/** Voice settings: pick among the device's Japanese voices, adjust speed. */
function VoiceMenu() {
  const [open, setOpen] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[] | null>(null)
  const [settings, setSettings] = useState(() => loadSettings())

  useEffect(() => {
    if (open && voices === null) getJapaneseVoices().then(setVoices)
  }, [open, voices])

  if (!ttsSupported()) return null

  function update(next: Partial<ReturnType<typeof loadSettings>>) {
    const merged = { ...settings, ...next }
    setSettings(merged)
    saveSettings(merged)
  }

  return (
    <div className="voice-menu-wrap">
      <button className="furi-toggle voice-btn" onClick={() => setOpen((o) => !o)}>
        🎙 Voice
      </button>
      {open && (
        <div className="voice-menu">
          <div className="voice-menu-title">Japanese voices on this device</div>
          {voices === null && <div className="lib-note">Loading voices…</div>}
          {voices !== null && voices.length === 0 && usingNativeTts() && (
            <div className="lib-note">
              Using Android's system Japanese voice. The speed setting below still applies; change
              the voice itself in Settings → System → Text-to-speech.
            </div>
          )}
          {voices !== null && voices.length === 0 && !usingNativeTts() && (
            <div className="lib-note">
              No Japanese voices found. Install one via your system's text-to-speech settings
              (on Android: Settings → System → Text-to-speech), then reopen this menu.
            </div>
          )}
          {voices?.map((v) => (
            <label className="voice-option" key={v.voiceURI}>
              <input
                type="radio"
                name="voice"
                checked={
                  settings.voiceURI === v.voiceURI ||
                  (settings.voiceURI === null && v === voices[0])
                }
                onChange={() => update({ voiceURI: v.voiceURI })}
              />
              <span className="voice-name">{v.name}</span>
              <span className="voice-lang">{v.lang}</span>
            </label>
          ))}
          <div className="voice-rate">
            <span>Speed</span>
            <input
              type="range"
              min="0.6"
              max="1.3"
              step="0.05"
              value={settings.rate}
              onChange={(e) => update({ rate: parseFloat(e.target.value) })}
            />
            <span>{settings.rate.toFixed(2)}×</span>
          </div>
          <button
            className="voice-test"
            onClick={() => speak('こんにちは。日本語を読みます。')}
          >
            ▶ Test voice
          </button>
        </div>
      )}
    </div>
  )
}

/* A reading fetched from the remote library. Loads from cache instantly if
   available, otherwise downloads it; then makes sure every kanji has hover data. */
function RemoteReadingView({ id, meta }: { id: string; meta?: CatalogEntry }) {
  const [reading, setReading] = useState<Reading | null>(() => cachedReading(id))
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>(
    cachedReading(id) ? 'idle' : 'loading',
  )
  const [, bumpKanji] = useState(0)

  useEffect(() => {
    let cancelled = false
    const cached = cachedReading(id)
    if (cached) {
      setReading(cached)
      setStatus('idle')
      return
    }
    setReading(null)
    setStatus('loading')
    fetchReading(id)
      .then((r) => {
        if (cancelled) return
        setReading(r)
        setStatus('idle')
      })
      .catch(() => !cancelled && setStatus('error'))
    return () => {
      cancelled = true
    }
  }, [id])

  // Once the text is loaded, fetch any missing kanji data so hover works.
  useEffect(() => {
    if (!reading) return
    let cancelled = false
    ensureKanjiForText(reading.paragraphs.join('\n')).then((added) => {
      if (added && !cancelled) bumpKanji((n) => n + 1)
    })
    return () => {
      cancelled = true
    }
  }, [reading])

  if (!reading) {
    return (
      <div className="remote-loading">
        {meta && <h1 className="story-title">{meta.title}</h1>}
        {meta && <p className="story-summary">{meta.summary}</p>}
        <p className="lib-note">
          {status === 'error'
            ? 'Couldn’t download this one — check your connection and hit Browse again.'
            : 'Downloading…'}
        </p>
      </div>
    )
  }
  return <ReadingView reading={reading} />
}

/* Per-song lyrics you paste yourself: saved on this device and rendered with
   hoverable kanji (and auto-furigana when the toggle is on). */
const LYRICS_PREFIX = 'nihongo:lyrics:'
const lyricsKey = (songId: string) => `${LYRICS_PREFIX}${songId}`
function readLyrics(songId: string): string {
  try {
    return localStorage.getItem(lyricsKey(songId)) ?? ''
  } catch {
    return ''
  }
}

/** Collect every saved lyric (across all songs) into a plain object. */
function collectAllLyrics(): Record<string, string> {
  const out: Record<string, string> = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(LYRICS_PREFIX)) {
        out[key.slice(LYRICS_PREFIX.length)] = localStorage.getItem(key) ?? ''
      }
    }
  } catch {
    /* storage unavailable */
  }
  return out
}

/** Download all saved lyrics as a JSON backup file. */
function exportAllLyrics() {
  const data = {
    app: 'nihongo-reader',
    type: 'lyrics-library',
    version: 1,
    exportedAt: new Date().toISOString(),
    lyrics: collectAllLyrics(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `nihongo-lyrics-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Import a previously-exported backup. Returns the number of songs imported. */
async function importLyricsFile(file: File): Promise<number> {
  const text = await file.text()
  const parsed = JSON.parse(text)
  const lyrics: unknown = parsed?.lyrics
  if (!lyrics || typeof lyrics !== 'object') {
    throw new Error('Not a Nihongo lyrics backup file.')
  }
  let count = 0
  for (const [songId, value] of Object.entries(lyrics as Record<string, unknown>)) {
    if (typeof value === 'string') {
      localStorage.setItem(lyricsKey(songId), value)
      count++
    }
  }
  return count
}
function LyricsBox({ songId, furigana }: { songId: string; furigana: boolean }) {
  const [saved, setSaved] = useState(() => readLyrics(songId))
  const [draft, setDraft] = useState(saved)
  const [editing, setEditing] = useState(false)
  const lastSong = useRef(songId)
  if (lastSong.current !== songId) {
    lastSong.current = songId
    const next = readLyrics(songId)
    setSaved(next)
    setDraft(next)
    setEditing(false)
  }

  // Read the pasted lyrics aloud, line by line (whole-song playback).
  const read = useReadAloud(saved.split('\n').filter((l) => l.trim()))
  useEffect(() => () => read.stop(), [songId]) // stop when switching songs
  // Warm kanji data for pasted lyrics so their cards fill in instantly.
  const [, bumpLyricKanji] = useState(0)
  useEffect(() => {
    if (!saved) return
    let cancelled = false
    ensureKanjiForText(saved).then((added) => {
      if (added && !cancelled) bumpLyricKanji((n) => n + 1)
    })
    return () => {
      cancelled = true
    }
  }, [saved])
  function save() {
    try {
      localStorage.setItem(lyricsKey(songId), draft)
    } catch {
      /* storage unavailable */
    }
    setSaved(draft)
    setEditing(false)
  }
  const fileInput = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState('')

  async function onImport(file: File) {
    try {
      const n = await importLyricsFile(file)
      const next = readLyrics(songId)
      setSaved(next)
      setDraft(next)
      setEditing(false)
      setNotice(`Imported lyrics for ${n} song${n === 1 ? '' : 's'}.`)
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not import that file.')
    }
    setTimeout(() => setNotice(''), 4000)
  }

  const hasAny = Object.keys(collectAllLyrics()).length > 0
  const showEditor = editing || !saved
  return (
    <section className="lyrics-box">
      <div className="lyrics-head">
        <h2 className="block-title">My lyrics</h2>
        <div className="lyrics-head-actions">
          {saved && !editing && (
            <ReadAllButton playing={read.playing} start={read.start} stop={read.stop} />
          )}
          {saved && !editing && (
            <button className="lyrics-edit" onClick={() => setEditing(true)}>Edit</button>
          )}
          <button
            className="lyrics-edit"
            onClick={exportAllLyrics}
            disabled={!hasAny}
            title="Download a backup of all your saved lyrics"
          >
            Export
          </button>
          <button
            className="lyrics-edit"
            onClick={() => fileInput.current?.click()}
            title="Restore lyrics from a backup file"
          >
            Import
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onImport(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>
      {notice && <div className="lyrics-notice">{notice}</div>}
      {showEditor && (<>
      <textarea
        className="lyrics-input"
        placeholder="Paste the full lyrics here (one line per line). Saved on this device; every kanji becomes hoverable."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={10}
        autoFocus={editing}
      />
      <div className="lyrics-actions">
        <button className="lyrics-save" onClick={save} disabled={!draft.trim()}>Save lyrics</button>
        {saved && (
          <button className="lyrics-cancel" onClick={() => { setDraft(saved); setEditing(false) }}>Cancel</button>
        )}
      </div>
      </>)}
      {!showEditor && (
        <div className="lyrics-render">
          <FuriganaText text={saved} furigana={furigana} />
        </div>
      )}
    </section>
  )
}

/* Renders a block of Japanese text. When furigana is on, runs the kuromoji
   tokenizer to add readings; otherwise shows plain lines with hoverable kanji.
   Renders a fragment of lines — wrap it in your own container. */
function FuriganaText({ text, furigana }: { text: string; furigana: boolean }) {
  const [tokenized, setTokenized] = useState<Token[][] | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  useEffect(() => {
    if (!furigana) {
      setTokenized(null)
      setStatus('idle')
      return
    }
    let cancelled = false
    setStatus('loading')
    tokenizeText(text)
      .then((lines) => {
        if (cancelled) return
        setTokenized(lines)
        setStatus('idle')
      })
      .catch(() => !cancelled && setStatus('error'))
    return () => {
      cancelled = true
    }
  }, [text, furigana])

  const useFuri = furigana && tokenized && status === 'idle'
  const plain = text
    .split('\n')
    .map((l) => (l.trim() ? splitSentences(l).map((s) => ({ w: s })) : []))
  const lines = useFuri ? tokenized! : plain

  return (
    <>
      {status === 'loading' && <div className="furi-loading">Generating furigana…</div>}
      {status === 'error' && (
        <div className="furi-loading">Furigana dictionary unavailable — showing plain text.</div>
      )}
      {lines.map((tokens, i) => (
        <p className="lyric-line" key={i}>
          {tokens.length === 0
            ? ' '
            : groupSentences(tokens).map((sent, si) => (
                <SentenceSpan key={si} tokens={sent} furigana={furigana} />
              ))}
        </p>
      ))}
    </>
  )
}

/* ---------------- Shared panels ---------------- */

function Panels({
  vocab,
  grammar,
}: {
  vocab: Story['vocab']
  grammar: Story['grammar']
}) {
  return (
    <div className="panels">
      <section className="panel">
        <h2>Vocabulary</h2>
        <ul className="vocab">
          {vocab.map((v, i) => (
            <li key={i}>
              <span className="v-word">{v.word}</span>
              <span className="v-reading">{v.reading}</span>
              <span className="v-meaning">{v.meaning}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="panel">
        <h2>
          Grammar <span className="panel-hint">— tap a point for the full lesson</span>
        </h2>
        <ul className="grammar">
          {grammar.map((g, i) => (
            <li
              key={i}
              className="g-item"
              role="button"
              tabIndex={0}
              onClick={() =>
                window.dispatchEvent(new CustomEvent('nihongo:grammar', { detail: g }))
              }
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                window.dispatchEvent(new CustomEvent('nihongo:grammar', { detail: g }))
              }
            >
              <div className="g-point">
                {g.point} <span className="g-more">lesson ›</span>
              </div>
              <div className="g-exp">{g.explanation}</div>
              <div className="g-ex">
                <span className="g-jp">{g.example}</span>
                <span className="g-en">{g.exampleEn}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
