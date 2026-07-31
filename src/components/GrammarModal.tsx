import { useEffect, useMemo, useRef, useState } from 'react'
import {
  buildReinforcement,
  findLesson,
  normalizePoint,
  type GrammarLesson,
} from '../data/grammarLessons'
import { STORIES } from '../data/stories'
import { READINGS } from '../data/readings'
import { SONGS } from '../data/songs'
import { addPoints } from '../lib/progress'
import type { GrammarNote } from '../data/types'

interface Props {
  note: GrammarNote
  onClose: () => void
}

interface CrossRef {
  kind: 'story' | 'reading' | 'song'
  id: string
  title: string
  example: string
}

/** Everywhere in the bundled content that teaches the same grammar point. */
function crossRefs(point: string): CrossRef[] {
  const n = normalizePoint(point)
  if (!n) return []
  const out: CrossRef[] = []
  const scan = (kind: CrossRef['kind'], id: string, title: string, notes?: GrammarNote[]) => {
    for (const g of notes ?? []) {
      const gn = normalizePoint(g.point)
      if (gn === n || gn.includes(n) || n.includes(gn)) {
        out.push({ kind, id, title, example: g.example })
      }
    }
  }
  for (const s of STORIES) scan('story', s.id, s.title, s.grammar)
  for (const r of READINGS) scan('reading', r.id, r.title, r.grammar)
  for (const s of SONGS) scan('song', s.id, s.title, s.grammar)
  return out
}

// Full-screen grammar lesson overlay. Curated lesson when we have one;
// otherwise a mini-lesson built from the clicked note itself.
export default function GrammarModal({ note, onClose }: Props) {
  const lesson = useMemo(() => findLesson(note.point), [note])
  const refs = useMemo(() => crossRefs(note.point), [note])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="gm-backdrop" onClick={onClose}>
      <div className="gm-card" onClick={(e) => e.stopPropagation()}>
        <button className="gm-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="gm-point">{lesson ? lesson.title : note.point}</div>
        {lesson && <span className="gm-level">{lesson.level}</span>}

        <p className="gm-explanation">{lesson ? lesson.explanation : note.explanation}</p>

        {lesson && (
          <div className="gm-formation">
            <div className="gm-label">Formation</div>
            <code>{lesson.formation}</code>
          </div>
        )}

        <div className="gm-label">Examples</div>
        <ul className="gm-examples">
          {/* the example the user clicked always comes first */}
          <li>
            <span className="gm-jp">{note.example}</span>
            <span className="gm-en">{note.exampleEn}</span>
          </li>
          {lesson?.examples
            .filter((ex) => ex.jp !== note.example)
            .map((ex, i) => (
              <li key={i}>
                <span className="gm-jp">{ex.jp}</span>
                <span className="gm-en">{ex.en}</span>
              </li>
            ))}
        </ul>

        {lesson?.note && <p className="gm-note">💡 {lesson.note}</p>}

        {refs.length > 1 && (
          <>
            <div className="gm-label">Seen in</div>
            <div className="gm-refs">
              {refs.map((r, i) => (
                <button
                  key={i}
                  className="gm-ref"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('nihongo:goto', { detail: { kind: r.kind, id: r.id } }),
                    )
                    onClose()
                  }}
                >
                  {r.kind === 'song' ? '♪ ' : ''}
                  {r.title}
                </button>
              ))}
            </div>
          </>
        )}

        {lesson && <GrammarQuiz lesson={lesson} />}

        {!lesson && (
          <p className="gm-note">
            A full lesson for this point isn't written yet — the notes above come from this
            reading.
          </p>
        )}
      </div>
    </div>
  )
}

/** Reinforcement quiz shown under a grammar lesson. Immediate feedback per
 *  question; points are awarded once when all questions are answered. */
function GrammarQuiz({ lesson }: { lesson: GrammarLesson }) {
  const questions = useMemo(() => buildReinforcement(lesson), [lesson])
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null))
  const awarded = useRef(false)

  const answeredAll = questions.length > 0 && answers.every((a) => a !== null)
  const score = questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0)

  useEffect(() => {
    if (answeredAll && !awarded.current) {
      awarded.current = true
      addPoints('grammar', `${lesson.title.split('—')[0].trim()} quiz ${score}/${questions.length}`, score * 2)
    }
  }, [answeredAll, score, questions.length, lesson.title])

  if (questions.length === 0) return null

  return (
    <div className="gm-quiz">
      <div className="gm-label">Reinforce — choose the answer</div>
      {questions.map((q, qi) => {
        const chosen = answers[qi]
        const done = chosen !== null
        return (
          <div className="gq-item" key={qi}>
            <div className="gq-prompt">{q.prompt}</div>
            <div className="gq-choices">
              {q.choices.map((c, ci) => {
                let cls = 'gq-choice'
                if (done) {
                  if (ci === q.answer) cls += ' correct'
                  else if (ci === chosen) cls += ' wrong'
                }
                return (
                  <button
                    key={ci}
                    className={cls}
                    disabled={done}
                    onClick={() =>
                      setAnswers((a) => {
                        const n = [...a]
                        n[qi] = ci
                        return n
                      })
                    }
                  >
                    {c}
                  </button>
                )
              })}
            </div>
            {done && <div className="gq-explain">{q.explanation}</div>}
          </div>
        )
      })}
      {answeredAll && (
        <div className="gq-score">
          Score: {score}/{questions.length} · +{score * 2} points
        </div>
      )}
    </div>
  )
}
