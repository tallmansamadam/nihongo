// Stroke matching for the drawing practice: parses KanjiVG stroke paths into
// polylines and grades a user's drawn strokes against them. Deliberately
// forgiving — this is a learning aid, not calligraphy judgment.

import { codepointHex } from '../data/kanji'

export type Pt = [number, number]

// ---------------------------------------------------------------------------
// KanjiVG path parsing. KanjiVG uses M/m, C/c, S/s (and rarely L/l) in a
// 109x109 viewBox. We sample curves into polylines.
// ---------------------------------------------------------------------------

function parsePath(d: string): Pt[] {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? []
  const pts: Pt[] = []
  let i = 0
  let cmd = ''
  let x = 0
  let y = 0
  let px = 0 // previous cubic control (for S/s reflection)
  let py = 0
  const num = () => parseFloat(tokens[i++])

  const cubic = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => {
    const x0 = x
    const y0 = y
    const STEPS = 12
    for (let s = 1; s <= STEPS; s++) {
      const t = s / STEPS
      const mt = 1 - t
      pts.push([
        mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3,
        mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3,
      ])
    }
    px = x2
    py = y2
    x = x3
    y = y3
  }

  while (i < tokens.length) {
    const tok = tokens[i]
    if (/[a-zA-Z]/.test(tok)) {
      cmd = tok
      i++
      continue
    }
    switch (cmd) {
      case 'M': x = num(); y = num(); pts.push([x, y]); cmd = 'L'; break
      case 'm': x += num(); y += num(); pts.push([x, y]); cmd = 'l'; break
      case 'L': x = num(); y = num(); pts.push([x, y]); break
      case 'l': x += num(); y += num(); pts.push([x, y]); break
      case 'H': x = num(); pts.push([x, y]); break
      case 'h': x += num(); pts.push([x, y]); break
      case 'V': y = num(); pts.push([x, y]); break
      case 'v': y += num(); pts.push([x, y]); break
      case 'C': cubic(num(), num(), num(), num(), num(), num()); break
      case 'c': cubic(x + num(), y + num(), x + num(), y + num(), x + num(), y + num()); break
      case 'S': { const c1x = 2 * x - px; const c1y = 2 * y - py; cubic(c1x, c1y, num(), num(), num(), num()); break }
      case 's': { const c1x = 2 * x - px; const c1y = 2 * y - py; cubic(c1x, c1y, x + num(), y + num(), x + num(), y + num()); break }
      default: i++ // unsupported command — skip its number
    }
  }
  return pts
}

/** Resample a polyline to n points equally spaced along its arc length. */
export function resample(pts: Pt[], n: number): Pt[] {
  if (pts.length === 0) return []
  if (pts.length === 1) return Array.from({ length: n }, () => pts[0])
  const seg: number[] = [0]
  let total = 0
  for (let i = 1; i < pts.length; i++) {
    total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    seg.push(total)
  }
  if (total === 0) return Array.from({ length: n }, () => pts[0])
  const out: Pt[] = []
  for (let k = 0; k < n; k++) {
    const target = (k / (n - 1)) * total
    let j = 1
    while (j < seg.length - 1 && seg[j] < target) j++
    const t = (target - seg[j - 1]) / (seg[j] - seg[j - 1] || 1)
    out.push([
      pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * t,
      pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * t,
    ])
  }
  return out
}

// ---------------------------------------------------------------------------
// Reference stroke loading (bundled SVG first, CDN fallback), cached.
// ---------------------------------------------------------------------------

export interface RefStrokes {
  /** raw path `d` strings, in stroke order (for rendering hints/reveal) */
  paths: string[]
  /** each stroke sampled to a polyline in the 109x109 box */
  polylines: Pt[][]
}

const cache = new Map<string, Promise<RefStrokes | null>>()

export function loadRefStrokes(char: string): Promise<RefStrokes | null> {
  let p = cache.get(char)
  if (!p) {
    p = (async () => {
      const hex = codepointHex(char)
      const sources = [
        `${import.meta.env.BASE_URL}kanjivg/${hex}.svg`,
        `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/${hex}.svg`,
      ]
      for (const url of sources) {
        try {
          const r = await fetch(url)
          if (!r.ok) continue
          const doc = new DOMParser().parseFromString(await r.text(), 'image/svg+xml')
          const paths = [...doc.querySelectorAll('path')]
            .map((el) => el.getAttribute('d'))
            .filter((d): d is string => !!d)
          if (paths.length === 0) continue
          return { paths, polylines: paths.map(parsePath) }
        } catch {
          /* try next source */
        }
      }
      return null
    })()
    cache.set(char, p)
  }
  return p
}

// ---------------------------------------------------------------------------
// Grading
// ---------------------------------------------------------------------------

export interface StrokeGrade {
  /** 0-100 */
  score: number
}

export interface DrawingGrade {
  /** overall 0-100 */
  score: number
  perStroke: StrokeGrade[]
  strokeCountDelta: number
  pass: boolean
}

const N = 16 // sample points per stroke

/** Grade one user stroke against one reference stroke (both in 109-box). */
function gradeStroke(user: Pt[], ref: Pt[]): number {
  const u = resample(user, N)
  const r = resample(ref, N)
  // mean point distance, forward and reversed (reversed is penalized but not fatal)
  let fwd = 0
  let rev = 0
  for (let i = 0; i < N; i++) {
    fwd += Math.hypot(u[i][0] - r[i][0], u[i][1] - r[i][1])
    rev += Math.hypot(u[i][0] - r[N - 1 - i][0], u[i][1] - r[N - 1 - i][1])
  }
  fwd /= N
  rev /= N
  const dist = Math.min(fwd, rev * 1.6) // wrong direction costs ~1.6x
  // 0 distance => 100; ~28 units (a quarter of the box) => 0
  const score = Math.max(0, Math.min(100, 100 * (1 - dist / 28)))
  return Math.round(score)
}

/** Grade a whole drawing. Strokes are paired in order; extra/missing strokes
 *  reduce the overall score. */
export function gradeDrawing(user: Pt[][], ref: Pt[][]): DrawingGrade {
  const n = Math.min(user.length, ref.length)
  const perStroke: StrokeGrade[] = []
  let sum = 0
  for (let i = 0; i < n; i++) {
    const s = gradeStroke(user[i], ref[i])
    perStroke.push({ score: s })
    sum += s
  }
  const delta = user.length - ref.length
  // unmatched reference strokes score 0; extra user strokes cost 12 pts each
  const base = ref.length > 0 ? sum / ref.length : 0
  const score = Math.round(Math.max(0, base - Math.max(0, delta) * 12))
  return { score, perStroke, strokeCountDelta: delta, pass: score >= 55 }
}
