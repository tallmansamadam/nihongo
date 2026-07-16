import { useMemo, useState } from 'react'
import DrawPad from './DrawPad'
import { KANJI } from '../data/kanji'
import { KANJI_BASE } from '../data/kanji-base'
import { LEVELS, type Level } from '../data/quizzes'
import { recordDrawing } from '../lib/progress'
import type { DrawingGrade } from '../lib/strokeMatch'

interface PoolKanji {
  char: string
  meanings: string[]
  on: string[]
  kun: string[]
  strokes: number
}

// Merged curated + baseline kanji for a JLPT level.
function levelPool(level: Level): PoolKanji[] {
  const pool: PoolKanji[] = []
  for (const k of Object.values(KANJI)) {
    if (k.jlpt === level) pool.push({ char: k.char, meanings: k.meanings, on: k.on, kun: k.kun, strokes: k.strokes })
  }
  for (const [char, b] of Object.entries(KANJI_BASE)) {
    if (b.jlpt === level) pool.push({ char, meanings: b.meanings, on: b.on, kun: b.kun, strokes: b.strokes })
  }
  return pool
}

// Points: quiz = up to 10 by accuracy, −2 per hint, 0 when revealed.
// Trace mode = flat 1 point for a passing check.
function quizPoints(g: DrawingGrade, hints: number, revealed: boolean): number {
  if (revealed || !g.pass) return 0
  return Math.max(1, Math.round((g.score / 100) * 10) - hints * 2)
}

export default function DrawPractice({ initialChar }: { initialChar?: string }) {
  const [level, setLevel] = useState<Level>('N5')
  const [mode, setMode] = useState<'trace' | 'quiz'>(initialChar ? 'trace' : 'quiz')
  const [override, setOverride] = useState<string | null>(initialChar ?? null)
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9))
  const [round, setRound] = useState(0)
  const [done, setDone] = useState(false)
  const [session, setSession] = useState({ tried: 0, passed: 0, pts: 0 })

  const pool = useMemo(() => levelPool(level), [level])
  const target: PoolKanji | null = useMemo(() => {
    if (override) {
      const b = KANJI_BASE[override]
      const c = Object.values(KANJI).find((k) => k.char === override)
      if (c) return { char: c.char, meanings: c.meanings, on: c.on, kun: c.kun, strokes: c.strokes }
      if (b) return { char: override, meanings: b.meanings, on: b.on, kun: b.kun, strokes: b.strokes }
      return { char: override, meanings: [], on: [], kun: [], strokes: 0 }
    }
    if (pool.length === 0) return null
    // simple deterministic scramble per session seed
    const idx = (seed + round * 2654435761) % pool.length
    return pool[idx]
  }, [override, pool, seed, round])

  const next = () => {
    setOverride(null)
    setDone(false)
    setRound((r) => r + 1)
  }

  const graded = (g: DrawingGrade, hints: number, revealed: boolean) => {
    if (!target) return
    const pts = mode === 'quiz' ? quizPoints(g, hints, revealed) : g.pass ? 1 : 0
    const how = revealed ? 'revealed' : hints > 0 ? `${hints} hint${hints > 1 ? 's' : ''}` : 'no hints'
    recordDrawing(
      target.char,
      g.score,
      pts,
      `${target.char} drawn ${g.score}% (${mode}, ${how})`,
    )
    setSession((s) => ({ tried: s.tried + 1, passed: s.passed + (g.pass ? 1 : 0), pts: s.pts + pts }))
    setDone(true)
  }

  return (
    <div className="draw-practice">
      <header className="reader-head">
        <div>
          <h1 className="story-title">Kanji Drawing Practice</h1>
          <div className="story-sub">
            <span>{pool.length} kanji in {level}</span>
            <span className="dot">·</span>
            <span>
              Session: {session.passed}/{session.tried} passed · {session.pts} pts
            </span>
          </div>
          <p className="story-summary">
            {mode === 'trace'
              ? 'Trace over the guide to learn the shape and stroke order.'
              : 'Draw the kanji from memory. Hints cost points; reveal forfeits them.'}
          </p>
        </div>
      </header>

      <div className="draw-controls">
        <div className="seg">
          {LEVELS.map((l) => (
            <button
              key={l}
              className={l === level ? 'active' : ''}
              onClick={() => { setLevel(l); setOverride(null); setDone(false); setRound(0); setSeed(Math.floor(Math.random() * 1e9)) }}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="seg">
          <button className={mode === 'trace' ? 'active' : ''} onClick={() => { setMode('trace'); setDone(false) }}>
            ✍ Trace
          </button>
          <button className={mode === 'quiz' ? 'active' : ''} onClick={() => { setMode('quiz'); setDone(false) }}>
            🎯 Quiz
          </button>
        </div>
      </div>

      {target && (
        <div className="draw-stage">
          <div className="draw-prompt">
            {mode === 'trace' ? (
              <>
                <div className="draw-char">{target.char}</div>
                <div className="draw-meta">
                  <div className="draw-meanings">{target.meanings.slice(0, 3).join(', ')}</div>
                  <div className="draw-readings">
                    {[...target.kun.slice(0, 3), ...target.on.slice(0, 2)].join('、')}
                  </div>
                  <div className="draw-strokes">{target.strokes} strokes</div>
                </div>
              </>
            ) : (
              <div className="draw-meta quiz">
                <div className="draw-quiz-label">Draw the kanji for:</div>
                <div className="draw-meanings big">{target.meanings.slice(0, 3).join(', ')}</div>
                <div className="draw-readings">
                  {[...target.kun.slice(0, 3), ...target.on.slice(0, 2)].join('、')}
                </div>
                <div className="draw-strokes">{target.strokes} strokes</div>
              </div>
            )}
          </div>

          <DrawPad
            char={target.char}
            mode={mode === 'trace' ? 'practice' : 'quiz'}
            onGraded={graded}
            resetToken={round}
          />

          <div className="draw-next">
            {done ? (
              <button className="test-submit" onClick={next}>Next kanji ›</button>
            ) : (
              <button onClick={next} title="Skip without points">Skip ›</button>
            )}
          </div>
        </div>
      )}
      {!target && <p>No kanji available for this level.</p>}
    </div>
  )
}
