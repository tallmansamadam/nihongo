import { KANJI } from './kanji'
import type { Component } from './types'

// A small dictionary of sub-kanji graphemes (radicals and parts) so the popover
// can keep drilling: kanji → grapheme → that grapheme's graphemes → …
// Full kanji are resolved from KANJI first; these fill in the non-kanji parts.
interface ComponentEntry {
  meaning: string
  components?: Component[]
}

export const COMPONENTS: Record<string, ComponentEntry> = {
  口: { meaning: 'mouth, opening', components: [{ char: '冂', meaning: 'an enclosure' }, { char: '一', meaning: 'the base line' }] },
  言: { meaning: 'words, speech', components: [{ char: '亠', meaning: 'a mouth opening' }, { char: '二', meaning: 'breaths of sound' }, { char: '口', meaning: 'mouth' }] },
  土: { meaning: 'earth, soil', components: [{ char: '十', meaning: 'a sprout' }, { char: '一', meaning: 'the ground' }] },
  十: { meaning: 'ten; a crossroads' },
  寸: { meaning: 'a hand / small measure', components: [{ char: '十', meaning: 'a measure' }, { char: '丶', meaning: 'a point on the wrist' }] },
  寺: { meaning: 'temple', components: [{ char: '土', meaning: 'earth' }, { char: '寸', meaning: 'hand / measure' }] },
  軍: { meaning: 'army', components: [{ char: '冖', meaning: 'a cover' }, { char: '車', meaning: 'chariot' }] },
  戻: { meaning: 'return', components: [{ char: '戸', meaning: 'door' }, { char: '大', meaning: 'big' }] },
  戸: { meaning: 'door' },
  非: { meaning: 'not, wrong; opposing wings' },
  申: { meaning: 'to speak out; a lightning bolt' },
  吏: { meaning: 'an official' },
  頁: { meaning: 'head, page' },
  彦: { meaning: 'a handsome man' },
  憂: { meaning: 'grief, worry' },
  戔: { meaning: 'two small spears' },
  歹: { meaning: 'bare bone, death' },
  叔: { meaning: 'uncle; few' },
  匈: { meaning: 'enclosed clamor' },
  几: { meaning: 'a table / sail' },
  虫: { meaning: 'insect' },
  卩: { meaning: 'a kneeling person' },
  亼: { meaning: 'a gathering roof' },
  亠: { meaning: 'a lid / top' },
  二: { meaning: 'two' },
  五: { meaning: 'five' },
  冂: { meaning: 'an enclosure, borders' },
  冖: { meaning: 'a cover, crown' },
  宀: { meaning: 'a roof, house' },
  广: { meaning: 'a lean-to roof / building' },
  艹: { meaning: 'grass, plants' },
  罒: { meaning: 'an eye / net' },
  夕: { meaning: 'evening, dusk' },
  尹: { meaning: 'a ruling hand' },
  '⺬': { meaning: 'altar, the divine' },
  扌: { meaning: 'hand (radical)' },
  氵: { meaning: 'water (radical)' },
  亻: { meaning: 'person (radical)' },
  '⺼': { meaning: 'flesh, body (radical)' },
  '⺮': { meaning: 'bamboo (radical)' },
  夭: { meaning: 'a person bending' },
  丿: { meaning: 'a sweeping stroke' },
  丶: { meaning: 'a dot / spark' },
  一: { meaning: 'one; a single line' },
  乂: { meaning: 'a cutting / an axe' },
  八: { meaning: 'eight; to split apart' },
  儿: { meaning: 'legs, a person' },
  禾: { meaning: 'a grain stalk' },
  厶: { meaning: 'private, self' },
  又: { meaning: 'a right hand' },
  目: { meaning: 'eye' },
}

export interface GlyphInfo {
  char: string
  isKanji: boolean
  meaning: string
  meanings?: string[]
  on?: string[]
  kun?: string[]
  strokes?: number
  jlpt?: string
  radical?: Component
  components: Component[]
  mnemonic?: string
}

/** Resolve any glyph: full kanji from KANJI, else a known component, else a
 *  leaf using the meaning passed down from the parent chip. */
export function getGlyph(char: string, fallbackMeaning?: string): GlyphInfo {
  const k = KANJI[char]
  if (k) {
    return {
      char,
      isKanji: true,
      meaning: k.meanings[0],
      meanings: k.meanings,
      on: k.on,
      kun: k.kun,
      strokes: k.strokes,
      jlpt: k.jlpt,
      radical: k.radical,
      components: k.components,
      mnemonic: k.mnemonic,
    }
  }
  const c = COMPONENTS[char]
  if (c) {
    return { char, isKanji: false, meaning: c.meaning, components: c.components ?? [] }
  }
  return { char, isKanji: false, meaning: fallbackMeaning ?? '—', components: [] }
}
