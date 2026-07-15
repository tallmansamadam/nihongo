import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { tokenizeText } from './lib/furigana'
import { STORIES } from './data/stories'
import { SONGS } from './data/songs'
import { READINGS } from './data/readings'
import { getGlyph, isHoverableKanji } from './data/components'
import { ensureKanjiForText } from './lib/kanjiLookup'
import {
  cachedCatalog,
  cachedReading,
  fetchCatalog,
  fetchReading,
  isDownloaded,
  type CatalogEntry,
} from './lib/library'
import type { Reading, Song, Story, Token } from './data/types'
import { LEVELS, type Level } from './data/quizzes'
import {
  getJapaneseVoices,
  loadSettings,
  pronounceReading,
  saveSettings,
  speak,
  stopSpeaking,
  ttsSupported,
} from './lib/tts'
import KanjiPopover from './components/KanjiCard'
import TestView from './components/TestView'
import FlashcardView from './components/FlashcardView'
import Splash from './components/Splash'

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
  | { kind: 'flashcards' }

export default function App() {
  const [splash, setSplash] = useState(true)
  const [sel, setSel] = useState<Selection>({ kind: 'story', id: STORIES[0].id })
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
        <aside className="sidebar">
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
                  onClick={() => setSel({ kind: 'story', id: s.id })}
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
                  onClick={() => setSel({ kind: 'reading', id: r.id })}
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
                  onClick={() => setSel({ kind: 'song', id: s.id })}
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
                    onClick={() => setSel({ kind: 'remote', id: c.id })}
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
              onClick={() => setSel({ kind: 'flashcards' })}
            >
              <span className="si-title">🗂 Flashcards</span>
              <span className="si-en">Vocab &amp; kanji decks</span>
            </button>
            <div className="lib-note">JLPT practice tests — 100 variations each</div>
            <div className="test-levels">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  className={
                    'test-level' + (sel.kind === 'test' && sel.level === lvl ? ' active' : '')
                  }
                  onClick={() => setSel({ kind: 'test', level: lvl })}
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
          {story && <StoryView story={story} />}
          {reading && <ReadingView reading={reading} />}
          {sel.kind === 'remote' && <RemoteReadingView id={sel.id} meta={remoteMeta} />}
          {song && <SongView song={song} />}
          {sel.kind === 'test' && <TestView level={sel.level} />}
          {sel.kind === 'flashcards' && <FlashcardView />}
        </main>

        {hover && isHoverableKanji(hover.char) && (
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
        // Clicking/tapping a kanji pronounces it (kun reading, else on).
        const g = getGlyph(ch)
        pronounceReading(g.kun, g.on, ch)
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
        isHoverableKanji(ch) ? (
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
          <VoiceMenu />
          <FuriToggle on={furigana} set={setFurigana} />
        </div>
      </header>

      <article className="story-body">
        {story.paragraphs.map((para, pi) => (
          <p className="para" key={pi}>
            {para.map((sentence, si) => (
              <span className="sentence" key={si}>
                <Line tokens={sentence} furigana={furigana} />
              </span>
            ))}
            <SpeakButton
              text={para.map((s) => s.map((t) => t.w).join('')).join('')}
            />
          </p>
        ))}
      </article>

      <Panels vocab={story.vocab} grammar={story.grammar} />
    </>
  )
}

/* ---------------- Song view ---------------- */

function SongView({ song }: { song: Song }) {
  const [furigana, setFurigana] = useState(true)
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
          <p className="story-summary">{song.about}</p>
        </div>
        <FuriToggle on={furigana} set={setFurigana} />
      </header>

      {song.lyrics && (
        <section className="phrase-block">
          <h2 className="block-title">Lyrics <span className="block-sub">— public domain</span></h2>
          <div className="lyrics-render bundled">
            <FuriganaText text={song.lyrics} furigana={furigana} />
          </div>
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

      <LyricsBox songId={song.id} furigana={furigana} />

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
          <VoiceMenu />
          <FuriToggle on={furigana} set={setFurigana} />
        </div>
      </header>

      <article className="story-body reading-body">
        {reading.paragraphs.map((para, i) => (
          <div className="para" key={i}>
            <FuriganaText text={para} furigana={furigana} />
            <SpeakButton text={para} />
          </div>
        ))}
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

/* ---------------- Voice reader ---------------- */

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
          {voices !== null && voices.length === 0 && (
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
  const plain = text.split('\n').map((l) => (l.trim() ? [{ w: l }] : []))
  const lines = useFuri ? tokenized! : plain

  return (
    <>
      {status === 'loading' && <div className="furi-loading">Generating furigana…</div>}
      {status === 'error' && (
        <div className="furi-loading">Furigana dictionary unavailable — showing plain text.</div>
      )}
      {lines.map((tokens, i) => (
        <p className="lyric-line" key={i}>
          {tokens.length === 0 ? ' ' : <Line tokens={tokens} furigana={furigana} />}
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
        <h2>Grammar</h2>
        <ul className="grammar">
          {grammar.map((g, i) => (
            <li key={i}>
              <div className="g-point">{g.point}</div>
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
