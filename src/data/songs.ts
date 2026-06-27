import type { Song } from './types'

// NOTE: These study packs teach the vocabulary and grammar that each song is
// built around. The `phrases` are ORIGINAL example sentences written for this
// app — they are not the songs' lyrics. To study the real lyrics, paste them
// into the box in the app (you supply text you have legal access to).

export const SONGS: Song[] = [
  {
    id: 'real-folk-blues',
    title: 'Real Folk Blues',
    titleRomaji: 'Real Folk Blues',
    titleEn: 'Real Folk Blues',
    artist: '山根麻衣 (Mai Yamane)',
    anime: 'Cowboy Bebop — ending theme',
    year: 1998,
    level: 'N3',
    about:
      'A bluesy, world-weary ballad about loneliness, fleeting happiness, and what is "real." Great for emotional vocabulary and the soft, reflective grammar of regret.',
    phrases: [
      {
        line: [
          { w: '本当', r: 'ほんとう', g: 'truth, real' }, { w: 'の' }, { w: '幸せ', r: 'しあわせ', g: 'happiness' }, { w: 'は' }, { w: '何', r: 'なに', g: 'what' }, { w: 'だろう' }, { w: '。' },
        ],
        en: 'I wonder what real happiness is.',
        note: '〜だろう softens a statement into musing or wondering.',
      },
      {
        line: [
          { w: '寂しさ', r: 'さびしさ', g: 'loneliness' }, { w: 'を' }, { w: 'わすれる' }, { w: 'ために' }, { w: '空', r: 'そら', g: 'sky' }, { w: 'を' }, { w: '見ます', r: 'みます', g: 'look at' }, { w: '。' },
        ],
        en: 'I look at the sky in order to forget the loneliness.',
        note: '〜ために = "in order to". Verb (dictionary form) + ために.',
      },
      {
        line: [
          { w: '君', r: 'きみ', g: 'you' }, { w: 'が' }, { w: 'きらい' }, { w: 'な' }, { w: 'わけじゃない' }, { w: '。' },
        ],
        en: "It's not that I dislike you.",
        note: '〜わけじゃない = "it doesn\'t mean that…", gently denying a wrong conclusion.',
      },
    ],
    vocab: [
      { word: '本当', reading: 'ほんとう', meaning: 'truth, real, genuine' },
      { word: '幸せ', reading: 'しあわせ', meaning: 'happiness' },
      { word: '悲しみ', reading: 'かなしみ', meaning: 'sadness, sorrow' },
      { word: '寂しさ', reading: 'さびしさ', meaning: 'loneliness' },
      { word: '心', reading: 'こころ', meaning: 'heart, mind' },
      { word: '夢', reading: 'ゆめ', meaning: 'dream' },
      { word: '涙', reading: 'なみだ', meaning: 'tears' },
    ],
    grammar: [
      { point: '〜ために', explanation: '"In order to / for the sake of." Use the dictionary form of a verb before ために.', example: '夢のためにがんばる。', exampleEn: 'I work hard for my dream.' },
      { point: '〜わけじゃない', explanation: 'Softly denies a likely assumption: "it\'s not that…". Common in emotional, reflective speech.', example: 'きらいなわけじゃない。', exampleEn: "It's not that I hate it." },
      { point: '〜だろう', explanation: 'Expresses conjecture or musing — "probably / I wonder". Less certain and more poetic than でしょう.', example: '本当の幸せは何だろう。', exampleEn: 'I wonder what real happiness is.' },
    ],
  },
  {
    id: 'cruel-angel-thesis',
    title: '残酷な天使のテーゼ',
    titleReading: 'ざんこくなてんしのテーゼ',
    titleRomaji: 'Zankoku na Tenshi no Tēze',
    titleEn: "A Cruel Angel's Thesis",
    artist: '高橋洋子 (Yoko Takahashi)',
    anime: 'Neon Genesis Evangelion — opening theme',
    year: 1995,
    level: 'N3',
    about:
      'The iconic, driving Evangelion opening. The title alone is a vocabulary lesson: 残酷 (cruel) + 天使 (angel) + テーゼ ("thesis", from German *These*). Strong for dramatic vocabulary and the command form (〜なれ).',
    phrases: [
      {
        line: [
          { w: '天使', r: 'てんし', g: 'angel' }, { w: 'の' }, { w: 'ように' }, { w: '優しい', r: 'やさしい', g: 'kind' }, { w: '。' },
        ],
        en: 'Kind, like an angel.',
        note: '〜のように = "like / as". Noun + のように + adjective.',
      },
      {
        line: [
          { w: '少年', r: 'しょうねん', g: 'boy, youth' }, { w: 'よ' }, { w: '、' }, { w: '大人', r: 'おとな', g: 'adult' }, { w: 'に' }, { w: 'なれ' }, { w: '。' },
        ],
        en: 'Young man — become an adult!',
        note: 'なれ is the plain command form of なる (to become). よ after a noun is a dramatic call.',
      },
      {
        line: [
          { w: '高くても', r: 'たかくても', g: 'even if expensive' }, { w: 'この' }, { w: '本', r: 'ほん', g: 'book' }, { w: 'を' }, { w: '買います', r: 'かいます', g: 'buy' }, { w: '。' },
        ],
        en: "Even if it's expensive, I'll buy this book.",
        note: 'い-adjective: drop い → くても = "even if…".',
      },
    ],
    vocab: [
      { word: '残酷', reading: 'ざんこく', meaning: 'cruel, brutal' },
      { word: '天使', reading: 'てんし', meaning: 'angel' },
      { word: '少年', reading: 'しょうねん', meaning: 'boy, young man' },
      { word: '神話', reading: 'しんわ', meaning: 'myth, legend' },
      { word: '運命', reading: 'うんめい', meaning: 'fate, destiny' },
      { word: '風', reading: 'かぜ', meaning: 'wind' },
      { word: '胸', reading: 'むね', meaning: 'chest, heart' },
      { word: '目覚める', reading: 'めざめる', meaning: 'to awaken' },
    ],
    grammar: [
      { point: '〜のように', explanation: '"Like / as." Compares one thing to another: NOUN のように.', example: '天使のように優しい。', exampleEn: 'Kind like an angel.' },
      { point: 'Command form 〜なれ', explanation: 'The plain imperative. For る/う verbs like なる it becomes なれ — blunt and forceful, common in song titles and slogans.', example: '大人になれ。', exampleEn: 'Become an adult!' },
      { point: '〜ても (even if)', explanation: 'Concession: "even if / even though". い-adj → くても, verbs → て-form + も.', example: '高くても買う。', exampleEn: 'Even if it\'s expensive, I\'ll buy it.' },
    ],
  },
  {
    id: 'my-will',
    title: 'My Will',
    titleRomaji: 'My Will',
    titleEn: 'My Will',
    artist: 'dream',
    anime: 'Inuyasha — first ending theme',
    year: 2000,
    level: 'N4',
    about:
      'A gentle, wistful ballad about honest feelings and quietly wanting to stay beside someone. Perfect for soft, everyday emotional vocabulary and the 〜たい ("want to") pattern.',
    phrases: [
      {
        line: [
          { w: '君', r: 'きみ', g: 'you' }, { w: 'の' }, { w: 'そば' }, { w: 'に' }, { w: 'いたい' }, { w: '。' },
        ],
        en: 'I want to be by your side.',
        note: 'いる → いたい. Verb stem + たい = "want to (do)".',
      },
      {
        line: [
          { w: 'こんな' }, { w: '気持ち', r: 'きもち', g: 'feeling' }, { w: 'に' }, { w: 'なる' }, { w: 'なんて' }, { w: '。' },
        ],
        en: 'To think I would feel this way…',
        note: '〜なんて expresses surprise or disbelief about the thing before it.',
      },
      {
        line: [
          { w: '君', r: 'きみ', g: 'you' }, { w: 'の' }, { w: '笑顔', r: 'えがお', g: 'smile' }, { w: 'を' }, { w: '守りたい', r: 'まもりたい', g: 'want to protect' }, { w: 'から' }, { w: '。' },
        ],
        en: 'Because I want to protect your smile.',
        note: '守る → 守りたい (want to protect); 〜から = "because".',
      },
    ],
    vocab: [
      { word: '気持ち', reading: 'きもち', meaning: 'feeling, mood' },
      { word: '素直', reading: 'すなお', meaning: 'honest, frank, obedient' },
      { word: '笑顔', reading: 'えがお', meaning: 'smiling face' },
      { word: '優しい', reading: 'やさしい', meaning: 'kind, gentle' },
      { word: '信じる', reading: 'しんじる', meaning: 'to believe, to trust' },
      { word: '守る', reading: 'まもる', meaning: 'to protect' },
      { word: '君', reading: 'きみ', meaning: 'you (familiar)' },
    ],
    grammar: [
      { point: 'Verb stem + たい', explanation: 'Expresses the speaker\'s desire: "want to (do)". Drop ます and add たい.', example: '君のそばにいたい。', exampleEn: 'I want to be by your side.' },
      { point: '〜なんて', explanation: 'Marks the preceding idea as surprising, unexpected, or sometimes dismissive.', example: 'こんな気持ちになるなんて。', exampleEn: 'To think I\'d feel this way…' },
      { point: '〜から (because)', explanation: 'States a reason. Comes after the reason clause: REASON から, RESULT.', example: '君が好きだから。', exampleEn: 'Because I like you.' },
    ],
  },
]
