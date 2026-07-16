import type { Reading } from '../data/types'

// Remote content library. raw.githubusercontent.com is tried first so newly
// pushed content shows up immediately; the jsDelivr CDN covers rate-limiting;
// and a snapshot bundled into the app at build time (public/content, written by
// scripts/sync-content.mjs) guarantees the Library works offline and is never
// empty even when the network is unavailable.
const SOURCES = [
  'https://raw.githubusercontent.com/tallmansamadam/nihongo/main/content',
  'https://cdn.jsdelivr.net/gh/tallmansamadam/nihongo@main/content',
  `${import.meta.env.BASE_URL}content`,
]

export interface CatalogEntry {
  id: string
  title: string
  titleReading?: string
  titleEn: string
  level: 'N5' | 'N4' | 'N3'
  category: 'story' | 'article' | 'folktale'
  summary: string
}

const CATALOG_CACHE = 'nihongo:catalog'
const readingCacheKey = (id: string) => `nihongo:remote-reading:${id}`

async function fetchJson(path: string): Promise<unknown> {
  let lastErr: unknown = new Error('no sources')
  for (const base of SOURCES) {
    try {
      const res = await fetch(`${base}/${path}`)
      if (res.ok) return await res.json()
      lastErr = new Error(`HTTP ${res.status}`)
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}

export async function fetchCatalog(): Promise<CatalogEntry[]> {
  const data = (await fetchJson('catalog.json')) as { readings: CatalogEntry[] }
  try {
    localStorage.setItem(CATALOG_CACHE, JSON.stringify(data))
  } catch {
    /* ignore */
  }
  return data.readings
}

export function cachedCatalog(): CatalogEntry[] | null {
  try {
    const raw = localStorage.getItem(CATALOG_CACHE)
    if (raw) return (JSON.parse(raw) as { readings: CatalogEntry[] }).readings
  } catch {
    /* ignore */
  }
  return null
}

export async function fetchReading(id: string): Promise<Reading> {
  const data = (await fetchJson(`readings/${id}.json`)) as Reading
  try {
    localStorage.setItem(readingCacheKey(id), JSON.stringify(data))
  } catch {
    /* ignore */
  }
  return data
}

export function cachedReading(id: string): Reading | null {
  try {
    const raw = localStorage.getItem(readingCacheKey(id))
    if (raw) return JSON.parse(raw) as Reading
  } catch {
    /* ignore */
  }
  return null
}

export function isDownloaded(id: string): boolean {
  try {
    return localStorage.getItem(readingCacheKey(id)) != null
  } catch {
    return false
  }
}
