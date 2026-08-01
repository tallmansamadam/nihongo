// Rewrites content that was authored in kana into its standard kanji spelling
// (私, 猫, 学校, 食べる …) so every word that HAS a kanji uses it. Auto-furigana
// still shows the reading over the kanji, so nothing is lost for beginners.
//
// Safety: we segment with kuromoji (word boundaries + part of speech), then
// replace WHOLE tokens (or whole runs of tokens) against a curated map. This
// avoids substring corruption (にほん must not become に本, はなし must not become
// 花し) and POS guards keep homophones apart (息 noun vs 行き verb).
//
//   node scripts/kanjify.mjs            # apply
//   node scripts/kanjify.mjs --check    # report changes, write nothing
import kuromoji from '@sglkc/kuromoji'
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const CHECK = process.argv.includes('--check')
const root = process.cwd()
const dicPath = join(root, 'public', 'dict')

// kana → kanji. `pos` (optional) requires the kuromoji token's part-of-speech
// to match, so ambiguous readings only convert in the right role. Longer keys
// win (so にほんご beats ほん). Verb/adjective entries use the conjugated stem as
// it appears in text, guarded by pos so nouns that share the sound are left be.
const MAP = [
  // pronouns / people
  ['わたしたち', '私たち'], ['わたし', '私', '名詞'], ['かれら', '彼ら'], ['かのじょ', '彼女', '名詞'],
  ['かれ', '彼', '名詞'], ['ともだち', '友達'], ['こども', '子供'], ['おとな', '大人'],
  // compounds first (guard boundaries)
  ['にほんご', '日本語'], ['にほん', '日本'], ['あさごはん', '朝ご飯'], ['ばんごはん', '晩ご飯'],
  ['ごはん', 'ご飯'], ['きょうしつ', '教室'], ['としょかん', '図書館'],
  // family
  ['おかあさん', 'お母さん'], ['おとうさん', 'お父さん'], ['かあさん', '母さん'], ['とうさん', '父さん'],
  ['はは', '母'], ['ちち', '父'], ['あに', '兄'], ['あね', '姉'], ['おとうと', '弟'],
  ['いもうと', '妹'], ['かぞく', '家族'], ['おばあさん', 'おばあさん'],
  // animals / nature
  ['ねこ', '猫'], ['いぬ', '犬'], ['さかな', '魚'], ['とり', '鳥', '名詞'], ['うま', '馬'],
  ['はな', '花', '名詞'], ['やま', '山', '名詞'], ['かわ', '川', '名詞'], ['うみ', '海'],
  ['そら', '空', '名詞'], ['ほし', '星'], ['つき', '月', '名詞'], ['ゆき', '雪', '名詞'],
  ['みず', '水'], ['き', '木', '名詞'],
  // everyday nouns
  ['でんしゃ', '電車'], ['くるま', '車'], ['がっこう', '学校'], ['せんせい', '先生'],
  ['がくせい', '学生'], ['いえ', '家'], ['へや', '部屋'], ['みせ', '店', '名詞'],
  ['まち', '町'], ['みち', '道'], ['えき', '駅'], ['じかん', '時間'], ['なまえ', '名前'],
  ['てがみ', '手紙'], ['しゃしん', '写真'], ['おんがく', '音楽'], ['えいが', '映画'],
  ['りょうり', '料理'], ['やさい', '野菜'], ['くだもの', '果物'], ['ほん', '本', '名詞'],
  ['はなし', '話', '名詞'],
  // time
  ['きょう', '今日'], ['あした', '明日'], ['きのう', '昨日'], ['まいにち', '毎日'],
  ['まいあさ', '毎朝'], ['まいばん', '毎晩'], ['いま', '今', '名詞'], ['あさ', '朝', '名詞'],
  ['よる', '夜', '名詞'], ['ひる', '昼'], ['しゅうまつ', '週末'], ['ごぜん', '午前'], ['ごご', '午後'],
  // verbs (guard: 動詞) — conjugated stems as they appear
  ['たべ', '食べ', '動詞'], ['のみ', '飲み', '動詞'], ['のん', '飲ん', '動詞'],
  ['いき', '行き', '動詞'], ['いく', '行く', '動詞'], ['いっ', '行っ', '動詞'],
  ['よみ', '読み', '動詞'], ['よん', '読ん', '動詞'], ['よむ', '読む', '動詞'],
  ['かき', '書き', '動詞'], ['かく', '書く', '動詞'], ['み', '見', '動詞'],
  ['ねむ', '眠', '動詞'], ['はしり', '走り', '動詞'], ['はしっ', '走っ', '動詞'],
  ['あるき', '歩き', '動詞'], ['あるい', '歩い', '動詞'],
  // adjectives (whole word)
  ['おおきい', '大きい'], ['ちいさい', '小さい'], ['たかい', '高い'], ['やすい', '安い'],
  ['ながい', '長い'], ['みじかい', '短い'], ['あたらしい', '新しい'], ['ふるい', '古い'],
  ['たのしい', '楽しい'], ['さむい', '寒い'], ['しろい', '白い'], ['くろい', '黒い'],
  ['あかい', '赤い'], ['あおい', '青い'], ['おおきな', '大きな'], ['ちいさな', '小さな'],
  // seasons (guard 名詞: 春↔貼る, 秋↔飽き are verbs)
  ['ふゆ', '冬'], ['なつ', '夏', '名詞'], ['はる', '春', '名詞'], ['あき', '秋', '名詞'],
  // common compound nouns (unambiguous)
  ['てんき', '天気'], ['くうき', '空気'], ['しごと', '仕事'], ['かいしゃ', '会社'],
  ['びょういん', '病院'], ['くすり', '薬'], ['おかね', 'お金'], ['せかい', '世界'],
  ['からだ', '体'], ['あたま', '頭'], ['かお', '顔'], ['こえ', '声', '名詞'],
  ['いろ', '色', '名詞'], ['ふゆやすみ', '冬休み'], ['なつやすみ', '夏休み'],
  // more verbs (guard 動詞 自立). Note: 買う/書く/描く all share euphonic stems
  // (かい/かっ) that POS can't separate, so those are deliberately excluded.
  ['つくり', '作り', '動詞'], ['つくっ', '作っ', '動詞'], ['つくる', '作る', '動詞'],
].map(([kana, kanji, pos]) => ({ kana, kanji, pos }))

MAP.sort((a, b) => b.kana.length - a.kana.length)
const maxRun = 4 // max tokens to try concatenating for one map entry

function buildTokenizer() {
  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath }).build((err, t) => (err ? reject(err) : resolve(t)))
  })
}

let converted = 0
const samples = []

function kanjify(tok, text) {
  if (!text || !/[ぁ-ん]/.test(text)) return text
  const tokens = tok.tokenize(text)
  let out = ''
  let i = 0
  while (i < tokens.length) {
    let hit = null
    // try longest run of tokens that concatenates to a map key
    for (let run = Math.min(maxRun, tokens.length - i); run >= 1 && !hit; run--) {
      const surface = tokens.slice(i, i + run).map((t) => t.surface_form).join('')
      const entry = MAP.find((m) => m.kana === surface)
      if (!entry) continue
      // POS guard: require the (single) token's POS to match when specified
      if (entry.pos && run > 1) continue // pos-guarded entries only match single tokens
      if (entry.pos && run === 1) {
        if (tokens[i].pos !== entry.pos) continue
        // Only convert INDEPENDENT verbs (自立); this skips auxiliaries written
        // in kana by convention — 〜ていく, 〜てみる, 〜てくる, 〜ておく …
        if (entry.pos === '動詞' && tokens[i].pos_detail_1 !== '自立') continue
      }
      hit = { entry, run }
    }
    if (hit) {
      out += hit.entry.kanji
      i += hit.run
      converted++
    } else {
      out += tokens[i].surface_form
      i++
    }
  }
  return out
}

const tok = await buildTokenizer()

// --- content/readings/*.json (paragraphs) ---
const readingsDir = join(root, 'content', 'readings')
for (const f of await readdir(readingsDir)) {
  if (!f.endsWith('.json')) continue
  const path = join(readingsDir, f)
  const r = JSON.parse(await readFile(path, 'utf8'))
  if (!Array.isArray(r.paragraphs)) continue
  const before = r.paragraphs.join('')
  r.paragraphs = r.paragraphs.map((p) => kanjify(tok, p))
  const after = r.paragraphs.join('')
  if (before !== after) {
    if (samples.length < 6) samples.push(`${f}:\n  - ${before.split('')[0].slice(0, 60)}\n  + ${after.split('')[0].slice(0, 60)}`)
    if (!CHECK) await writeFile(path, JSON.stringify(r, null, 2) + '\n', 'utf8')
  }
}

// --- src/data/readings.ts: kanjify ONLY the `paragraphs` arrays (never
// titleReading, vocab readings, or the English `paragraphsEn`). ---
const rtsPath = join(root, 'src', 'data', 'readings.ts')
let rts = await readFile(rtsPath, 'utf8')
let rtsChanges = 0
const rtsSamples = []
rts = rts.replace(/paragraphs: \[([\s\S]*?)\n(\s*)\],/g, (_m, body, indent) => {
  const nb = body.replace(/'([^']*)'/g, (lit, s) => {
    if (!/[ぁ-ん]/.test(s)) return lit
    const k = kanjify(tok, s)
    if (k !== s) {
      rtsChanges++
      if (rtsSamples.length < 8) rtsSamples.push(`  - ${s}\n  + ${k}`)
    }
    return "'" + k + "'"
  })
  return `paragraphs: [${nb}\n${indent}],`
})
if (!CHECK && rtsChanges) await writeFile(rtsPath, rts, 'utf8')

console.log(`${CHECK ? '[check] would convert' : 'converted'} ${converted} word occurrences in JSON readings.`)
console.log(`readings.ts: ${rtsChanges} paragraph(s) changed:`)
console.log(rtsSamples.join('\n'))
