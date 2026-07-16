import { useEffect, useRef, useState } from 'react'
import {
  gradeDrawing,
  loadRefStrokes,
  type DrawingGrade,
  type Pt,
  type RefStrokes,
} from '../lib/strokeMatch'

interface Props {
  char: string
  /** practice = faint glyph guide always on; quiz = draw from memory */
  mode: 'practice' | 'quiz'
  size?: number
  /** called when the user checks their drawing */
  onGraded?: (grade: DrawingGrade, hintsUsed: number, revealed: boolean) => void
  /** bump to reset the pad (new prompt) */
  resetToken?: number
}

// Touch/mouse drawing surface. Strokes are captured in the KanjiVG 109x109
// coordinate space so they can be graded directly against reference strokes.
export default function DrawPad({ char, mode, size = 260, onGraded, resetToken }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [ref, setRef] = useState<RefStrokes | null>(null)
  const [strokes, setStrokes] = useState<Pt[][]>([])
  // The in-flight stroke lives in a ref so no points are lost to render
  // timing during fast scribbles; `current` mirrors it for rendering only.
  const live = useRef<Pt[] | null>(null)
  const [current, setCurrent] = useState<Pt[] | null>(null)
  const [hints, setHints] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [grade, setGrade] = useState<DrawingGrade | null>(null)

  useEffect(() => {
    let gone = false
    setRef(null)
    loadRefStrokes(char).then((r) => !gone && setRef(r))
    return () => {
      gone = true
    }
  }, [char])

  // reset on new prompt / char
  useEffect(() => {
    setStrokes([])
    setCurrent(null)
    setHints(0)
    setRevealed(false)
    setGrade(null)
  }, [char, resetToken])

  const toBox = (e: React.PointerEvent): Pt => {
    const rect = svgRef.current!.getBoundingClientRect()
    return [
      ((e.clientX - rect.left) / rect.width) * 109,
      ((e.clientY - rect.top) / rect.height) * 109,
    ]
  }

  const down = (e: React.PointerEvent) => {
    if (grade) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* some browsers/synthetic events reject capture — drawing still works */
    }
    live.current = [toBox(e)]
    setCurrent(live.current)
  }
  const move = (e: React.PointerEvent) => {
    if (!live.current) return
    const p = toBox(e)
    const last = live.current[live.current.length - 1]
    // drop sub-pixel jitter
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.8) return
    live.current.push(p)
    setCurrent([...live.current])
  }
  const up = () => {
    const s = live.current
    live.current = null
    setCurrent(null)
    if (s && s.length >= 2) setStrokes((prev) => [...prev, s])
  }

  const check = () => {
    if (!ref || strokes.length === 0) return
    const g = gradeDrawing(strokes, ref.polylines)
    setGrade(g)
    onGraded?.(g, hints, revealed)
  }

  const strokeColor = (i: number) => {
    if (!grade) return 'var(--ink, #223)'
    const s = grade.perStroke[i]?.score ?? 0
    return s >= 75 ? '#2c8a4b' : s >= 50 ? '#c8871a' : '#c0392b'
  }

  const d = (pts: Pt[]) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')

  const showGuide = mode === 'practice' || revealed || !!grade
  const hintStroke = !grade && !revealed && hints > 0 && strokes.length < (ref?.paths.length ?? 0)
    ? ref?.paths[strokes.length]
    : null

  return (
    <div className="drawpad">
      <svg
        ref={svgRef}
        viewBox="0 0 109 109"
        width={size}
        height={size}
        className={'drawpad-svg' + (grade ? ' graded' : '')}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        {/* paper guides */}
        <rect x="0.5" y="0.5" width="108" height="108" className="dp-frame" />
        <line x1="54.5" y1="2" x2="54.5" y2="107" className="dp-grid" />
        <line x1="2" y1="54.5" x2="107" y2="54.5" className="dp-grid" />
        {/* reference glyph (practice guide / reveal / post-grade overlay) */}
        {showGuide &&
          ref?.paths.map((p, i) => <path key={`r${i}`} d={p} className="dp-guide" />)}
        {/* hint: the next stroke to draw, highlighted */}
        {hintStroke && <path d={hintStroke} className="dp-hint" />}
        {/* the user's strokes */}
        {strokes.map((s, i) => (
          <path key={i} d={d(s)} className="dp-user" style={{ stroke: strokeColor(i) }} />
        ))}
        {current && <path d={d(current)} className="dp-user live" />}
      </svg>

      <div className="drawpad-tools">
        <button onClick={() => setStrokes((s) => s.slice(0, -1))} disabled={!!grade || strokes.length === 0}>
          ⌫ Undo
        </button>
        <button onClick={() => { setStrokes([]); setGrade(null) }} disabled={strokes.length === 0 && !grade}>
          ✕ Clear
        </button>
        <button
          onClick={() => setHints((h) => h + 1)}
          disabled={!!grade || revealed || !ref || strokes.length >= (ref?.paths.length ?? 0)}
          title="Show the next stroke (costs points)"
        >
          💡 Hint
        </button>
        <button onClick={() => setRevealed(true)} disabled={!!grade || revealed || !ref} title="Show the whole kanji (no points)">
          👁 Reveal
        </button>
        <button className="dp-check" onClick={check} disabled={!!grade || !ref || strokes.length === 0}>
          ✓ Check
        </button>
      </div>

      {grade && (
        <div className={'drawpad-result' + (grade.pass ? ' pass' : ' fail')}>
          <span className="dp-score">{grade.score}%</span>
          <span>
            {grade.pass ? 'Nice!' : 'Keep practicing'}
            {grade.strokeCountDelta !== 0 &&
              ` · ${Math.abs(grade.strokeCountDelta)} stroke${Math.abs(grade.strokeCountDelta) === 1 ? '' : 's'} ${grade.strokeCountDelta > 0 ? 'extra' : 'missing'}`}
          </span>
        </div>
      )}
      {ref === null && <div className="drawpad-loading">Loading stroke data…</div>}
    </div>
  )
}
