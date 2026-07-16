import { useEffect, useMemo, useRef, useState } from 'react'
import { buildExam, EXAM_VARIATIONS, type Exam } from '../data/exam'
import { typeLabel, type Level } from '../data/quizzes'
import { recordTest } from '../lib/progress'

// A timed, sectioned simulated JLPT exam. No feedback until submission;
// the timer auto-submits at zero. Results are recorded to the report card.
export default function ExamView({ level }: { level: Level }) {
  const [variation, setVariation] = useState(() => Math.floor(Math.random() * EXAM_VARIATIONS) + 1)
  const exam: Exam = useMemo(() => buildExam(level, variation), [level, variation])
  const [phase, setPhase] = useState<'intro' | 'running' | 'done'>('intro')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [remaining, setRemaining] = useState(exam.seconds)
  const startedAt = useRef(0)
  const recorded = useRef(false)

  // reset when the level changes
  useEffect(() => {
    setPhase('intro')
    setAnswers({})
    setVariation(Math.floor(Math.random() * EXAM_VARIATIONS) + 1)
  }, [level])

  useEffect(() => {
    if (phase !== 'running') return
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          setPhase('done')
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  const allItems = exam.sections.flatMap((s) => s.items)
  const score = allItems.reduce((n, q) => n + (answers[q.id] === q.answer ? 1 : 0), 0)
  const answered = allItems.filter((q) => answers[q.id] !== undefined).length

  // record once when finished
  useEffect(() => {
    if (phase !== 'done' || recorded.current) return
    recorded.current = true
    const pct = score / exam.totalItems
    const pts = Math.round(pct * 50) + (pct >= 0.6 ? 10 : 0) // pass bonus
    recordTest(
      {
        level,
        mode: 'exam',
        score,
        total: exam.totalItems,
        seconds: Math.round((Date.now() - startedAt.current) / 1000),
      },
      pts,
    )
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    setAnswers({})
    setRemaining(exam.seconds)
    startedAt.current = Date.now()
    recorded.current = false
    setPhase('running')
  }
  const newExam = () => {
    setVariation(Math.floor(Math.random() * EXAM_VARIATIONS) + 1)
    setAnswers({})
    setPhase('intro')
  }

  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  if (phase === 'intro') {
    return (
      <div className="exam">
        <header className="reader-head">
          <div>
            <h1 className="story-title">JLPT {level} — Simulated Exam</h1>
            <div className="story-sub">
              <span>{exam.totalItems} questions</span>
              <span className="dot">·</span>
              <span>{Math.round(exam.seconds / 60)} minutes</span>
              <span className="dot">·</span>
              <span className="cat-pill">original practice</span>
            </div>
          </div>
        </header>
        <div className="exam-intro">
          <p>
            A scaled-down mock exam in the JLPT format: three timed sections, no feedback until you
            finish, and the clock auto-submits at zero.
          </p>
          <ul>
            {exam.sections.map((s) => (
              <li key={s.id}>
                <strong>{s.title}</strong> ({s.titleEn}) — {s.items.length} questions
              </li>
            ))}
          </ul>
          <p className="exam-note">
            Scoring: up to 50 points by result, +10 bonus for passing (60%). Results are saved to
            your report card.
          </p>
          <button className="test-submit" onClick={start}>
            Start exam ▶
          </button>
        </div>
      </div>
    )
  }

  const running = phase === 'running'

  return (
    <div className="exam">
      <header className="reader-head exam-head">
        <div>
          <h1 className="story-title">JLPT {level} — Simulated Exam</h1>
          <div className="story-sub">
            <span>Variation {variation}</span>
            <span className="dot">·</span>
            <span>
              {answered}/{exam.totalItems} answered
            </span>
          </div>
        </div>
        {running && (
          <div className={'exam-timer' + (remaining <= 60 ? ' urgent' : '')}>⏱ {mmss(remaining)}</div>
        )}
      </header>

      {exam.sections.map((sec) => (
        <section key={sec.id} className="exam-section">
          <h2 className="exam-section-title">
            {sec.title} <span className="exam-section-en">{sec.titleEn}</span>
          </h2>
          {sec.id === 'dokkai' && <div className="exam-passage">{exam.passage}</div>}
          <ol className="questions">
            {sec.items.map((q) => {
              const chosen = answers[q.id]
              return (
                <li className="question" key={q.id}>
                  <div className="q-top">
                    <span className="q-type">{typeLabel(q.type)}</span>
                    {!running && <span className="q-hint">{q.hint}</span>}
                  </div>
                  <div className="q-prompt">{q.prompt}</div>
                  <div className="q-choices">
                    {q.choices.map((c, ci) => {
                      let cls = 'q-choice'
                      if (!running) {
                        if (ci === q.answer) cls += ' correct'
                        else if (chosen === ci) cls += ' wrong'
                      } else if (chosen === ci) cls += ' chosen'
                      return (
                        <button
                          key={ci}
                          className={cls}
                          onClick={() => running && setAnswers((a) => ({ ...a, [q.id]: ci }))}
                        >
                          <span className="q-choice-mark">{'ABCD'[ci]}</span>
                          <span className="q-choice-text">{c}</span>
                        </button>
                      )
                    })}
                  </div>
                  {!running && <div className="q-explain">{q.explanation}</div>}
                </li>
              )
            })}
          </ol>
        </section>
      ))}

      <div className="test-foot">
        {running ? (
          <button className="test-submit" onClick={() => setPhase('done')}>
            Submit exam ({answered}/{exam.totalItems} answered)
          </button>
        ) : (
          <div className="test-result">
            <div className="test-score">
              {score} / {exam.totalItems}
              <span className="test-pct"> · {Math.round((score / exam.totalItems) * 100)}%</span>
              <span className={'exam-verdict' + (score / exam.totalItems >= 0.6 ? ' pass' : ' fail')}>
                {score / exam.totalItems >= 0.6 ? '合格 PASS' : '不合格 — keep going'}
              </span>
            </div>
            <div className="exam-breakdown">
              {exam.sections.map((s) => {
                const ss = s.items.reduce((n, q) => n + (answers[q.id] === q.answer ? 1 : 0), 0)
                return (
                  <span key={s.id} className="exam-bd-item">
                    {s.title} {ss}/{s.items.length}
                  </span>
                )
              })}
            </div>
            <div className="test-result-actions">
              <button className="test-submit" onClick={newExam}>
                New exam ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
