import { useEffect, useState } from 'react'
import { getTokenizer } from '../lib/furigana'

// Retro travel-ad load screen (original artwork): a cheerful traveler, a prop
// plane arcing across the sea toward a top-down map of Japan, mid-century
// sunburst and all. Shown on launch while the furigana engine warms up.
const MIN_MS = 2800
const MAX_MS = 7000

export default function Splash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const started = Date.now()
    let cancelled = false
    const finish = () => {
      if (cancelled) return
      setLeaving(true)
      window.setTimeout(onDone, 450) // matches the fade-out transition
    }
    const minWait = new Promise((r) => setTimeout(r, MIN_MS))
    const warmup = getTokenizer().catch(() => {})
    Promise.all([minWait, warmup]).then(finish)
    const hardStop = window.setTimeout(finish, MAX_MS)
    return () => {
      cancelled = true
      window.clearTimeout(hardStop)
      void started
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={'splash' + (leaving ? ' leaving' : '')} onClick={() => setLeaving(true)}>
      <svg viewBox="0 0 800 500" className="splash-art" aria-label="Loading">
        {/* sunburst */}
        <g className="sunburst" transform="translate(400 250)">
          {Array.from({ length: 12 }).map((_, i) => (
            <path
              key={i}
              d="M0 0 L-70 -600 L70 -600 Z"
              fill={i % 2 ? '#f3dcb2' : '#f7ecd7'}
              transform={`rotate(${i * 30})`}
            />
          ))}
        </g>

        {/* sea haze band */}
        <ellipse cx="400" cy="330" rx="380" ry="130" fill="#bcd9d4" opacity="0.5" />

        {/* --- top-down Japan (stylised, cartoon) --- */}
        <g className="japan" transform="translate(545 105) rotate(14)">
          {/* Hokkaido */}
          <path d="M118 6 C138 -2 158 8 156 26 C154 44 136 52 120 46 C104 40 100 14 118 6 Z" />
          {/* Honshu */}
          <path d="M108 62 C126 74 118 96 100 112 C80 130 62 148 44 168 C28 186 6 196 -4 184 C-14 172 -2 156 14 146 C36 132 58 108 74 88 C84 74 94 56 108 62 Z" />
          {/* Shikoku */}
          <path d="M22 196 C36 190 50 196 48 208 C46 220 28 224 18 216 C10 209 12 200 22 196 Z" />
          {/* Kyushu */}
          <path d="M-16 200 C-4 202 0 216 -8 228 C-16 240 -34 240 -38 228 C-42 214 -30 198 -16 200 Z" />
          <text className="japan-label" x="150" y="120" transform="rotate(-14 150 120)">日本</text>
        </g>

        {/* dashed flight path */}
        <path
          id="flightpath"
          className="flight-dash"
          d="M110 380 C 220 210, 380 150, 560 180"
          fill="none"
        />

        {/* retro prop plane riding the path */}
        <g className="plane">
          <g transform="rotate(8)">
            <ellipse cx="0" cy="0" rx="30" ry="9" fill="#d94f30" />
            <path d="M-4 -4 L-22 -26 L-10 -26 L6 -6 Z" fill="#e8734f" />
            <path d="M-4 4 L-22 26 L-10 26 L6 6 Z" fill="#c24327" />
            <path d="M-30 -2 L-42 -14 L-34 -14 L-24 -4 Z" fill="#e8734f" />
            <circle cx="26" cy="0" r="4" fill="#fbe9c9" />
            <circle cx="30" cy="0" r="1.6" fill="#2f4858" className="prop" />
            <circle cx="8" cy="-3" r="3" fill="#fbe9c9" />
            <circle cx="16" cy="-3" r="3" fill="#fbe9c9" />
          </g>
          <animateMotion dur="5s" repeatCount="indefinite" rotate="auto">
            <mpath href="#flightpath" />
          </animateMotion>
        </g>

        {/* drifting clouds */}
        <g className="cloud cloud-a" transform="translate(180 140)">
          <ellipse cx="0" cy="0" rx="34" ry="13" fill="#ffffff" opacity="0.9" />
          <ellipse cx="22" cy="-8" rx="20" ry="10" fill="#ffffff" opacity="0.9" />
        </g>
        <g className="cloud cloud-b" transform="translate(620 320)">
          <ellipse cx="0" cy="0" rx="28" ry="11" fill="#ffffff" opacity="0.8" />
          <ellipse cx="-18" cy="-7" rx="16" ry="8" fill="#ffffff" opacity="0.8" />
        </g>

        {/* --- excited traveler with suitcase --- */}
        <g className="traveler" transform="translate(120 380)">
          {/* suitcase */}
          <rect x="34" y="26" width="44" height="30" rx="4" fill="#b5402f" />
          <rect x="50" y="20" width="12" height="8" rx="3" fill="#7e2b1e" />
          <rect x="34" y="36" width="44" height="4" fill="#e8b04b" />
          {/* body */}
          <path d="M-2 8 C-6 34 -4 52 0 56 L22 56 C28 40 26 20 20 6 Z" fill="#2f4858" />
          {/* waving arm */}
          <path className="wave-arm" d="M2 14 C-12 6 -22 -6 -26 -18" stroke="#2f4858" strokeWidth="9" strokeLinecap="round" fill="none" />
          <circle cx="-27" cy="-21" r="6" fill="#f2c79c" />
          {/* suitcase arm */}
          <path d="M18 16 C28 20 38 24 48 26" stroke="#2f4858" strokeWidth="9" strokeLinecap="round" fill="none" />
          {/* head */}
          <circle cx="10" cy="-12" r="17" fill="#f2c79c" />
          {/* 60s porkpie hat */}
          <path d="M-8 -22 C-6 -32 26 -32 28 -22 L30 -18 L-10 -18 Z" fill="#d94f30" />
          <rect x="-10" y="-19" width="40" height="4" rx="2" fill="#a83a22" />
          {/* face */}
          <circle cx="4" cy="-13" r="1.8" fill="#2b2118" />
          <circle cx="16" cy="-13" r="1.8" fill="#2b2118" />
          <path d="M4 -5 C8 -1 14 -1 18 -6" stroke="#2b2118" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* excitement marks */}
          <path className="spark" d="M36 -28 l4 -8 M42 -24 l8 -4 M40 -34 l7 -7" stroke="#e8734f" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* retro headline */}
        <text className="splash-title" x="400" y="452" textAnchor="middle">日本へ行こう！</text>
        <text className="splash-sub" x="400" y="480" textAnchor="middle">
          NIHONGO READER · いま出発します<tspan className="dots">…</tspan>
        </text>
      </svg>
    </div>
  )
}
