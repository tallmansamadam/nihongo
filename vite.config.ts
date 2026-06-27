import { defineConfig, type Connect } from 'vite'
import react from '@vitejs/plugin-react'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, normalize } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// The kuromoji dictionary ships as gzipped *.dat.gz files. Vite's static server
// would send them with `Content-Encoding: gzip`, which makes the browser
// transparently decompress them — and then kuromoji tries to gunzip the already
// raw bytes and hangs. Serve them ourselves with no content-encoding so the
// gzipped bytes reach kuromoji intact.
function serveDictRaw() {
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    const url = req.url?.split('?')[0] ?? ''
    if (!url.startsWith('/dict/') || !url.endsWith('.gz')) return next()
    const file = normalize(join(__dirname, 'public', decodeURIComponent(url)))
    readFile(file)
      .then((data) => {
        res.setHeader('Content-Type', 'application/octet-stream')
        res.setHeader('Cache-Control', 'max-age=31536000, immutable')
        res.end(data)
      })
      .catch(() => next())
  }
  return {
    name: 'serve-dict-raw',
    // Register directly (not returned) so it runs before Vite's static handler.
    configureServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(handler)
    },
  }
}

export default defineConfig({
  plugins: [react(), serveDictRaw()],
})
