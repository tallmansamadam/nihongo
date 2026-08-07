import { useEffect, useRef, useState } from 'react'
import { createWorker } from 'tesseract.js'
import { getGlyph } from '../data/components'
import { ensureKanjiForText, isKanjiChar } from '../lib/kanjiLookup'
import { HANZI } from '../data/hanzi'
import { pronounceReading, speak, ttsSupported } from '../lib/tts'
import StrokeOrder from './StrokeOrder'

type Mode = 'ja' | 'zh'

// Which tesseract models to load per mode. Japanese includes the vertical model
// because signage and menus are often written top-to-bottom; Chinese loads both
// simplified and traditional so either script is recognised.
const LANGS: Record<Mode, string> = {
  ja: 'jpn+jpn_vert',
  zh: 'chi_sim+chi_tra',
}

const CJK = /[㐀-䶿一-鿿]/

/** Unique CJK characters in recognised text, in the order they appear. */
function extractChars(text: string): string[] {
  const seen = new Set<string>()
  for (const ch of text) if (CJK.test(ch)) seen.add(ch)
  return [...seen]
}

export default function OcrView() {
  const [mode, setMode] = useState<Mode>('ja')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [chars, setChars] = useState<string[]>([])
  const [raw, setRaw] = useState('')
  const [picked, setPicked] = useState<string | null>(null)
  const [camera, setCamera] = useState(false)
  const [camError, setCamError] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCamera(false)
  }
  useEffect(() => () => stopCamera(), [])

  async function startCamera() {
    setCamError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      setCamera(true)
      // the <video> mounts with `camera`, so attach on the next tick
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      }, 0)
    } catch (e) {
      setCamError(
        e instanceof Error && e.name === 'NotAllowedError'
          ? 'Camera permission was denied. You can still choose a photo instead.'
          : 'No camera available here — choose a photo instead.',
      )
    }
  }

  /** Run OCR over a canvas/image and surface the characters found. */
  async function runOcr(source: HTMLCanvasElement | File) {
    setBusy(true)
    setChars([])
    setRaw('')
    setPicked(null)
    setStatus('Loading recognizer…')
    let worker
    try {
      worker = await createWorker(LANGS[mode], 1, {
        workerPath: `${import.meta.env.BASE_URL}ocr/worker.min.js`,
        corePath: `${import.meta.env.BASE_URL}ocr/tesseract-core-lstm.wasm.js`,
        langPath: `${import.meta.env.BASE_URL}tessdata`,
        gzip: false,
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setStatus(`Reading… ${Math.round(m.progress * 100)}%`)
          }
        },
      })
      setStatus('Reading…')
      const { data } = await worker.recognize(source)
      const found = extractChars(data.text ?? '')
      // make sure every found character has dictionary data for its card
      if (mode === 'ja') await ensureKanjiForText(found.join(''))
      setChars(found)
      setRaw((data.text ?? '').replace(/\s+/g, ' ').trim())
      setStatus(
        found.length
          ? `${found.length} character${found.length === 1 ? '' : 's'} found`
          : 'No characters recognised — try a closer, sharper photo.',
      )
    } catch (e) {
      setStatus(`Couldn't run the recognizer: ${e instanceof Error ? e.message : 'unknown error'}`)
    } finally {
      await worker?.terminate().catch(() => {})
      setBusy(false)
    }
  }

  function capture() {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    const c = document.createElement('canvas')
    c.width = v.videoWidth
    c.height = v.videoHeight
    c.getContext('2d')!.drawImage(v, 0, 0)
    stopCamera()
    runOcr(c)
  }

  return (
    <div className="ocr">
      <header className="reader-head">
        <div>
          <h1 className="story-title">Camera Lookup 撮って調べる</h1>
          <div className="story-sub">
            <span>Point at a sign, menu or page — everything runs offline</span>
          </div>
        </div>
      </header>

      <div className="ocr-controls">
        <div className="seg" role="group" aria-label="Reading mode">
          <button className={mode === 'ja' ? 'active' : ''} onClick={() => setMode('ja')}>
            🇯🇵 Japanese
          </button>
          <button className={mode === 'zh' ? 'active' : ''} onClick={() => setMode('zh')}>
            🇨🇳 Chinese
          </button>
        </div>
        <div className="ocr-actions">
          {!camera ? (
            <button className="test-submit" onClick={startCamera} disabled={busy}>
              📷 Use camera
            </button>
          ) : (
            <button className="test-submit" onClick={capture}>
              ◉ Capture
            </button>
          )}
          <button onClick={() => fileRef.current?.click()} disabled={busy}>
            🖼 Choose photo
          </button>
          {camera && <button onClick={stopCamera}>Cancel</button>}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) runOcr(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      <p className="ocr-note">
        {mode === 'ja'
          ? 'Japanese mode reads the characters as Japanese — on/kun readings and meanings, with stroke order.'
          : 'Chinese mode reads the same characters as Chinese — Mandarin pinyin and the Chinese meaning.'}
      </p>

      {camError && <div className="ocr-error">{camError}</div>}

      {camera && (
        <div className="ocr-camera">
          <video ref={videoRef} playsInline muted />
        </div>
      )}

      {(busy || status) && <div className="ocr-status">{status}</div>}

      {chars.length > 0 && (
        <section className="ocr-results">
          <div className="gm-label">Tap a character</div>
          <div className="ocr-chips">
            {chars.map((c) => (
              <button
                key={c}
                className={'ocr-chip' + (picked === c ? ' active' : '')}
                onClick={() => {
                  setPicked(c)
                  if (mode === 'ja') {
                    const g = getGlyph(c)
                    pronounceReading(g.kun, g.on, c)
                  }
                }}
              >
                {c}
              </button>
            ))}
          </div>
          {raw && <div className="ocr-raw">{raw}</div>}
        </section>
      )}

      {picked && <CharDetail char={picked} mode={mode} />}
    </div>
  )
}

/** The reading/meaning panel for one recognised character, in the chosen
 *  language's terms. */
function CharDetail({ char, mode }: { char: string; mode: Mode }) {
  const g = getGlyph(char)
  const han = HANZI[char]
  return (
    <section className="ocr-detail">
      <div className="ocr-detail-top">
        <StrokeOrder char={char} size={110} />
        <div>
          <div className="kc-glyph">{char}</div>
          {mode === 'ja' ? (
            <>
              <div className="kc-meanings">
                {g.meanings?.length ? g.meanings.join(', ') : g.meaning}
              </div>
              <div className="kc-tags">
                {g.jlpt && <span className="tag jlpt">{g.jlpt}</span>}
                {g.strokes != null && <span className="tag">{g.strokes} strokes</span>}
              </div>
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
            </>
          ) : (
            <>
              <div className="ocr-pinyin">{han?.[0] ?? '—'}</div>
              <div className="kc-meanings">{han?.[1] ?? 'No Chinese definition available.'}</div>
              {!isKanjiChar(char) && <div className="kc-tags"><span className="tag part">hanzi</span></div>}
            </>
          )}
          <div className="ocr-detail-actions">
            {ttsSupported() && mode === 'ja' && (
              <button
                onClick={() => {
                  const gg = getGlyph(char)
                  pronounceReading(gg.kun, gg.on, char)
                }}
              >
                🔊 Say it
              </button>
            )}
            {ttsSupported() && mode === 'zh' && han?.[0] && (
              <button onClick={() => speak(char)}>🔊 Say it</button>
            )}
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent('nihongo:practice-draw', { detail: char }))
              }
            >
              ✍ Practice drawing
            </button>
          </div>
        </div>
      </div>
      {mode === 'zh' && g.isKanji && (
        <div className="ocr-cross">
          In Japanese this character means <b>{g.meanings?.[0] ?? g.meaning}</b>
          {g.on?.length ? ` (on: ${g.on.slice(0, 2).join('、')})` : ''}.
        </div>
      )}
      {mode === 'ja' && han?.[0] && (
        <div className="ocr-cross">
          In Chinese it is read <b>{han[0]}</b>
          {han[1] ? ` — ${han[1]}` : ''}.
        </div>
      )}
    </section>
  )
}
