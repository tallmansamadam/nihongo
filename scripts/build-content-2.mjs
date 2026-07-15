// Second batch of remote-library readings (original prose). Writes each to
// content/readings/<id>.json and regenerates content/catalog.json.
//   node scripts/build-content-2.mjs
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const contentDir = join(root, 'content')
const readingsDir = join(contentDir, 'readings')

const READINGS = [
  {
    id: 'mount-fuji', title: '富士山', titleReading: 'ふじさん', titleEn: 'Mount Fuji',
    level: 'N4', category: 'article',
    summary: 'Japan’s tallest and most beloved mountain.',
    paragraphs: [
      '富士山は日本で一番高い山です。高さは3776メートルあります。',
      '昔から、富士山は特別な山として大切にされてきました。多くの絵や歌に登場します。',
      '夏には、たくさんの人が頂上まで登ります。頂上から見る朝日は「ご来光」と呼ばれ、一生に一度は見たいものだと言われています。',
    ],
    vocab: [
      { word: '高さ', reading: 'たかさ', meaning: 'height' },
      { word: '特別', reading: 'とくべつ', meaning: 'special' },
      { word: '登場', reading: 'とうじょう', meaning: 'appearance (in works)' },
      { word: '頂上', reading: 'ちょうじょう', meaning: 'summit' },
      { word: 'ご来光', reading: 'ごらいこう', meaning: 'sunrise seen from a mountaintop' },
    ],
    grammar: [{ point: '〜として', explanation: '"As / in the role of": 特別な山として = "as a special mountain".', example: '特別な山として大切にされています。', exampleEn: 'It is cherished as a special mountain.' }],
  },
  {
    id: 'ramen', title: 'ラーメンの話', titleReading: 'ラーメンのはなし', titleEn: 'All About Ramen',
    level: 'N4', category: 'article',
    summary: 'How a noodle soup became Japan’s favorite comfort food.',
    paragraphs: [
      'ラーメンは、今では日本を代表する食べ物の一つです。もともとは中国から来ましたが、日本で独自に発展しました。',
      'スープには色々な種類があります。しょうゆ、みそ、しお、とんこつが有名です。地方によって味がぜんぜん違います。',
      '人気の店の前には、長い行列ができます。寒い日に食べる熱いラーメンは最高です。',
    ],
    vocab: [
      { word: '代表', reading: 'だいひょう', meaning: 'representative' },
      { word: '独自', reading: 'どくじ', meaning: 'original, unique' },
      { word: '発展', reading: 'はってん', meaning: 'development' },
      { word: '地方', reading: 'ちほう', meaning: 'region' },
      { word: '行列', reading: 'ぎょうれつ', meaning: 'queue, line' },
    ],
    grammar: [{ point: '〜によって違う', explanation: '"Differs depending on": 地方によって味が違う.', example: '地方によって味が違います。', exampleEn: 'The flavor differs by region.' }],
  },
  {
    id: 'shrines-and-temples', title: '神社とお寺', titleReading: 'じんじゃとおてら', titleEn: 'Shrines and Temples',
    level: 'N3', category: 'article',
    summary: 'How to tell a Shintō shrine from a Buddhist temple.',
    paragraphs: [
      '日本には神社とお寺があります。似ているようで、実は違うものです。神社は神道、お寺は仏教の建物です。',
      '神社の入口には鳥居があります。お参りの時は、二回おじぎをして、二回手をたたきます。お寺では手をたたかず、静かに手を合わせます。',
      'お正月には多くの人が神社やお寺へ初詣に行きます。一年の幸せを祈る、大切な習慣です。',
    ],
    vocab: [
      { word: '神社', reading: 'じんじゃ', meaning: 'Shintō shrine' },
      { word: '仏教', reading: 'ぶっきょう', meaning: 'Buddhism' },
      { word: '鳥居', reading: 'とりい', meaning: 'torii gate' },
      { word: 'お参り', reading: 'おまいり', meaning: 'visit to worship' },
      { word: '初詣', reading: 'はつもうで', meaning: 'first shrine visit of the year' },
      { word: '祈る', reading: 'いのる', meaning: 'to pray' },
    ],
    grammar: [{ point: '〜ようで', explanation: '"Seems X, but…": 似ているようで、実は違う = "they seem alike, but actually differ".', example: '似ているようで、実は違います。', exampleEn: 'They look alike but are actually different.' }],
  },
  {
    id: 'japanese-school-life', title: '日本の学校生活', titleReading: 'にほんのがっこうせいかつ', titleEn: 'School Life in Japan',
    level: 'N4', category: 'article',
    summary: 'Uniforms, club activities, and cleaning time.',
    paragraphs: [
      '日本の中学校や高校では、たいてい制服を着ます。学校によってデザインが違います。',
      '授業が終わっても、生徒はすぐに帰りません。多くの生徒が部活動に参加します。野球、サッカー、吹奏楽、書道など、色々あります。',
      'また、日本の学校では生徒が自分たちで教室をそうじします。自分の使う場所を自分できれいにするという考え方です。',
    ],
    vocab: [
      { word: '制服', reading: 'せいふく', meaning: 'school uniform' },
      { word: '授業', reading: 'じゅぎょう', meaning: 'class, lesson' },
      { word: '生徒', reading: 'せいと', meaning: 'student (secondary school)' },
      { word: '部活動', reading: 'ぶかつどう', meaning: 'club activities' },
      { word: '考え方', reading: 'かんがえかた', meaning: 'way of thinking' },
    ],
    grammar: [{ point: '〜ても (even if/when)', explanation: '授業が終わっても = "even when class ends".', example: '授業が終わっても帰りません。', exampleEn: 'Even when class ends, they don’t go home.' }],
  },
  {
    id: 'hanami', title: '花見', titleReading: 'はなみ', titleEn: 'Cherry-Blossom Viewing',
    level: 'N5', category: 'article',
    summary: 'Japan’s springtime picnic under the cherry trees.',
    paragraphs: [
      '春になると、日本中でさくらがさきます。人々は公園に集まって、花を見ながら食べたり飲んだりします。これが「花見」です。',
      'さくらの花は一週間ぐらいでちってしまいます。だから、みんなその短い時間を大切にします。',
      '夜のさくらは「夜桜」と呼ばれ、昼とは違う美しさがあります。',
    ],
    vocab: [
      { word: '咲く', reading: 'さく', meaning: 'to bloom' },
      { word: '集まる', reading: 'あつまる', meaning: 'to gather' },
      { word: '散る', reading: 'ちる', meaning: 'to fall, scatter (petals)' },
      { word: '短い', reading: 'みじかい', meaning: 'short' },
      { word: '夜桜', reading: 'よざくら', meaning: 'cherry blossoms at night' },
    ],
    grammar: [{ point: '〜と (when)', explanation: '春になると = "when spring comes (it always happens that…)".', example: '春になると、さくらがさきます。', exampleEn: 'When spring comes, the cherries bloom.' }],
  },
  {
    id: 'sumo', title: '相撲', titleReading: 'すもう', titleEn: 'Sumo',
    level: 'N3', category: 'article',
    summary: 'Japan’s ancient national sport, in brief.',
    paragraphs: [
      '相撲は日本の国技と呼ばれる、とても古いスポーツです。丸い土俵の上で、二人の力士が戦います。',
      'ルールは簡単です。相手を土俵の外に出すか、足のうら以外を地面につけさせれば勝ちです。一つの取組は数秒で終わることも多いです。',
      '力士たちは「部屋」と呼ばれる場所で共同生活をしながら、毎日けいこをします。強い力士の中で最も位が高いのが「横綱」です。',
    ],
    vocab: [
      { word: '国技', reading: 'こくぎ', meaning: 'national sport' },
      { word: '土俵', reading: 'どひょう', meaning: 'sumo ring' },
      { word: '力士', reading: 'りきし', meaning: 'sumo wrestler' },
      { word: '取組', reading: 'とりくみ', meaning: 'a sumo bout' },
      { word: '横綱', reading: 'よこづな', meaning: 'yokozuna (grand champion)' },
    ],
    grammar: [{ point: '〜させれば', explanation: 'Causative + ば: つけさせれば勝ち = "if you make (their body) touch, you win".', example: '地面につけさせれば勝ちです。', exampleEn: 'If you make them touch the ground, you win.' }],
  },
  {
    id: 'origami', title: '折り紙', titleReading: 'おりがみ', titleEn: 'Origami',
    level: 'N5', category: 'article',
    summary: 'The paper-folding art anyone can start today.',
    paragraphs: [
      '折り紙は、紙を折って形を作る日本の遊びです。はさみものりも使いません。',
      '一番有名なのは「つる」です。つるは長生きのシンボルです。',
      '千羽のつるを折ると、願いがかなうと言われています。これを「千羽鶴」と言います。',
    ],
    vocab: [
      { word: '折る', reading: 'おる', meaning: 'to fold' },
      { word: '形', reading: 'かたち', meaning: 'shape' },
      { word: '鶴', reading: 'つる', meaning: 'crane' },
      { word: '長生き', reading: 'ながいき', meaning: 'long life' },
      { word: '願い', reading: 'ねがい', meaning: 'wish' },
    ],
    grammar: [{ point: '〜と言われている', explanation: '"It is said that…": 願いがかなうと言われています.', example: '願いがかなうと言われています。', exampleEn: 'It is said your wish will come true.' }],
  },
  {
    id: 'kotatsu', title: 'こたつ', titleReading: 'こたつ', titleEn: 'The Kotatsu',
    level: 'N4', category: 'article',
    summary: 'Japan’s heated table — winter’s coziest trap.',
    paragraphs: [
      'こたつは、ヒーターがついた低いテーブルです。テーブルの上にふとんをかけて、その中に足を入れて温まります。',
      '冬、家族はこたつのまわりに集まります。みかんを食べながらテレビを見るのが、日本の冬の風景です。',
      'こたつは温度がちょうどよくて、一度入るとなかなか出られません。「こたつから出たくない」は、冬の合言葉です。',
    ],
    vocab: [
      { word: '布団', reading: 'ふとん', meaning: 'futon, quilt' },
      { word: '温まる', reading: 'あたたまる', meaning: 'to warm up' },
      { word: '周り', reading: 'まわり', meaning: 'around, surroundings' },
      { word: '風景', reading: 'ふうけい', meaning: 'scene, scenery' },
      { word: '合言葉', reading: 'あいことば', meaning: 'catchphrase, watchword' },
    ],
    grammar: [{ point: '〜と、なかなか〜ない', explanation: '一度入ると、なかなか出られない = "once you get in, it’s hard to get out".', example: '一度入るとなかなか出られません。', exampleEn: 'Once you’re in, you can hardly get out.' }],
  },
  {
    id: 'vending-machines', title: '自動販売機', titleReading: 'じどうはんばいき', titleEn: 'Vending Machines',
    level: 'N4', category: 'article',
    summary: 'Why Japan has a vending machine on every corner.',
    paragraphs: [
      '日本には自動販売機がとても多く、全国に約400万台あると言われています。',
      '飲み物の自動販売機が一番多いです。冬になると、同じ機械で温かい飲み物と冷たい飲み物の両方が買えます。',
      '町が安全なので、夜でも自動販売機は壊されません。これは世界的にめずらしいことだそうです。',
    ],
    vocab: [
      { word: '自動販売機', reading: 'じどうはんばいき', meaning: 'vending machine' },
      { word: '全国', reading: 'ぜんこく', meaning: 'the whole country' },
      { word: '両方', reading: 'りょうほう', meaning: 'both' },
      { word: '安全', reading: 'あんぜん', meaning: 'safety' },
      { word: '珍しい', reading: 'めずらしい', meaning: 'rare, unusual' },
    ],
    grammar: [{ point: '〜そうだ (hearsay)', explanation: '"I hear that / they say": めずらしいことだそうです.', example: '世界的にめずらしいそうです。', exampleEn: 'I hear it’s rare worldwide.' }],
  },
  {
    id: 'train-manners', title: '電車のマナー', titleReading: 'でんしゃのマナー', titleEn: 'Train Manners',
    level: 'N3', category: 'article',
    summary: 'The unwritten rules of riding Japanese trains.',
    paragraphs: [
      '日本の電車には、書かれていないルールがたくさんあります。まず、電車の中で電話で話すのはマナー違反とされています。',
      '混んでいる電車では、リュックは前に抱えます。降りる人が先、乗る人は後、が基本です。',
      '優先席の近くでは、携帯電話の音を消して、お年寄りや体の不自由な人に席をゆずりましょう。',
    ],
    vocab: [
      { word: '違反', reading: 'いはん', meaning: 'violation' },
      { word: '混む', reading: 'こむ', meaning: 'to be crowded' },
      { word: '抱える', reading: 'かかえる', meaning: 'to hold, carry in front' },
      { word: '優先席', reading: 'ゆうせんせき', meaning: 'priority seat' },
      { word: '譲る', reading: 'ゆずる', meaning: 'to give up (a seat), to yield' },
    ],
    grammar: [{ point: '〜とされている', explanation: '"Is regarded as": マナー違反とされています = "is considered bad manners".', example: 'マナー違反とされています。', exampleEn: 'It is considered a breach of manners.' }],
  },
  {
    id: 'japanese-tea', title: '日本のお茶', titleReading: 'にほんのおちゃ', titleEn: 'Japanese Tea',
    level: 'N4', category: 'article',
    summary: 'From everyday green tea to the tea ceremony.',
    paragraphs: [
      '日本人の生活に、お茶は欠かせません。食事の時も、休憩の時も、お茶を飲みます。',
      '緑茶にはたくさんの種類があります。せん茶、ほうじ茶、玄米茶、そして抹茶です。抹茶は粉のお茶で、茶道で使われます。',
      '茶道は、お茶を通して心を落ち着かせる日本の伝統文化です。一杯のお茶を、ていねいに、心をこめて出します。',
    ],
    vocab: [
      { word: '欠かせない', reading: 'かかせない', meaning: 'indispensable' },
      { word: '休憩', reading: 'きゅうけい', meaning: 'break, rest' },
      { word: '抹茶', reading: 'まっちゃ', meaning: 'matcha (powdered tea)' },
      { word: '茶道', reading: 'さどう', meaning: 'tea ceremony' },
      { word: '伝統', reading: 'でんとう', meaning: 'tradition' },
    ],
    grammar: [{ point: '〜を通して', explanation: '"Through / by means of": お茶を通して心を落ち着かせる.', example: 'お茶を通して心を落ち着かせます。', exampleEn: 'One calms the mind through tea.' }],
  },
  {
    id: 'autumn-festival', title: '秋祭り', titleReading: 'あきまつり', titleEn: 'The Autumn Festival',
    level: 'N5', category: 'article',
    summary: 'Taiko drums, food stalls, and portable shrines.',
    paragraphs: [
      '秋になると、日本の町や村でお祭りがあります。秋祭りは、米がたくさんとれたことに感謝するお祭りです。',
      'お祭りの日、人々は「みこし」をかついで町を歩きます。たいこの音が遠くまでひびきます。',
      '道には屋台がならびます。たこ焼き、りんごあめ、金魚すくい。子どもも大人も、この日を楽しみにしています。',
    ],
    vocab: [
      { word: '祭り', reading: 'まつり', meaning: 'festival' },
      { word: '感謝', reading: 'かんしゃ', meaning: 'gratitude' },
      { word: '神輿', reading: 'みこし', meaning: 'portable shrine' },
      { word: '太鼓', reading: 'たいこ', meaning: 'taiko drum' },
      { word: '響く', reading: 'ひびく', meaning: 'to resound, echo' },
    ],
    grammar: [{ point: '〜を楽しみにする', explanation: '"To look forward to": この日を楽しみにしています.', example: 'お祭りを楽しみにしています。', exampleEn: 'They look forward to the festival.' }],
  },
  {
    id: 'snowy-train', title: '雪の日の電車', titleReading: 'ゆきのひのでんしゃ', titleEn: 'The Train on a Snowy Day',
    level: 'N4', category: 'story',
    summary: 'A delayed train, a warm can of coffee, and a small kindness.',
    paragraphs: [
      '大雪の朝、電車が止まってしまいました。ホームは人でいっぱいで、みんな寒そうでした。',
      '私のとなりに、小さいおばあさんが立っていました。私は自動販売機で温かいコーヒーを二本買って、一本をおばあさんにわたしました。',
      'おばあさんはびっくりして、それからにっこり笑いました。「あたたかいねえ」。電車はまだ来ませんでしたが、心はあたたかくなりました。',
    ],
    vocab: [
      { word: '大雪', reading: 'おおゆき', meaning: 'heavy snow' },
      { word: 'ホーム', reading: 'ホーム', meaning: 'train platform' },
      { word: '渡す', reading: 'わたす', meaning: 'to hand over' },
      { word: 'にっこり', reading: 'にっこり', meaning: 'with a warm smile' },
      { word: '心', reading: 'こころ', meaning: 'heart' },
    ],
    grammar: [{ point: '〜そうだ (looks like)', explanation: '寒そうでした = "they looked cold" — appearance, from the adjective stem.', example: 'みんな寒そうでした。', exampleEn: 'Everyone looked cold.' }],
  },
  {
    id: 'grandmas-garden', title: 'おばあちゃんの畑', titleReading: 'おばあちゃんのはたけ', titleEn: "Grandma's Vegetable Garden",
    level: 'N5', category: 'story',
    summary: 'Summer mornings helping grandma pick tomatoes.',
    paragraphs: [
      '夏休みに、おばあちゃんの家へ行きました。おばあちゃんは小さい畑を持っています。',
      '朝早く、いっしょにトマトときゅうりをとりました。とったばかりのトマトは、太陽のにおいがしました。',
      'お昼に、その野菜でサラダを作りました。「自分でとった野菜はおいしいでしょう」と、おばあちゃんは笑いました。',
    ],
    vocab: [
      { word: '畑', reading: 'はたけ', meaning: 'field, vegetable garden' },
      { word: '取る', reading: 'とる', meaning: 'to pick, harvest' },
      { word: '太陽', reading: 'たいよう', meaning: 'the sun' },
      { word: '匂い', reading: 'におい', meaning: 'smell, scent' },
      { word: '野菜', reading: 'やさい', meaning: 'vegetables' },
    ],
    grammar: [{ point: '〜たばかり', explanation: '"Just did": とったばかりのトマト = "tomatoes just picked".', example: 'とったばかりのトマトです。', exampleEn: 'These tomatoes were just picked.' }],
  },
]

await mkdir(readingsDir, { recursive: true })
for (const r of READINGS) {
  await writeFile(join(readingsDir, `${r.id}.json`), JSON.stringify(r, null, 2) + '\n', 'utf8')
}

// Regenerate catalog from all reading files, preserving existing order.
const files = (await readdir(readingsDir)).filter((f) => f.endsWith('.json'))
const byId = {}
for (const f of files) {
  const r = JSON.parse(await readFile(join(readingsDir, f), 'utf8'))
  byId[r.id] = {
    id: r.id, title: r.title, titleReading: r.titleReading, titleEn: r.titleEn,
    level: r.level, category: r.category, summary: r.summary,
  }
}
let order = []
try {
  const prev = JSON.parse(await readFile(join(contentDir, 'catalog.json'), 'utf8'))
  order = prev.readings.map((r) => r.id).filter((id) => id in byId)
} catch { /* none */ }
for (const id of Object.keys(byId)) if (!order.includes(id)) order.push(id)

const catalog = { version: 1, readings: order.map((id) => byId[id]) }
await writeFile(join(contentDir, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n', 'utf8')
console.log(`Wrote ${READINGS.length} new readings. Catalog now lists ${catalog.readings.length}.`)
