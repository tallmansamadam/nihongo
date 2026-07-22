// Builds the bundled kanji dictionary + stroke SVGs for the ENTIRE kanji
// library: every kanji in KANJIDIC2 (~13,100, via kanjiapi.dev /v1/kanji/all),
// not just the JLPT subset. For each kanji it stores meanings, on/kun readings,
// stroke count and JLPT level, and downloads the KanjiVG stroke-order SVG.
//
// The dictionary fetch is resumable: results are cached in
// scripts/.kanji-dict-cache.json so a re-run only fetches what's missing.
//
// Output: src/data/kanji-base.ts + public/kanjivg/*.svg
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dataDir = join(root, 'src', 'data')
const kvgDir = join(root, 'public', 'kanjivg')
const CACHE = join(__dirname, '.kanji-dict-cache.json')

const KANJI_RE = /[一-龯㐀-䶿]/g
const codepointHex = (ch) => ch.codePointAt(0).toString(16).padStart(5, '0')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Fetch with retry + backoff so 13k requests survive transient rate limits.
async function fetchRetry(url, tries = 5) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return res
      if (res.status === 404) return null // genuinely absent
      // 429 / 5xx — back off and retry
    } catch {
      /* network blip — retry */
    }
    await sleep(300 * (i + 1) + Math.random() * 200)
  }
  return null
}

async function pooled(items, concurrency, worker) {
  let i = 0
  let done = 0
  const runners = Array.from({ length: concurrency }, async () => {
    while (i < items.length) {
      const item = items[i++]
      await worker(item)
      if (++done % 250 === 0) process.stdout.write(`\r  ${done}/${items.length}   `)
    }
  })
  await Promise.all(runners)
  process.stdout.write(`\r  ${done}/${items.length}   \n`)
}

// --- the full kanji list ---
console.log('Fetching full KANJIDIC2 kanji list…')
const allList = await (await fetchRetry('https://kanjiapi.dev/v1/kanji/all')).json()
const used = new Set(allList)
console.log(`KANJIDIC2: ${allList.length} kanji.`)

// union with kanji actually appearing in bundled content (belt & suspenders)
const contentFiles = ['stories.ts', 'readings.ts', 'songs.ts', 'kanji.ts', 'components.ts']
for (const f of contentFiles) {
  const text = await readFile(join(dataDir, f), 'utf8')
  for (const m of text.matchAll(KANJI_RE)) used.add(m[0])
}
const libDir = join(root, 'content', 'readings')
for (const f of await readdir(libDir)) {
  if (!f.endsWith('.json')) continue
  const text = await readFile(join(libDir, f), 'utf8')
  for (const m of text.matchAll(KANJI_RE)) used.add(m[0])
}

// --- JLPT tagging (new-JLPT lists) ---
const jlptOf = new Map()
for (const n of [5, 4, 3, 2, 1]) {
  const res = await fetchRetry(`https://kanjiapi.dev/v1/kanji/jlpt-${n}`)
  if (!res) continue
  for (const ch of await res.json()) if (!jlptOf.has(ch)) jlptOf.set(ch, `N${n}`)
}

// curated chars already have full entries in kanji.ts
const kanjiSrc = await readFile(join(dataDir, 'kanji.ts'), 'utf8')
const curated = new Set([...kanjiSrc.matchAll(/char: '([^']+)',\s*meanings:/g)].map((m) => m[1]))

const all = [...used]
const needChars = all.filter((ch) => !curated.has(ch))
console.log(`${all.length} unique kanji; ${curated.size} curated; ${needChars.length} need base data.`)

// --- resumable dictionary cache ---
let cache = {}
try {
  cache = JSON.parse(await readFile(CACHE, 'utf8'))
  console.log(`Resuming: ${Object.keys(cache).length} entries already cached.`)
} catch {
  /* fresh run */
}

const toFetch = needChars.filter((ch) => !cache[ch])
console.log(`Fetching dictionary data for ${toFetch.length} kanji…`)
let saveCounter = 0
const dedupe = (a) => [...new Set(a)]
await pooled(toFetch, 10, async (ch) => {
  const res = await fetchRetry(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(ch)}`)
  if (!res) return
  try {
    const j = await res.json()
    const meanings = (j.meanings ?? []).slice(0, 5)
    if (meanings.length === 0) return
    cache[ch] = {
      meanings,
      on: dedupe(j.on_readings ?? []),
      kun: dedupe((j.kun_readings ?? []).map((r) => r.replace(/[-.]/g, ''))),
      strokes: j.stroke_count ?? 0,
    }
    if (++saveCounter % 500 === 0) await writeFile(CACHE, JSON.stringify(cache), 'utf8')
  } catch {
    /* skip */
  }
})
await writeFile(CACHE, JSON.stringify(cache), 'utf8')
console.log(`Dictionary cache: ${Object.keys(cache).length} entries.`)

// --- KanjiVG SVGs for everything (skip existing; CDN primary, raw fallback) ---
await mkdir(kvgDir, { recursive: true })
const existing = new Set(await readdir(kvgDir))
const needSvg = all.filter((ch) => !existing.has(`${codepointHex(ch)}.svg`))
console.log(`Downloading ${needSvg.length} stroke SVGs…`)
let svgOk = existing.size
await pooled(needSvg, 20, async (ch) => {
  const file = `${codepointHex(ch)}.svg`
  for (const url of [
    `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/${file}`,
    `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${file}`,
  ]) {
    const res = await fetchRetry(url, 3)
    if (res) {
      await writeFile(join(kvgDir, file), await res.text(), 'utf8')
      svgOk++
      return
    }
  }
})
console.log(`KanjiVG: ${svgOk} SVGs present.`)

// --- write kanji-base.ts (sorted; jlpt tag where applicable) ---
const outChars = Object.keys(cache).filter((ch) => !curated.has(ch)).sort()
const body = outChars
  .map((ch) => {
    const e = cache[ch]
    const jlpt = jlptOf.has(ch) ? `, jlpt: '${jlptOf.get(ch)}'` : ''
    return `  '${ch}': { meanings: ${JSON.stringify(e.meanings)}, on: ${JSON.stringify(e.on)}, kun: ${JSON.stringify(e.kun)}, strokes: ${e.strokes}${jlpt} },`
  })
  .join('\n')

const out = `// AUTO-GENERATED by scripts/build-kanji-base.mjs — do not edit by hand.
// Baseline dictionary data (meanings, readings, stroke counts, JLPT level) for
// the ENTIRE KANJIDIC2 kanji set (~13k), so every kanji works fully offline.
// Source: kanjiapi.dev. Run \`npm run build-kanji\` to regenerate.
import type { BaseKanji } from './types'

export const KANJI_BASE: Record<string, BaseKanji> = {
${body}
}
`
await writeFile(join(dataDir, 'kanji-base.ts'), out, 'utf8')
console.log(`Wrote src/data/kanji-base.ts with ${outChars.length} entries.`)
