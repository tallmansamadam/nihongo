import { useEffect, useRef, useState } from 'react'
import { codepointHex } from '../data/kanji'

interface Props {
  char: string
  size?: number
}

// Loads a KanjiVG SVG and re-draws the strokes one at a time with a
// dash-offset animation so the stroke order is visible.
export default function StrokeOrder({ char, size = 120 }: Props) {
  const [paths, setPaths] = useState<string[] | null>(null)
  const [error, setError] = useState(false)
  const [playToken, setPlayToken] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    setPaths(null)
    setError(false)
    const hex = codepointHex(char)
    fetch(`${import.meta.env.BASE_URL}kanjivg/${hex}.svg`)
      .then((r) => {
        if (!r.ok) throw new Error('not found')
        return r.text()
      })
      .then((text) => {
        if (cancelled) return
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
        const ds = [...doc.querySelectorAll('path')]
          .map((p) => p.getAttribute('d'))
          .filter((d): d is string => !!d)
        setPaths(ds)
        setPlayToken((t) => t + 1)
      })
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [char])

  // Drive the per-stroke animation by toggling a data attribute after mount.
  useEffect(() => {
    if (!paths || !containerRef.current) return
    const strokes = containerRef.current.querySelectorAll<SVGPathElement>('.stroke')
    strokes.forEach((s) => {
      const len = s.getTotalLength()
      s.style.transition = 'none'
      s.style.strokeDasharray = `${len}`
      s.style.strokeDashoffset = `${len}`
    })
    // Force reflow so the reset offset takes effect before animating.
    void containerRef.current.getBoundingClientRect()
    const perStroke = 0.5 // seconds
    strokes.forEach((s, i) => {
      s.style.transition = `stroke-dashoffset ${perStroke}s ease ${i * perStroke}s`
      s.style.strokeDashoffset = '0'
    })
  }, [paths, playToken])

  if (error) {
    return <div className="stroke-fallback" style={{ fontSize: size * 0.7 }}>{char}</div>
  }

  return (
    <div className="stroke-order">
      <div ref={containerRef}>
        <svg viewBox="0 0 109 109" width={size} height={size} className="stroke-svg">
          {/* faint guide showing the finished glyph */}
          {paths?.map((d, i) => (
            <path key={`g${i}`} d={d} className="stroke-guide" />
          ))}
          {paths?.map((d, i) => (
            <path key={`s${i}`} d={d} className="stroke" />
          ))}
        </svg>
      </div>
      <button className="replay" onClick={() => setPlayToken((t) => t + 1)} disabled={!paths}>
        ↻ Replay
      </button>
    </div>
  )
}
