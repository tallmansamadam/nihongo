// Downloads KanjiVG stroke-order SVGs for every kanji in src/data/kanji.ts
// into public/kanjivg/. KanjiVG is CC BY-SA 3.0 (Ulrich Apel).
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'public', 'kanjivg')

const BASE = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji'

function codepointHex(char) {
  return char.codePointAt(0).toString(16).padStart(5, '0')
}

// Pull the kanji characters out of the data file without importing TS.
const src = await readFile(join(root, 'src', 'data', 'kanji.ts'), 'utf8')
const chars = [...src.matchAll(/char: '([^']+)',\s*meanings:/g)].map((m) => m[1])
const unique = [...new Set(chars)]

await mkdir(outDir, { recursive: true })
console.log(`Fetching ${unique.length} kanji SVGs...`)

let ok = 0
let failed = []
for (const ch of unique) {
  const hex = codepointHex(ch)
  const dest = join(outDir, `${hex}.svg`)
  if (existsSync(dest)) {
    ok++
    continue
  }
  try {
    const res = await fetch(`${BASE}/${hex}.svg`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const svg = await res.text()
    await writeFile(dest, svg, 'utf8')
    ok++
    process.stdout.write('.')
  } catch (e) {
    failed.push(`${ch} (${hex}): ${e.message}`)
  }
}

console.log(`\nDone. ${ok}/${unique.length} saved to public/kanjivg/`)
if (failed.length) {
  console.log('Failed:')
  for (const f of failed) console.log('  ' + f)
}
