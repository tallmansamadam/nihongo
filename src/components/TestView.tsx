import { useMemo, useState } from 'react'
import { buildTest, typeLabel, VARIATIONS, type Level } from '../data/quizzes'

// A single JLPT-style practice test (one of 100 repeatable variations).
export default function TestView({ level }: { level: Level }) {
  const [variation, setVariation] = useState(1)
  const test = useMemo(() => buildTest(level, variation), [level, variation])
  const [answers, setAnswers] = useState<(number | null)[]>(() => test.map(() => null))
  const [submitted, setSubmitted] = useState(false)

  function go(v: number) {
    const next = ((v - 1 + VARIATIONS) % VARIATIONS) + 1
    setVariation(next)
    setAnswers(test.map(() => null))
    setSubmitted(false)
  }
  function choose(qi: number, ci: number) {
    if (submitted) return
    setAnswers((a) => {
      const n = [...a]
      n[qi] = ci
      return n
    })
  }

  const score = test.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0)
  const answeredAll = answers.every((a) => a !== null)

  return (
    <div className="test">
      <header className="reader-head">
        <div>
          <h1 className="story-title">JLPT {level} — Practice Test</h1>
          <div className="story-sub">
            <span>Variation {variation} of {VARIATIONS}</span>
            <span className="dot">·</span>
            <span>{test.length} questions</span>
            <span className="dot">·</span>
            <span className="cat-pill">original practice</span>
          </div>
          <p className="story-summary">
            Multiple choice across grammar, vocabulary, and kanji. Original questions in the JLPT
            style — not real exam items.
          </p>
        </div>
        <div className="test-varctrl">
          <button onClick={() => go(variation - 1)} title="Previous variation">‹</button>
          <button onClick={() => go(Math.floor(Math.random() * VARIATIONS) + 1)}>Shuffle</button>
          <button onClick={() => go(variation + 1)} title="Next variation">›</button>
        </div>
      </header>

      <ol className="questions">
        {test.map((q, qi) => (
          <li className="question" key={q.id}>
            <div className="q-top">
              <span className="q-type">{typeLabel(q.type)}</span>
              <span className="q-hint">{q.hint}</span>
            </div>
            <div className="q-prompt">{q.prompt}</div>
            <div className="q-choices">
              {q.choices.map((c, ci) => {
                const chosen = answers[qi] === ci
                const isAnswer = q.answer === ci
                let cls = 'q-choice'
                if (submitted) {
                  if (isAnswer) cls += ' correct'
                  else if (chosen) cls += ' wrong'
                } else if (chosen) cls += ' chosen'
                return (
                  <button key={ci} className={cls} onClick={() => choose(qi, ci)}>
                    <span className="q-choice-mark">{'ABCD'[ci]}</span>
                    <span className="q-choice-text">{c}</span>
                  </button>
                )
              })}
            </div>
            {submitted && <div className="q-explain">{q.explanation}</div>}
          </li>
        ))}
      </ol>

      <div className="test-foot">
        {!submitted ? (
          <button className="test-submit" disabled={!answeredAll} onClick={() => setSubmitted(true)}>
            {answeredAll ? 'Submit test' : `Answer all ${test.length} questions`}
          </button>
        ) : (
          <div className="test-result">
            <div className="test-score">
              {score} / {test.length}
              <span className="test-pct"> · {Math.round((score / test.length) * 100)}%</span>
            </div>
            <div className="test-result-actions">
              <button onClick={() => { setSubmitted(false); setAnswers(test.map(() => null)) }}>
                Retry
              </button>
              <button className="test-submit" onClick={() => go(variation + 1)}>Next variation ›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
