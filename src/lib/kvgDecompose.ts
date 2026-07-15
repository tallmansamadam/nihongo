import { codepointHex } from '../data/kanji'

// Every KanjiVG stroke-order SVG embeds the kanji's recursive component tree as
// kvg:element attributes on nested <g> groups. We already ship/fetch these SVGs
// for stroke order, so the same files give us a radical/grapheme breakdown for
// EVERY kanji — not just the hand-curated set.

export interface DecompNode {
  char: string
  children: DecompNode[]
}

// element char -> its immediate component chars (learned from any parsed SVG)
const registry = new Map<string, string[]>()
// codepoints already fetched (or failed), to avoid refetch loops
const attempted = new Set<string>()

const sources = (hex: string) => [
  `${import.meta.env.BASE_URL}kanjivg/${hex}.svg`,
  `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/${hex}.svg`,
]

/** Collect element-bearing child groups, looking through transparent groups and
 *  merging split parts (kvg:part="2"+ of an element already seen). */
function collectChildren(g: Element): DecompNode[] {
  const out: DecompNode[] = []
  for (const child of [...g.children]) {
    if (child.tagName !== 'g') continue
    const el = child.getAttribute('kvg:element')
    if (el) {
      const part = child.getAttribute('kvg:part')
      if (part && part !== '1') {
        const existing = out.find((c) => c.char === el)
        if (existing) {
          existing.children.push(...collectChildren(child))
          continue
        }
      }
      out.push({ char: el, children: collectChildren(child) })
    } else {
      // group without an element (e.g. purely positional) — look through it
      out.push(...collectChildren(child))
    }
  }
  return out
}

function registerAll(node: DecompNode) {
  const existing = registry.get(node.char)
  if (!existing || existing.length === 0) {
    registry.set(node.char, node.children.map((c) => c.char))
  }
  for (const c of node.children) registerAll(c)
}

/** Immediate components of `char`, or null if unknown. Uses anything already
 *  learned from previously parsed SVGs before fetching the char's own file. */
export async function decompose(char: string): Promise<string[] | null> {
  const known = registry.get(char)
  if (known && known.length > 0) return known

  const hex = codepointHex(char)
  if (!attempted.has(hex)) {
    attempted.add(hex)
    for (const url of sources(hex)) {
      try {
        const r = await fetch(url)
        if (!r.ok) continue
        const doc = new DOMParser().parseFromString(await r.text(), 'image/svg+xml')
        const root = [...doc.querySelectorAll('g')].find((g) => g.getAttribute('kvg:element'))
        if (!root) break
        const tree: DecompNode = {
          char: root.getAttribute('kvg:element')!,
          children: collectChildren(root),
        }
        registerAll(tree)
        break
      } catch {
        /* try next source */
      }
    }
  }
  return registry.get(char) ?? null
}
