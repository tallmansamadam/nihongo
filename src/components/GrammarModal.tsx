import { useEffect, useMemo } from 'react'
import { findLesson, normalizePoint } from '../data/grammarLessons'
import { STORIES } from '../data/stories'
import { READINGS } from '../data/readings'
import { SONGS } from '../data/songs'
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
