// Copies the kuromoji IPADIC dictionary (gzipped .dat.gz files) into public/dict
// so Vite serves them statically and the in-browser tokenizer can fetch them.
import { mkdir, copyFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const src = join(root, 'node_modules', '@sglkc', 'kuromoji', 'dict')
const dest = join(root, 'public', 'dict')

await mkdir(dest, { recursive: true })
const files = await readdir(src)
let n = 0
for (const f of files) {
  await copyFile(join(src, f), join(dest, f))
  n++
}
console.log(`Copied ${n} dictionary files to public/dict/`)
