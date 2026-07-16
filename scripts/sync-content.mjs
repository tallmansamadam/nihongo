// Copies content/ into public/content/ so every build ships a snapshot of the
// library. The app still fetches the remote catalog first (so content grows
// without rebuilding); the bundled snapshot is the offline / network-failure
// fallback that guarantees the Library is never empty.
import { cp, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
await mkdir(join(root, 'public', 'content'), { recursive: true })
await cp(join(root, 'content'), join(root, 'public', 'content'), { recursive: true })
console.log('Synced content/ -> public/content/')
