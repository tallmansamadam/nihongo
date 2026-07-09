import { useEffect, useRef, useState } from 'react'
import { codepointHex } from '../data/kanji'

interface Props {
  char: string
  size?: number
  /** Bump this number to replay the stroke animation from the start. */
  replay?: number
}

// Loads a KanjiVG SVG and re-draws the strokes one at a time with a
// dash-offset animation so the stroke order is visible.
export default function StrokeOrder({ char, size = 120, replay }: Props) {
  const [paths, setPaths] = useState<string[] | null>(null)
  const [error, setError] = useState(false)
  const [playToken, setPlayToken] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    setPaths(null)
    setError(false)
    const hex = codepointHex(char)
    // Try the bundled SVG first; fall back to the KanjiVG CDN for kanji that
    // only appear in fetched content and aren't packaged locally.
    const sources = [
      `${import.meta.env.BASE_URL}kanjivg/${hex}.svg`,
      `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/${hex}.svg`,
    ]
    ;(async () => {
      for (const url of sources) {
        try {
          const r = await fetch(url)
          if (!r.ok) continue
          const text = await r.text()
          if (cancelled) return
          const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
          const ds = [...doc.querySelectorAll('path')]
            .map((p) => p.getAttribute('d'))
            .filter((d): d is string => !!d)
          if (ds.length === 0) continue
          setPaths(ds)
          setPlayToken((t) => t + 1)
          return
        } catch {
          /* try next source */
        }
      }
      if (!cancelled) setError(true)
    })()
    return () => {
      cancelled = true
    }
  }, [char])

  // Draw each stroke in order. Reset every stroke to "undrawn", then animate to
  // "drawn". A double requestAnimationFrame commits the undrawn state to the
  // screen first, so re-running this (e.g. after releasing Alt) reliably
  // restarts the animation instead of snapping to the finished glyph.
  useEffect(() => {
    if (!paths || !containerRef.current) return
    const strokes = [...containerRef.current.querySelectorAll<SVGPathElement>('.stroke')]
    const perStroke = 0.5 // seconds
    strokes.forEach((s) => {
      const len = s.getTotalLength()
      s.style.transition = 'none'
      s.style.strokeDasharray = `${len}`
      s.style.strokeDashoffset = `${len}`
    })
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        strokes.forEach((s, i) => {
          s.style.transition = `stroke-dashoffset ${perStroke}s ease ${i * perStroke}s`
          s.style.strokeDashoffset = '0'
        })
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [paths, playToken, replay])

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
