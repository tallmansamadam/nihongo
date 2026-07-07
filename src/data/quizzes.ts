// Original JLPT-style practice questions (NOT real exam items). Each level has a
// bank; the app assembles randomized "variations" from it with a deterministic
// seed, so every level offers 100 distinct, repeatable practice tests.

export type Level = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
export const LEVELS: Level[] = ['N5', 'N4', 'N3', 'N2', 'N1']

export interface Question {
  id: string
  type: 'vocab' | 'grammar' | 'kanji' | 'reading'
  /** The question stem; may contain a blank marked with ＿＿. */
  prompt: string
  /** Short English instruction/hint. */
  hint: string
  choices: [string, string, string, string]
  /** Index into `choices` (original order) of the correct answer. */
  answer: number
  explanation: string
}

const TYPE_LABEL: Record<Question['type'], string> = {
  vocab: 'Vocabulary',
  grammar: 'Grammar',
  kanji: 'Kanji',
  reading: 'Reading',
}
export const typeLabel = (t: Question['type']) => TYPE_LABEL[t]

const BANK: Record<Level, Question[]> = {
  N5: [
    { id: 'n5-1', type: 'grammar', prompt: 'これ＿＿ わたしの ペンです。', hint: 'Choose the correct particle.', choices: ['は', 'を', 'に', 'へ'], answer: 0, explanation: 'は marks the topic: "This is my pen."' },
    { id: 'n5-2', type: 'grammar', prompt: 'まいあさ、コーヒー＿＿ のみます。', hint: 'Choose the correct particle.', choices: ['が', 'を', 'に', 'と'], answer: 1, explanation: 'を marks the direct object of のむ (to drink).' },
    { id: 'n5-3', type: 'grammar', prompt: 'がっこう＿＿ いきます。', hint: 'Destination of motion.', choices: ['を', 'で', 'へ', 'が'], answer: 2, explanation: 'へ (or に) marks the destination with 行く.' },
    { id: 'n5-4', type: 'kanji', prompt: '「山」の よみかたは？', hint: 'How is this kanji read here?', choices: ['やま', 'かわ', 'た', 'いし'], answer: 0, explanation: '山 = やま (mountain).' },
    { id: 'n5-5', type: 'kanji', prompt: '「にほん」を かんじで かくと？', hint: 'Which kanji spelling is correct?', choices: ['日本', '目本', '日木', '白本'], answer: 0, explanation: '日本 = Japan.' },
    { id: 'n5-6', type: 'vocab', prompt: 'まいにち 本を ＿＿。', hint: 'Which verb fits?', choices: ['よみます', 'のみます', 'ききます', 'かえます'], answer: 0, explanation: '本を よむ = to read a book.' },
    { id: 'n5-7', type: 'vocab', prompt: 'あついので、まどを ＿＿ ください。', hint: 'Which verb fits?', choices: ['あけて', 'しめて', 'けして', 'つけて'], answer: 0, explanation: 'まどを あける = to open the window (because it is hot).' },
    { id: 'n5-8', type: 'grammar', prompt: 'わたしは 学生 ＿＿。', hint: 'Polite "to be".', choices: ['です', 'ます', 'ない', 'する'], answer: 0, explanation: 'Noun + です = "am/is/are".' },
    { id: 'n5-9', type: 'grammar', prompt: 'ともだち＿＿ えいがを 見ます。', hint: '"With a friend".', choices: ['と', 'を', 'に', 'は'], answer: 0, explanation: 'と marks the person you do something with.' },
    { id: 'n5-10', type: 'kanji', prompt: '「水」の よみかたは？', hint: 'Kanji reading.', choices: ['みず', 'ひ', 'き', 'つち'], answer: 0, explanation: '水 = みず (water).' },
    { id: 'n5-11', type: 'vocab', prompt: 'この りんごは ＿＿ です。(¥100)', hint: 'Which adjective fits a cheap price?', choices: ['やすい', 'たかい', 'おおきい', 'あつい'], answer: 0, explanation: 'やすい = cheap.' },
    { id: 'n5-12', type: 'grammar', prompt: 'つくえの うえ＿＿ 本が あります。', hint: 'Location particle.', choices: ['に', 'を', 'へ', 'と'], answer: 0, explanation: 'に marks the location of existence with あります.' },
    { id: 'n5-13', type: 'kanji', prompt: '「ひと」を かんじで かくと？', hint: 'Which kanji?', choices: ['人', '入', '大', '八'], answer: 0, explanation: '人 = person (ひと).' },
    { id: 'n5-14', type: 'vocab', prompt: '「あたらしい」の はんたいは？', hint: 'Opposite of "new".', choices: ['ふるい', 'たかい', 'ちいさい', 'はやい'], answer: 0, explanation: 'ふるい (old) is the opposite of あたらしい (new).' },
    { id: 'n5-15', type: 'grammar', prompt: 'きのう、えいがを 見＿＿。', hint: 'Past polite form.', choices: ['ました', 'ます', 'ません', 'ましょう'], answer: 0, explanation: '見ました = watched (past polite).' },
  ],
  N4: [
    { id: 'n4-1', type: 'grammar', prompt: '日本語が 話せる＿＿ なりました。', hint: 'Change of state / ability.', choices: ['ように', 'ことに', 'そうに', 'ために'], answer: 0, explanation: '〜ようになる = come to be able to (a change over time).' },
    { id: 'n4-2', type: 'grammar', prompt: 'あめが ふって いる＿＿、でかけません。', hint: 'Reason.', choices: ['から', 'のに', 'ても', 'たり'], answer: 0, explanation: 'から states a reason: "because it is raining…".' },
    { id: 'n4-3', type: 'grammar', prompt: 'テレビを 見＿＿、ごはんを 食べます。', hint: '"While doing".', choices: ['ながら', 'たり', 'ないで', 'てから'], answer: 0, explanation: 'Verb-stem + ながら = doing two things at once.' },
    { id: 'n4-4', type: 'vocab', prompt: 'かれは まだ 来ません。＿＿ しましょう。', hint: 'Which fits: "let us wait a little more"?', choices: ['もう すこし まって', 'すぐ かえって', 'はやく ねて', 'よく たべて'], answer: 0, explanation: 'もう少し待つ = to wait a little longer.' },
    { id: 'n4-5', type: 'kanji', prompt: '「病院」の よみかたは？', hint: 'Kanji compound reading.', choices: ['びょういん', 'びよういん', 'びょうき', 'いいん'], answer: 0, explanation: '病院 = びょういん (hospital). Note びよういん is 美容院 (beauty salon).' },
    { id: 'n4-6', type: 'grammar', prompt: 'この かんじが 読める＿＿ どうか わかりません。', hint: '"Whether or not".', choices: ['か', 'と', 'の', 'ば'], answer: 0, explanation: '〜かどうか = whether or not.' },
    { id: 'n4-7', type: 'grammar', prompt: 'へやを きれいに ＿＿ おきました。', hint: 'Do in advance / leave in a state.', choices: ['して', 'なって', 'あって', 'いて'], answer: 0, explanation: '〜ておく = do something in advance. きれいにしておく = tidied it up beforehand.' },
    { id: 'n4-8', type: 'vocab', prompt: '「しゅうかん」の いみは？', hint: 'Meaning of 習慣.', choices: ['ならわし・くせ', 'しごと', 'やくそく', 'きせつ'], answer: 0, explanation: '習慣 = habit / custom.' },
    { id: 'n4-9', type: 'grammar', prompt: 'せんせいに 名前を ＿＿。', hint: 'Humble: "was asked / called".', choices: ['よばれました', 'よびました', 'よんでいます', 'よぼう'], answer: 0, explanation: 'よばれる is the passive of よぶ: "I was called by the teacher."' },
    { id: 'n4-10', type: 'kanji', prompt: '「あんぜん」を かんじで かくと？', hint: 'Which spelling?', choices: ['安全', '安金', '案全', '女全'], answer: 0, explanation: '安全 = safety.' },
    { id: 'n4-11', type: 'grammar', prompt: 'もし お金が ＿＿、りょこうします。', hint: 'Conditional "if".', choices: ['あれば', 'あって', 'あるが', 'あるの'], answer: 0, explanation: '〜ば conditional: あれば = "if there is/I have".' },
    { id: 'n4-12', type: 'vocab', prompt: 'かれは ピアノが とても ＿＿ です。', hint: '"Good at".', choices: ['じょうず', 'げんき', 'たいへん', 'ゆうめい'], answer: 0, explanation: '上手（じょうず）= skilled / good at.' },
    { id: 'n4-13', type: 'grammar', prompt: '日本へ 行った＿＿ が あります。', hint: 'Past experience.', choices: ['こと', 'もの', 'ところ', 'よう'], answer: 0, explanation: '〜たことがある = have (had) the experience of doing.' },
    { id: 'n4-14', type: 'kanji', prompt: '「持つ」の よみかたは？', hint: 'Verb reading.', choices: ['もつ', 'まつ', 'たつ', 'うつ'], answer: 0, explanation: '持つ = もつ (to hold/have).' },
  ],
  N3: [
    { id: 'n3-1', type: 'grammar', prompt: 'いそがしくて、ねる ＿＿ も ない。', hint: '"Not even time to sleep".', choices: ['ひま', 'とき', 'こと', 'まで'], answer: 0, explanation: 'ねるひまもない = not even time (leisure) to sleep.' },
    { id: 'n3-2', type: 'grammar', prompt: 'かれの 話に ＿＿、じけんは よる おきた。', hint: '"According to".', choices: ['よると', 'ついて', 'たいして', 'かわって'], answer: 0, explanation: '〜によると = according to (a source).' },
    { id: 'n3-3', type: 'grammar', prompt: '雨に ＿＿ 、しあいは 行われた。', hint: '"Despite / regardless of".', choices: ['もかかわらず', 'によって', 'のうえで', 'とともに'], answer: 0, explanation: '〜にもかかわらず = despite / in spite of.' },
    { id: 'n3-4', type: 'vocab', prompt: '「あきらめる」の いみに ちかいのは？', hint: 'Closest meaning.', choices: ['やめる・だんねんする', 'つづける', 'はじめる', 'たしかめる'], answer: 0, explanation: 'あきらめる = to give up.' },
    { id: 'n3-5', type: 'grammar', prompt: 'この しごとは 私 ＿＿ には むずかしすぎる。', hint: '"For me".', choices: ['にとって', 'について', 'によって', 'にたいして'], answer: 0, explanation: '〜にとって = for / from the standpoint of.' },
    { id: 'n3-6', type: 'kanji', prompt: '「経験」の よみかたは？', hint: 'Compound reading.', choices: ['けいけん', 'けいげん', 'きょうけん', 'けいこう'], answer: 0, explanation: '経験 = けいけん (experience).' },
    { id: 'n3-7', type: 'grammar', prompt: 'べんきょうすれば する ＿＿、力が つく。', hint: '"The more…, the more…".', choices: ['ほど', 'だけ', 'まで', 'くらい'], answer: 0, explanation: '〜ば〜ほど = the more … the more ….' },
    { id: 'n3-8', type: 'vocab', prompt: '「そうだん」する あいては だれですか。', hint: 'What does 相談 mean?', choices: ['はなしあい・アドバイスを もとめる', 'けんか', 'やくそく', 'しあい'], answer: 0, explanation: '相談する = to consult / talk over with someone.' },
    { id: 'n3-9', type: 'grammar', prompt: 'あの 人は 医者 ＿＿、しごとが とても いそがしい。', hint: '"Being (a doctor), so…".', choices: ['だけあって', 'だけに', 'どころか', 'ばかりに'], answer: 1, explanation: '〜だけに = precisely because (being a doctor), naturally busy.' },
    { id: 'n3-10', type: 'kanji', prompt: '「増える」の よみかたは？', hint: 'Verb reading.', choices: ['ふえる', 'こえる', 'あたえる', 'かえる'], answer: 0, explanation: '増える = ふえる (to increase).' },
    { id: 'n3-11', type: 'grammar', prompt: 'かのじょは 泣き ＿＿ 話した。', hint: '"While (crying)".', choices: ['ながら', 'つつ', 'かけ', 'だす'], answer: 0, explanation: '泣きながら = while crying (two simultaneous actions).' },
    { id: 'n3-12', type: 'vocab', prompt: '「けっきょく」の いみは？', hint: 'Meaning of 結局.', choices: ['さいごに・つまり', 'たぶん', 'とつぜん', 'たとえば'], answer: 0, explanation: '結局 = in the end / after all.' },
  ],
  N2: [
    { id: 'n2-1', type: 'grammar', prompt: '子どもの ＿＿、あんな だいきぼな しごとを やりとげた。', hint: '"Despite being a child".', choices: ['ながら', 'くせに', 'ものの', 'どころ'], answer: 1, explanation: '〜くせに = even though / despite (with a critical nuance).' },
    { id: 'n2-2', type: 'grammar', prompt: 'かれの じつりょく ＿＿ すれば、ゆうしょうも かのうだ。', hint: '"Judging from his ability".', choices: ['から', 'にして', 'をもとに', 'からして'], answer: 3, explanation: '〜からして = judging from / going by.' },
    { id: 'n2-3', type: 'grammar', prompt: '社長 ＿＿、社員も みな しんぱいして いる。', hint: '"Not to mention / starting with".', choices: ['をはじめ', 'にくわえ', 'にひきかえ', 'をこめて'], answer: 0, explanation: '〜をはじめ(として) = starting with / including (X and others).' },
    { id: 'n2-4', type: 'vocab', prompt: '「あいまい」な へんじの とくちょうは？', hint: 'What does 曖昧 describe?', choices: ['はっきり しない', 'とても ながい', 'つよくて はやい', 'ていねいな'], answer: 0, explanation: '曖昧（あいまい）= vague / ambiguous.' },
    { id: 'n2-5', type: 'grammar', prompt: 'いくら 高く ＿＿、ひつような ものは かう。', hint: '"No matter how (expensive)".', choices: ['ても', 'ては', 'たら', 'れば'], answer: 0, explanation: 'いくら〜ても = no matter how ….' },
    { id: 'n2-6', type: 'kanji', prompt: '「詳しい」の よみかたは？', hint: 'Adjective reading.', choices: ['くわしい', 'したしい', 'けわしい', 'あやしい'], answer: 0, explanation: '詳しい = くわしい (detailed / knowledgeable).' },
    { id: 'n2-7', type: 'grammar', prompt: 'けいかくは、けっこう する ＿＿ すぐ 中止に なった。', hint: '"Just as / no sooner than".', choices: ['やいなや', 'かぎり', 'あまり', 'うえは'], answer: 0, explanation: '〜やいなや = the moment that / no sooner … than.' },
    { id: 'n2-8', type: 'vocab', prompt: '「めんどう」な てつづきの いみに ちかいのは？', hint: 'Closest meaning of 面倒.', choices: ['てまが かかる・やっかい', 'かんたん', 'あんぜん', 'ゆかい'], answer: 0, explanation: '面倒（めんどう）= troublesome / a hassle.' },
    { id: 'n2-9', type: 'grammar', prompt: '努力 ＿＿ の せいこうだ。だれの おかげでも ない。', hint: '"The result precisely of (effort)".', choices: ['あって', 'ばかり', 'ながら', 'まみれ'], answer: 0, explanation: '〜あっての = something that exists only thanks to …. 努力あっての成功 = success that exists thanks to effort.' },
    { id: 'n2-10', type: 'kanji', prompt: '「募集」の よみかたは？', hint: 'Compound reading.', choices: ['ぼしゅう', 'もしゅう', 'ぼしゅ', 'ぼじゅう'], answer: 0, explanation: '募集 = ぼしゅう (recruitment / call for applicants).' },
  ],
  N1: [
    { id: 'n1-1', type: 'grammar', prompt: 'いちど ひきうけた ＿＿、さいごまで せきにんを もつべきだ。', hint: '"Now that you have (undertaken)".', choices: ['からには', 'ところで', 'とはいえ', 'ものなら'], answer: 0, explanation: '〜からには = now that / since (with the resolve that follows).' },
    { id: 'n1-2', type: 'grammar', prompt: 'かれの たいどは しつれい ＿＿。', hint: '"Nothing short of / the very height of".', choices: ['きわまりない', 'にたえない', 'をよぎなくされた', 'といったらない'], answer: 0, explanation: '〜きわまりない = extremely / utterly (formal, negative). 失礼きわまりない = utterly rude.' },
    { id: 'n1-3', type: 'grammar', prompt: 'なみだ ＿＿ うったえる かのじょの すがたに、みな こころを うたれた。', hint: '"Drenched in / covered with".', choices: ['ながらに', 'まみれに', 'ずくめに', 'なりに'], answer: 0, explanation: '涙ながらに = while in tears (formal set phrase).' },
    { id: 'n1-4', type: 'vocab', prompt: '「いちじるしい」せいちょうの いみは？', hint: 'Meaning of 著しい.', choices: ['はっきりと めだつ・大きい', 'ゆっくりな', 'ふつうの', 'あぶない'], answer: 0, explanation: '著しい（いちじるしい）= remarkable / striking.' },
    { id: 'n1-5', type: 'grammar', prompt: 'せんもんかの かれ ＿＿、この もんだいは かいけつ できまい。', hint: '"Even (the expert)".', choices: ['をもってしても', 'にあって', 'ならでは', 'いかんで'], answer: 0, explanation: '〜をもってしても = even with / even by means of (X, still not enough).' },
    { id: 'n1-6', type: 'kanji', prompt: '「careful に あつかう」— 「慎重」の よみは？', hint: 'Reading of 慎重.', choices: ['しんちょう', 'しんじゅう', 'しんじゅ', 'ちんちょう'], answer: 0, explanation: '慎重 = しんちょう (cautious / prudent).' },
    { id: 'n1-7', type: 'grammar', prompt: 'この でんとうは、まもられる ＿＿。', hint: '"Ought to be / must naturally be".', choices: ['べきものだ', 'きらいがある', 'しまつだ', 'ゆえんだ'], answer: 0, explanation: '守られるべきものだ = something that ought to be protected.' },
    { id: 'n1-8', type: 'vocab', prompt: '「ふにん」する とき、人は どこへ 行きますか。', hint: 'What does 赴任 mean?', choices: ['あたらしい きんむ地へ 行く', 'びょういんへ 行く', 'りょこうに 行く', 'いえに かえる'], answer: 0, explanation: '赴任（ふにん）= to take up a new post (often in another location).' },
    { id: 'n1-9', type: 'grammar', prompt: 'せいこう する か ＿＿ は、きみの どりょく しだいだ。', hint: '"Whether or not (success)".', choices: ['いなか', 'どうか', 'ならず', 'ものか'], answer: 0, explanation: '〜か否（いな）か = whether or not (formal).' },
  ],
}

// ---- deterministic randomization so each "variation" is repeatable ----
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function seedFrom(level: string, variation: number): number {
  let h = 2166136261
  const s = `${level}:${variation}`
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export interface TestItem {
  id: string
  type: Question['type']
  prompt: string
  hint: string
  choices: string[]
  answer: number
  explanation: string
}

export const VARIATIONS = 100
export const TEST_SIZE = 8

export function bankSize(level: Level): number {
  return BANK[level].length
}

/** Build one repeatable test variation (1..100) for a level. */
export function buildTest(level: Level, variation: number, size = TEST_SIZE): TestItem[] {
  const rng = mulberry32(seedFrom(level, variation))
  const picked = shuffle(BANK[level], rng).slice(0, Math.min(size, BANK[level].length))
  return picked.map((q) => {
    const order = shuffle(
      q.choices.map((_, i) => i),
      rng,
    )
    return {
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      hint: q.hint,
      explanation: q.explanation,
      choices: order.map((i) => q.choices[i]),
      answer: order.indexOf(q.answer),
    }
  })
}
