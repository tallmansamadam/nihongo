// Builds the bundled kanji dictionary + stroke SVGs. Coverage:
//  - every kanji appearing in bundled content and the remote-library readings
//  - the complete JLPT N5–N1 kanji lists from kanjiapi.dev (~2200 kanji)
// For each kanji it fetches baseline dictionary data (meanings, on/kun,
// strokes, JLPT level) from kanjiapi.dev and the KanjiVG stroke-order SVG.
// Output: src/data/kanji-base.ts + public/kanjivg/*.svg
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dataDir = join(root, 'src', 'data')
const kvgDir = join(root, 'public', 'kanjivg')

const KANJI_RE = /[一-龯㐀-䶿]/g
const codepointHex = (ch) => ch.codePointAt(0).toString(16).padStart(5, '0')

// --- collect every kanji that appears in the content + curated set ---
const contentFiles = ['stories.ts', 'readings.ts', 'songs.ts', 'kanji.ts', 'components.ts']
const used = new Set()
for (const f of contentFiles) {
  const text = await readFile(join(dataDir, f), 'utf8')
  for (const m of text.matchAll(KANJI_RE)) used.add(m[0])
}
// …plus every kanji in the remote-library readings (bundled as a snapshot),
// so their hover data and stroke SVGs ship offline too.
const libDir = join(root, 'content', 'readings')
for (const f of await readdir(libDir)) {
  if (!f.endsWith('.json')) continue
  const text = await readFile(join(libDir, f), 'utf8')
  for (const m of text.matchAll(KANJI_RE)) used.add(m[0])
}

// --- the full JLPT kanji lists (new-JLPT levels, from kanjiapi.dev) ---
const jlptOf = new Map() // char -> 'N5'..'N1'
for (const n of [5, 4, 3, 2, 1]) {
  const res = await fetch(`https://kanjiapi.dev/v1/kanji/jlpt-${n}`)
  if (!res.ok) throw new Error(`jlpt-${n} list: HTTP ${res.status}`)
  const list = await res.json()
  for (const ch of list) {
    if (!jlptOf.has(ch)) jlptOf.set(ch, `N${n}`)
    used.add(ch)
  }
  console.log(`JLPT N${n}: ${list.length} kanji`)
}

// curated chars already have full entries — pull them from kanji.ts
const kanjiSrc = await readFile(join(dataDir, 'kanji.ts'), 'utf8')
const curated = new Set([...kanjiSrc.matchAll(/char: '([^']+)',\s*meanings:/g)].map((m) => m[1]))

const all = [...used]
const needData = all.filter((ch) => !curated.has(ch))
console.log(`${all.length} unique kanji total; ${curated.size} curated; ${needData.length} need base data.`)

const CONCURRENCY = 12
async function pooled(items, worker) {
  let i = 0
  let done = 0
  const runners = Array.from({ length: CONCURRENCY }, async () => {
    while (i < items.length) {
      const item = items[i++]
      await worker(item)
      if (++done % 100 === 0) process.stdout.write('.')
    }
  })
  await Promise.all(runners)
  console.log('')
}

// --- 1. fetch KanjiVG SVGs for everything (skip existing) ---
await mkdir(kvgDir, { recursive: true })
const existing = new Set(await readdir(kvgDir))
let svgOk = 0
const svgMiss = []
await pooled(all, async (ch) => {
  const file = `${codepointHex(ch)}.svg`
  if (existing.has(file)) { svgOk++; return }
  try {
    const res = await fetch(`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${file}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await writeFile(join(kvgDir, file), await res.text(), 'utf8')
    svgOk++
  } catch (e) {
    svgMiss.push(`${ch} (${e.message})`)
  }
})
console.log(`KanjiVG: ${svgOk}/${all.length} present${svgMiss.length ? `, ${svgMiss.length} missing: ${svgMiss.slice(0, 8).join(', ')}${svgMiss.length > 8 ? '…' : ''}` : ''}`)

// --- 2. fetch dictionary data from kanjiapi.dev for non-curated kanji ---
const entries = {}
const dataMiss = []
await pooled(needData, async (ch) => {
  try {
    const res = await fetch(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(ch)}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const j = await res.json()
    const meanings = (j.meanings ?? []).slice(0, 5)
    if (meanings.length === 0) throw new Error('no meanings')
    const dedupe = (arr) => [...new Set(arr)]
    entries[ch] = {
      meanings,
      on: dedupe(j.on_readings ?? []),
      kun: dedupe((j.kun_readings ?? []).map((r) => r.replace(/[-.]/g, ''))),
      strokes: j.stroke_count ?? 0,
      jlpt: jlptOf.get(ch),
    }
  } catch (e) {
    dataMiss.push(`${ch} (${e.message})`)
  }
})
console.log(`Dictionary: ${Object.keys(entries).length}/${needData.length} fetched${dataMiss.length ? `, ${dataMiss.length} skipped: ${dataMiss.slice(0, 8).join(', ')}${dataMiss.length > 8 ? '…' : ''}` : ''}`)

// --- write kanji-base.ts (sorted for stable diffs) ---
const sorted = Object.keys(entries).sort()
const body = sorted
  .map((ch) => {
    const e = entries[ch]
    const jlpt = e.jlpt ? `, jlpt: '${e.jlpt}'` : ''
    return `  '${ch}': { meanings: ${JSON.stringify(e.meanings)}, on: ${JSON.stringify(e.on)}, kun: ${JSON.stringify(e.kun)}, strokes: ${e.strokes}${jlpt} },`
  })
  .join('\n')

const out = `// AUTO-GENERATED by scripts/build-kanji-base.mjs — do not edit by hand.
// Baseline dictionary data (meanings, readings, stroke counts, JLPT level) for
// every kanji in the content plus the full JLPT N5–N1 lists. Source:
// kanjiapi.dev (KANJIDIC2-derived). Run \`npm run build-kanji\` to regenerate.
import type { BaseKanji } from './types'

export const KANJI_BASE: Record<string, BaseKanji> = {
${body}
}
`
await writeFile(join(dataDir, 'kanji-base.ts'), out, 'utf8')
console.log(`Wrote src/data/kanji-base.ts with ${sorted.length} entries.`)
