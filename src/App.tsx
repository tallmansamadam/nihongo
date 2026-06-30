import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { tokenizeText } from './lib/furigana'
import { STORIES } from './data/stories'
import { SONGS } from './data/songs'
import { READINGS } from './data/readings'
import { isHoverableKanji } from './data/components'
import type { Reading, Song, Story, Token } from './data/types'
import KanjiPopover from './components/KanjiCard'

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
  show: (char: string, token: Token, el: HTMLElement) => void
}
const HoverCtx = createContext<HoverApi>({ show: () => {} })

type Selection =
  | { kind: 'story'; id: string }
  | { kind: 'reading'; id: string }
  | { kind: 'song'; id: string }

export default function App() {
  const [sel, setSel] = useState<Selection>({ kind: 'story', id: STORIES[0].id })
  const [hover, setHover] = useState<Hover | null>(null)
  const [altDown, setAltDown] = useState(false)
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
    show(char, token, el) {
      setHover({ char, token, rect: el.getBoundingClientRect() })
    },
  }

  // Sticky popover: once open it stays put — through grapheme drill-downs and
  // their size changes — until you click outside it or press Escape. Hovering a
  // different kanji replaces it (via show()).
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setHover(null)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHover(null)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const story = sel.kind === 'story' ? STORIES.find((s) => s.id === sel.id)! : null
  const reading = sel.kind === 'reading' ? READINGS.find((s) => s.id === sel.id)! : null
  const song = sel.kind === 'song' ? SONGS.find((s) => s.id === sel.id)! : null

  return (
    <HoverCtx.Provider value={api}>
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

          <div className="sidebar-foot">
            Hover any <b>kanji</b> for readings, radicals, graphemes, stroke order &amp; a mnemonic.
          </div>
        </aside>

        <main className="reader">
          {story && <StoryView story={story} />}
          {reading && <ReadingView reading={reading} />}
          {song && <SongView song={song} />}
        </main>

        {hover && isHoverableKanji(hover.char) && (
          <Popover rect={hover.rect} innerRef={popoverRef}>
            <KanjiPopover token={hover.token} char={hover.char} altDown={altDown} />
          </Popover>
        )}
      </div>
    </HoverCtx.Provider>
  )
}

function TokenView({ tok, furigana }: { tok: Token; furigana: boolean }) {
  const { show } = useContext(HoverCtx)
  const base = (
    <span className="word" title={tok.g}>
      {[...tok.w].map((ch, i) =>
        isHoverableKanji(ch) ? (
          <span
            key={i}
            className="kanji"
            onMouseEnter={(e) => show(ch, tok, e.currentTarget)}
          >
            {ch}
          </span>
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
  let left = rect.left + rect.width / 2 - width / 2
  left = Math.max(margin, Math.min(left, window.innerWidth - width - margin))
  const below = rect.top < 380
  const style: React.CSSProperties = below
    ? { left, top: rect.bottom + 10, width }
    : { left, bottom: window.innerHeight - rect.top + 10, width }
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
        <FuriToggle on={furigana} set={setFurigana} />
      </header>

      <article className="story-body">
        {story.paragraphs.map((para, pi) => (
          <p className="para" key={pi}>
            {para.map((sentence, si) => (
              <span className="sentence" key={si}>
                <Line tokens={sentence} furigana={furigana} />
              </span>
            ))}
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
        <FuriToggle on={furigana} set={setFurigana} />
      </header>

      <article className="story-body reading-body">
        {reading.paragraphs.map((para, i) => (
          <div className="para" key={i}>
            <FuriganaText text={para} furigana={furigana} />
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
