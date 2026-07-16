// Simulated JLPT exams: timed, sectioned mock tests assembled from the curated
// question bank plus questions generated from the bundled kanji dictionary and
// vocabulary lists. Original practice material in the JLPT style — not real
// exam items.

import { BANK, mulberry32, seedFrom, shuffle, type Level, type Question, type TestItem } from './quizzes'
import { KANJI } from './kanji'
import { KANJI_BASE } from './kanji-base'
import { STORIES } from './stories'
import { READINGS } from './readings'

export interface ExamSection {
  id: 'moji' | 'bunpou' | 'dokkai'
  title: string
  titleEn: string
  items: TestItem[]
}

export interface Exam {
  level: Level
  variation: number
  /** total time limit in seconds */
  seconds: number
  sections: ExamSection[]
  totalItems: number
  /** the 読解 passage text */
  passage: string
}

export const EXAM_VARIATIONS = 100
// Scaled-down simulation times (the real exams are longer, with more items).
const EXAM_MINUTES: Record<Level, number> = { N5: 20, N4: 25, N3: 30, N2: 35, N1: 40 }

// ---------------------------------------------------------------------------
// Reading-comprehension passages (original text) — two per level.
// ---------------------------------------------------------------------------

interface Passage {
  level: Level
  text: string
  questions: Omit<Question, 'type'>[]
}

const PASSAGES: Passage[] = [
  {
    level: 'N5',
    text: 'わたしは まいあさ 七じに おきます。あさごはんは パンと たまごです。八じに いえを 出て、でんしゃで がっこうへ いきます。がっこうは 九じから 三じまでです。',
    questions: [
      { id: 'p-n5-1a', prompt: 'この人は なんで がっこうへ いきますか。', hint: 'How do they get to school?', choices: ['でんしゃで', 'バスで', 'あるいて', 'じてんしゃで'], answer: 0, explanation: '「でんしゃで がっこうへ いきます」— by train.' },
      { id: 'p-n5-1b', prompt: 'がっこうは なんじに おわりますか。', hint: 'When does school end?', choices: ['三じ', '九じ', '七じ', '八じ'], answer: 0, explanation: '「九じから 三じまで」— it ends at 3:00.' },
    ],
  },
  {
    level: 'N5',
    text: 'きのう、ともだちと こうえんへ いきました。てんきが よかったですから、たくさん あるきました。それから、アイスクリームを たべました。とても たのしかったです。',
    questions: [
      { id: 'p-n5-2a', prompt: 'きのうの てんきは どうでしたか。', hint: 'What was the weather like?', choices: ['よかった', 'あめだった', 'さむかった', 'わるかった'], answer: 0, explanation: '「てんきが よかったですから」— the weather was good.' },
      { id: 'p-n5-2b', prompt: 'こうえんで なにを たべましたか。', hint: 'What did they eat?', choices: ['アイスクリーム', 'パン', 'たまご', 'おにぎり'], answer: 0, explanation: 'They ate ice cream (アイスクリーム).' },
    ],
  },
  {
    level: 'N4',
    text: '私のアパートの前に、新しいパン屋ができました。朝六時に開くので、会社へ行く前に買うことができます。一番人気があるのはカレーパンで、十時ごろには売り切れてしまいます。私も先週やっと買えました。',
    questions: [
      { id: 'p-n4-1a', prompt: 'カレーパンを買いたい人は、いつ行ったほうがいいですか。', hint: 'When should you go for the curry bread?', choices: ['朝はやく', 'ひるごろ', 'ゆうがた', 'よる'], answer: 0, explanation: 'It sells out by around 10:00, so you should go early in the morning.' },
      { id: 'p-n4-1b', prompt: '「やっと買えました」— どんな気持ちですか。', hint: 'What feeling does やっと express?', choices: ['ずっと買えなくて、うれしい', 'あまり食べたくない', 'まいにち買っている', 'もう食べたくない'], answer: 0, explanation: 'やっと = "finally" — after not managing for a while, they were happy to get it.' },
    ],
  },
  {
    level: 'N4',
    text: '日本では、電車の中で電話で話すのはマナーが悪いと思われています。メールやメッセージは問題ありませんが、声を出して話すと、周りの人がいやな顔をするかもしれません。電話に出なければならない時は、次の駅で降りて話す人もいます。',
    questions: [
      { id: 'p-n4-2a', prompt: '電車の中で してはいけないと思われているのは どれですか。', hint: 'Which is considered bad manners?', choices: ['電話で話すこと', 'メールを送ること', '本を読むこと', '音楽を聞くこと'], answer: 0, explanation: 'Talking on the phone is considered bad manners; texting is fine.' },
      { id: 'p-n4-2b', prompt: 'どうしても電話に出たい人は、どうしますか。', hint: 'What do some people do?', choices: ['次の駅で降りる', '大きい声で話す', '電車を止める', '運転手に聞く'], answer: 0, explanation: 'Some people get off at the next station to take the call.' },
    ],
  },
  {
    level: 'N3',
    text: '最近、「食品ロス」という言葉をよく聞くようになった。まだ食べられるのに捨てられてしまう食べ物のことである。日本では年間数百万トンの食品が捨てられており、その約半分は家庭から出ているという。買いすぎない、作りすぎない、残さず食べる。一人一人の小さな心がけが、大きな変化につながるはずだ。',
    questions: [
      { id: 'p-n3-1a', prompt: '「食品ロス」とは何ですか。', hint: 'What is 食品ロス?', choices: ['まだ食べられるのに捨てられる食べ物', '安く売られる食べ物', '外国から輸入される食べ物', '体に悪い食べ物'], answer: 0, explanation: 'Defined in the passage: food thrown away although still edible.' },
      { id: 'p-n3-1b', prompt: '筆者が一番言いたいことは何ですか。', hint: 'Main point?', choices: ['一人一人の心がけが大切だ', '食品は安いほうがいい', '家庭の食事はおいしい', '日本の食品は多すぎる'], answer: 0, explanation: 'The conclusion: each person\'s small daily effort leads to big change.' },
    ],
  },
  {
    level: 'N3',
    text: '駅前の古い本屋が、来月で閉店するそうだ。子どものころから通った店なので、なくなると聞いて寂しくなった。店主によると、本を買う人が減ったというより、「本を選ぶ時間を楽しむ人」が減ったのだそうだ。ネットで買えば早いが、棚の間を歩きながら思いがけない一冊に出会う楽しみは、店でしか味わえない。',
    questions: [
      { id: 'p-n3-2a', prompt: '店主は、何が減ったと言っていますか。', hint: 'What does the owner say has decreased?', choices: ['本を選ぶ時間を楽しむ人', '本の種類', '店の近くに住む人', '新しい本'], answer: 0, explanation: 'Not book buyers as such — people who enjoy the time spent choosing books.' },
      { id: 'p-n3-2b', prompt: '筆者は、本屋のどんなところがいいと考えていますか。', hint: 'What does the writer value?', choices: ['思いがけない本に出会えること', '安く買えること', '早く買えること', '店が新しいこと'], answer: 0, explanation: 'The joy of unexpectedly finding a book while browsing the shelves.' },
    ],
  },
  {
    level: 'N2',
    text: '在宅勤務が広がったことで、働き方に対する考え方そのものが変わりつつある。通勤時間がなくなった分、自由な時間が増えたと感じる人がいる一方で、仕事と生活の境目があいまいになり、かえって長時間働いてしまうという声も少なくない。制度を整えるだけでなく、時間の使い方を自分で管理する力が、これまで以上に求められていると言えるだろう。',
    questions: [
      { id: 'p-n2-1a', prompt: '在宅勤務の問題点として挙げられているのはどれか。', hint: 'What problem is mentioned?', choices: ['仕事と生活の境目があいまいになる', '通勤時間が長くなる', '給料が下がる', '会議が増える'], answer: 0, explanation: 'The boundary between work and life blurs, and some end up working longer.' },
      { id: 'p-n2-1b', prompt: '筆者の考えに最も近いものはどれか。', hint: 'Closest to the author\'s view?', choices: ['自分で時間を管理する力が必要だ', '在宅勤務はやめるべきだ', '通勤は体にいい', '制度さえあれば問題ない'], answer: 0, explanation: 'Beyond systems, self-management of time is now required more than ever.' },
    ],
  },
  {
    level: 'N2',
    text: '「便利さ」には、しばしば見えない代償が伴う。二十四時間営業の店は確かに便利だが、それを支えるのは深夜に働く人々である。翌日配達は助かるが、その裏では配達員が時間に追われている。便利さを当然のものとして受け取るのではなく、その仕組みを支える人々を想像することが、成熟した消費者の態度ではないだろうか。',
    questions: [
      { id: 'p-n2-2a', prompt: '「見えない代償」の例として合っているものはどれか。', hint: 'An example of the hidden cost?', choices: ['深夜に働く人々の負担', '商品の値段が上がること', '店が閉まること', '配達が遅れること'], answer: 0, explanation: 'The burden on late-night workers and rushed couriers supports the convenience.' },
      { id: 'p-n2-2b', prompt: '筆者が消費者に求めているのはどんな態度か。', hint: 'What attitude is asked of consumers?', choices: ['仕組みを支える人々を想像すること', '便利な店だけを使うこと', 'できるだけ安く買うこと', '深夜に買い物をしないこと'], answer: 0, explanation: 'To imagine the people who sustain convenience rather than take it for granted.' },
    ],
  },
  {
    level: 'N1',
    text: '技術の進歩は、しばしば「できるようになったこと」の華々しさで語られる。だが本質的な問いは、できるようになった今、「何をすべきか」であろう。手段の拡大は目的の吟味を免除しない。むしろ選択肢が増えるほど、選ばないという判断を含めて、私たちの倫理は一層問われることになる。',
    questions: [
      { id: 'p-n1-1a', prompt: '筆者によれば、技術の進歩がもたらす本質的な問いとは何か。', hint: 'The essential question?', choices: ['何をすべきかという目的の吟味', 'どこまで速くできるかという競争', 'いくらで実現できるかという費用', 'だれが最初に作るかという名誉'], answer: 0, explanation: '"The essential question is what we ought to do, now that we can."' },
      { id: 'p-n1-1b', prompt: '「選ばないという判断」とは、どういうことか。', hint: 'What does "the judgment not to choose" mean?', choices: ['可能でも、あえて実行しないという倫理的な選択', '技術を理解しないままでいること', '判断を他人に任せること', '選択肢を知らないこと'], answer: 0, explanation: 'Even when something is possible, deliberately not doing it is itself an ethical choice.' },
    ],
  },
  {
    level: 'N1',
    text: '方言が失われつつあると言われて久しい。標準語の普及は意思疎通の効率を高めたが、その一方で、土地の記憶を宿す言葉の肌理を平準化してもきた。方言は単なる訛りではなく、その土地の暮らしと感情の堆積である。効率と引き換えに何を手放しているのか、時折立ち止まって考える必要があるのではないか。',
    questions: [
      { id: 'p-n1-2a', prompt: '筆者は方言をどのようなものだと考えているか。', hint: 'How does the author view dialects?', choices: ['土地の暮らしと感情の堆積', '直すべき話し方の癖', '効率を下げる障害', '標準語の一種'], answer: 0, explanation: 'Dialects are described as the sediment of local life and feeling — not mere accents.' },
      { id: 'p-n1-2b', prompt: 'この文章で筆者が促しているのはどんなことか。', hint: 'What does the author urge?', choices: ['効率と引き換えに失うものを時々考えること', '標準語をやめること', '方言を全国に広めること', '外国語を学ぶこと'], answer: 0, explanation: 'To pause occasionally and ask what is being given up in exchange for efficiency.' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Generated 文字・語彙 questions from the bundled dictionaries.
// ---------------------------------------------------------------------------

interface PoolEntry {
  char: string
  meanings: string[]
  kun: string[]
  on: string[]
}

function kanjiPool(level: Level): PoolEntry[] {
  const pool: PoolEntry[] = []
  for (const k of Object.values(KANJI)) if (k.jlpt === level) pool.push(k)
  for (const [char, b] of Object.entries(KANJI_BASE)) {
    if (b.jlpt === level) pool.push({ char, meanings: b.meanings, kun: b.kun, on: b.on })
  }
  return pool.filter((k) => k.meanings.length > 0 && (k.kun.length > 0 || k.on.length > 0))
}

function vocabPool(level: Level) {
  const seen = new Set<string>()
  const out: { word: string; reading: string; meaning: string }[] = []
  const take = (lvl: string, vocab: { word: string; reading: string; meaning: string }[]) => {
    if (lvl !== level) return
    for (const v of vocab) {
      if (seen.has(v.word)) continue
      seen.add(v.word)
      out.push(v)
    }
  }
  for (const s of STORIES) take(s.level, s.vocab)
  for (const r of READINGS) take(r.level, r.vocab)
  return out
}

const reading = (k: PoolEntry) => (k.kun[0] || k.on[0]) ?? ''

/** Kanji-reading questions: 「水」の よみかたは？ */
function genKanjiReading(level: Level, rng: () => number, count: number): TestItem[] {
  const pool = shuffle(kanjiPool(level), rng)
  const items: TestItem[] = []
  for (const k of pool) {
    if (items.length >= count) break
    const correct = reading(k)
    if (!correct) continue
    const distractors = shuffle(
      pool.filter((o) => o !== k && reading(o) && reading(o) !== correct).map(reading),
      rng,
    )
    const uniq = [...new Set(distractors)].slice(0, 3)
    if (uniq.length < 3) continue
    const choices = shuffle([correct, ...uniq], rng)
    items.push({
      id: `g-kr-${k.char}`,
      type: 'kanji',
      prompt: `「${k.char}」の よみかたは？`,
      hint: 'Choose the correct reading.',
      choices,
      answer: choices.indexOf(correct),
      explanation: `${k.char} = ${correct} (${k.meanings.slice(0, 2).join(', ')}).`,
    })
  }
  return items
}

/** Kanji-meaning questions: 「水」の いみは？ */
function genKanjiMeaning(level: Level, rng: () => number, count: number): TestItem[] {
  const pool = shuffle(kanjiPool(level), rng)
  const items: TestItem[] = []
  for (const k of pool) {
    if (items.length >= count) break
    const correct = k.meanings[0]
    const distractors = shuffle(
      pool.filter((o) => o !== k && o.meanings[0] && o.meanings[0] !== correct).map((o) => o.meanings[0]),
      rng,
    )
    const uniq = [...new Set(distractors)].slice(0, 3)
    if (uniq.length < 3) continue
    const choices = shuffle([correct, ...uniq], rng)
    items.push({
      id: `g-km-${k.char}`,
      type: 'kanji',
      prompt: `「${k.char}」の いみは？`,
      hint: 'What does this kanji mean?',
      choices,
      answer: choices.indexOf(correct),
      explanation: `${k.char} (${reading(k)}) = ${correct}.`,
    })
  }
  return items
}

/** Vocabulary questions from the content word lists. */
function genVocab(level: Level, rng: () => number, count: number): TestItem[] {
  const pool = shuffle(vocabPool(level), rng)
  const items: TestItem[] = []
  for (const v of pool) {
    if (items.length >= count) break
    const distractors = shuffle(
      pool.filter((o) => o !== v && o.meaning !== v.meaning).map((o) => o.meaning),
      rng,
    )
    const uniq = [...new Set(distractors)].slice(0, 3)
    if (uniq.length < 3) continue
    const choices = shuffle([v.meaning, ...uniq], rng)
    items.push({
      id: `g-v-${v.word}`,
      type: 'vocab',
      prompt: `「${v.word}（${v.reading}）」の いみは？`,
      hint: 'What does this word mean?',
      choices,
      answer: choices.indexOf(v.meaning),
      explanation: `${v.word}（${v.reading}）= ${v.meaning}.`,
    })
  }
  return items
}

// ---------------------------------------------------------------------------
// Exam assembly
// ---------------------------------------------------------------------------

const toItem = (q: Question | (Omit<Question, 'type'> & { type?: Question['type'] }), rng: () => number): TestItem => {
  const order = shuffle(q.choices.map((_, i) => i), rng)
  return {
    id: q.id,
    type: (q as Question).type ?? 'reading',
    prompt: q.prompt,
    hint: q.hint,
    explanation: q.explanation,
    choices: order.map((i) => q.choices[i]),
    answer: order.indexOf(q.answer),
  }
}

/** Build one repeatable simulated exam (variation 1..100) for a level. */
export function buildExam(level: Level, variation: number): Exam {
  const rng = mulberry32(seedFrom(`exam:${level}`, variation))

  // 文字・語彙 — 12 items: generated readings/meanings/vocab
  const moji: TestItem[] = shuffle(
    [
      ...genKanjiReading(level, rng, 5),
      ...genKanjiMeaning(level, rng, 4),
      ...genVocab(level, rng, 3),
    ],
    rng,
  ).slice(0, 12)

  // 文法 — 8 items from the curated bank (grammar first, then anything left)
  const grammar = BANK[level].filter((q) => q.type === 'grammar')
  const rest = BANK[level].filter((q) => q.type !== 'grammar')
  const bunpou = shuffle([...shuffle(grammar, rng), ...shuffle(rest, rng)].slice(0, 8), rng).map(
    (q) => toItem(q, rng),
  )

  // 読解 — one passage (its questions keep their order)
  const passages = PASSAGES.filter((p) => p.level === level)
  const passage = passages[Math.floor(rng() * passages.length)]
  const dokkai = passage.questions.map((q) => toItem(q, rng))

  const sections: ExamSection[] = [
    { id: 'moji', title: '文字・語彙', titleEn: 'Kanji & Vocabulary', items: moji },
    { id: 'bunpou', title: '文法', titleEn: 'Grammar', items: bunpou },
    { id: 'dokkai', title: '読解', titleEn: 'Reading', items: dokkai },
  ]
  return {
    level,
    variation,
    seconds: EXAM_MINUTES[level] * 60,
    sections,
    totalItems: sections.reduce((n, s) => n + s.items.length, 0),
    passage: passage.text,
  }
}
