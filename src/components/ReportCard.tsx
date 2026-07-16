import { useEffect, useState } from 'react'
import { loadProgress, letterGrade, onProgressChange, streak, type Progress } from '../lib/progress'
import { buildDecks, loadKnown } from '../lib/flashcards'
import { LEVELS, type Level } from '../data/quizzes'

// The report card: points, grades, mastery and history — all local, no account.
export default function ReportCard() {
  const [p, setP] = useState<Progress>(() => loadProgress())
  useEffect(() => onProgressChange(() => setP(loadProgress())), [])

  const kanjiChars = Object.keys(p.kanji)
  const drawAvg =
    kanjiChars.length > 0
      ? Math.round(kanjiChars.reduce((s, c) => s + p.kanji[c].best, 0) / kanjiChars.length)
      : 0
  const mastered = kanjiChars.filter((c) => p.kanji[c].best >= 75).length

  const exams = p.tests.filter((t) => t.mode === 'exam')
  const examAvg =
    exams.length > 0
      ? Math.round((exams.reduce((s, t) => s + t.score / t.total, 0) / exams.length) * 100)
      : 0

  const bestByLevel: Partial<Record<Level, number>> = {}
  for (const t of p.tests) {
    const pct = Math.round((t.score / t.total) * 100)
    if (pct > (bestByLevel[t.level] ?? -1)) bestByLevel[t.level] = pct
  }

  const flashKnown = buildDecks().reduce((n, d) => n + loadKnown(d.id).size, 0)
  const overall = kanjiChars.length || exams.length ? Math.round((drawAvg + (exams.length ? examAvg : drawAvg)) / 2) : 0
  const days = streak(p)

  const fmt = (t: number) => {
    const d = new Date(t)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="report">
      <header className="reader-head">
        <div>
          <h1 className="story-title">Report Card 成績表</h1>
          <div className="story-sub">
            <span>All progress is saved on this device</span>
          </div>
        </div>
        <div className="report-grade" title="Overall grade from drawing accuracy and exam results">
          {letterGrade(overall)}
        </div>
      </header>

      <div className="report-tiles">
        <div className="tile">
          <div className="tile-num">{p.points}</div>
          <div className="tile-label">points</div>
        </div>
        <div className="tile">
          <div className="tile-num">{days}</div>
          <div className="tile-label">day streak</div>
        </div>
        <div className="tile">
          <div className="tile-num">{kanjiChars.length}</div>
          <div className="tile-label">kanji practiced</div>
        </div>
        <div className="tile">
          <div className="tile-num">{mastered}</div>
          <div className="tile-label">kanji mastered (≥75%)</div>
        </div>
        <div className="tile">
          <div className="tile-num">{drawAvg}%</div>
          <div className="tile-label">avg drawing accuracy</div>
        </div>
        <div className="tile">
          <div className="tile-num">{exams.length}</div>
          <div className="tile-label">exams taken</div>
        </div>
        <div className="tile">
          <div className="tile-num">{examAvg}%</div>
          <div className="tile-label">avg exam score</div>
        </div>
        <div className="tile">
          <div className="tile-num">{flashKnown}</div>
          <div className="tile-label">flashcards known</div>
        </div>
      </div>

      <section className="report-section">
        <h2>Best test scores by level</h2>
        <div className="report-levels">
          {LEVELS.map((lvl) => {
            const best = bestByLevel[lvl]
            return (
              <div key={lvl} className="report-level">
                <span className="rl-name">{lvl}</span>
                <div className="rl-bar">
                  <div
                    className={'rl-fill' + ((best ?? 0) >= 60 ? ' pass' : '')}
                    style={{ width: `${best ?? 0}%` }}
                  />
                </div>
                <span className="rl-pct">{best !== undefined ? `${best}%` : '—'}</span>
              </div>
            )
          })}
        </div>
      </section>

      {kanjiChars.length > 0 && (
        <section className="report-section">
          <h2>Kanji practice — best accuracy</h2>
          <div className="report-kanji">
            {kanjiChars
              .sort((a, b) => p.kanji[b].last - p.kanji[a].last)
              .slice(0, 60)
              .map((c) => (
                <span
                  key={c}
                  className={
                    'rk' + (p.kanji[c].best >= 75 ? ' good' : p.kanji[c].best >= 50 ? ' mid' : ' low')
                  }
                  title={`${c}: best ${p.kanji[c].best}% over ${p.kanji[c].tries} tries`}
                >
                  {c}
                </span>
              ))}
          </div>
        </section>
      )}

      <section className="report-section">
        <h2>Recent activity</h2>
        {p.ledger.length === 0 ? (
          <p className="report-empty">
            Nothing yet — try the drawing practice, a flashcard deck, or a simulated exam.
          </p>
        ) : (
          <ul className="report-ledger">
            {p.ledger.slice(0, 25).map((e, i) => (
              <li key={i}>
                <span className="rl-when">{fmt(e.t)}</span>
                <span className="rl-what">{e.label}</span>
                <span className={'rl-pts' + (e.pts > 0 ? ' plus' : '')}>
                  {e.pts > 0 ? `+${e.pts}` : e.pts}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
