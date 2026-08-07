// Stages everything the camera OCR needs to run fully offline:
//   public/ocr/worker.min.js          — tesseract.js worker
//   public/ocr/tesseract-core-*.wasm  — the OCR engine (wasm)
//   public/tessdata/<lang>.traineddata.gz — language models
// The traineddata comes from tessdata_fast (small, accurate enough for
// photographs of signs and printed text). Downloads are skipped when the file
// is already present, so re-running is cheap.
import { mkdir, copyFile, writeFile, access, readdir, stat } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ocrDir = join(root, 'public', 'ocr')
const dataDir = join(root, 'public', 'tessdata')

// jpn      — Japanese (horizontal)
// jpn_vert — Japanese written vertically, common on signage/menus
// chi_sim  — Simplified Chinese
// chi_tra  — Traditional Chinese (closer to Japanese kanji forms)
const LANGS = ['jpn', 'jpn_vert', 'chi_sim', 'chi_tra']
const BASE = 'https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main'

const exists = async (p) => {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

await mkdir(ocrDir, { recursive: true })
await mkdir(dataDir, { recursive: true })

// --- worker + wasm core from node_modules ---
const copies = [
  ['node_modules/tesseract.js/dist/worker.min.js', 'worker.min.js'],
  // Baseline LSTM core: the .wasm.js embeds the wasm, and this variant runs on
  // every engine (the simd/relaxedsimd builds are faster but not universal, and
  // shipping one variant keeps ~7MB out of the app).
  ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js', 'tesseract-core-lstm.wasm.js'],
]
for (const [from, to] of copies) {
  const src = join(root, from)
  if (await exists(src)) {
    await copyFile(src, join(ocrDir, to))
  } else {
    console.warn(`! missing ${from} — OCR may fall back to CDN`)
  }
}

// --- language models ---
for (const lang of LANGS) {
  const out = join(dataDir, `${lang}.traineddata.gz`)
  if (await exists(out)) continue
  const url = `${BASE}/${lang}.traineddata`
  process.stdout.write(`  ${lang} … `)
  const res = await fetch(url)
  if (!res.ok) {
    console.log(`FAILED (HTTP ${res.status})`)
    continue
  }
  const buf = Buffer.from(await res.arrayBuffer())
  // tesseract.js accepts plain .traineddata when gzip: false, so store raw
  await writeFile(join(dataDir, `${lang}.traineddata`), buf)
  console.log(`${(buf.length / 1048576).toFixed(1)} MB`)
}

const files = await readdir(dataDir)
let total = 0
for (const f of files) total += (await stat(join(dataDir, f))).size
console.log(`OCR assets ready: ${files.length} language models, ${(total / 1048576).toFixed(1)} MB total.`)
