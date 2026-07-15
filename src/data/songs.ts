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

  // --- Public-domain traditional songs: lyrics are out of copyright and bundled ---
  {
    id: 'sakura-sakura',
    title: 'さくらさくら',
    titleReading: 'さくらさくら',
    titleRomaji: 'Sakura Sakura',
    titleEn: 'Cherry Blossoms',
    artist: 'Traditional (public domain)',
    anime: 'Traditional Japanese folk song',
    year: 1888,
    level: 'N5',
    publicDomain: true,
    credit: 'Traditional Japanese folk song (Edo period). Lyrics in the public domain.',
    about:
      'Japan\'s most famous cherry-blossom song, played on the koto since the Edo period. Mostly kana with a few gentle nature kanji — a perfect first song to read.',
    lyrics: [
      'さくら さくら',
      '野山も里も',
      '見わたすかぎり',
      'かすみか雲か',
      '朝日ににおう',
      'さくら さくら',
      '花ざかり',
    ].join('\n'),
    vocab: [
      { word: '野山', reading: 'のやま', meaning: 'hills and fields' },
      { word: '里', reading: 'さと', meaning: 'village, hometown' },
      { word: '見わたす', reading: 'みわたす', meaning: 'to look out over' },
      { word: '霞', reading: 'かすみ', meaning: 'haze, mist' },
      { word: '雲', reading: 'くも', meaning: 'cloud' },
      { word: '朝日', reading: 'あさひ', meaning: 'morning sun' },
      { word: '花ざかり', reading: 'はなざかり', meaning: 'full bloom' },
    ],
    grammar: [
      { point: '〜か〜か', explanation: 'Lists alternatives — "is it A or B?". かすみか雲か = "haze or clouds?".', example: 'かすみか雲か。', exampleEn: 'Is it haze, or clouds?' },
      { point: '〜かぎり', explanation: '"As far as / as long as." 見わたすかぎり = "as far as the eye can see".', example: '見わたすかぎり。', exampleEn: 'As far as one can see.' },
    ],
  },
  {
    id: 'furusato',
    title: '故郷',
    titleReading: 'ふるさと',
    titleRomaji: 'Furusato',
    titleEn: 'My Old Home',
    artist: 'Tatsuyuki Takano / Teiichi Okano',
    anime: 'Monbushō shōka (school song)',
    year: 1914,
    level: 'N4',
    publicDomain: true,
    credit: 'Lyrics 高野辰之 (1876–1947), melody 岡野貞一 (1878–1941). Public domain.',
    about:
      'A beloved 1914 school song about longing for one\'s childhood countryside. Rich in nostalgic vocabulary — mountains, rivers, parents, and friends. This is the famous first verse.',
    lyrics: [
      '兎追いし かの山',
      '小鮒釣りし かの川',
      '夢は今も めぐりて',
      '忘れがたき 故郷',
    ].join('\n'),
    vocab: [
      { word: '兎', reading: 'うさぎ', meaning: 'rabbit' },
      { word: '追う', reading: 'おう', meaning: 'to chase' },
      { word: '小鮒', reading: 'こぶな', meaning: 'small crucian carp' },
      { word: '釣る', reading: 'つる', meaning: 'to fish, to catch' },
      { word: '夢', reading: 'ゆめ', meaning: 'dream' },
      { word: 'めぐる', reading: 'めぐる', meaning: 'to go around, to return' },
      { word: '忘れる', reading: 'わすれる', meaning: 'to forget' },
      { word: '故郷', reading: 'ふるさと', meaning: 'hometown, old home' },
    ],
    grammar: [
      { point: 'Verb + し (literary past)', explanation: 'An old literary past-tense ending: 追いし = 追った ("chased"), 釣りし = 釣った ("fished"). Common in classic songs.', example: '兎追いし かの山。', exampleEn: 'The mountain where I chased rabbits.' },
      { point: '〜がたき / 〜がたい', explanation: '"Hard to ~". 忘れがたき = 忘れにくい ("hard to forget").', example: '忘れがたき故郷。', exampleEn: 'The hometown I can hardly forget.' },
    ],
  },
  {
    id: 'haru-ga-kita',
    title: '春が来た',
    titleReading: 'はるがきた',
    titleRomaji: 'Haru ga Kita',
    titleEn: 'Spring Has Come',
    artist: 'Tatsuyuki Takano / Teiichi Okano',
    anime: 'Monbushō shōka (school song)',
    year: 1910,
    level: 'N5',
    publicDomain: true,
    credit: 'Lyrics 高野辰之 (1876–1947), melody 岡野貞一 (1878–1941). Public domain.',
    about:
      'The simplest classic in the songbook — one joyful pattern repeated: spring has come, where has it come? Perfect N5 practice for 来た and location words.',
    lyrics: [
      '春が来た 春が来た どこに来た',
      '山に来た 里に来た 野にも来た',
    ].join('\n'),
    vocab: [
      { word: '春', reading: 'はる', meaning: 'spring' },
      { word: '来る', reading: 'くる', meaning: 'to come (来た = came)' },
      { word: '山', reading: 'やま', meaning: 'mountain' },
      { word: '里', reading: 'さと', meaning: 'village' },
      { word: '野', reading: 'の', meaning: 'field' },
    ],
    grammar: [
      { point: 'どこに来た', explanation: 'どこ (where) + に (location) + 来た (came): "where has it come?" — the song answers with 山に、里に、野に.', example: '春はどこに来た？', exampleEn: 'Where has spring come?' },
      { point: '〜にも', explanation: 'に + も = "also to/in": 野にも来た = "it came to the fields too".', example: '野にも来た。', exampleEn: 'It came to the fields as well.' },
    ],
  },
  {
    id: 'oborozukiyo',
    title: '朧月夜',
    titleReading: 'おぼろづきよ',
    titleRomaji: 'Oborozukiyo',
    titleEn: 'Hazy Moonlit Night',
    artist: 'Tatsuyuki Takano / Teiichi Okano',
    anime: 'Monbushō shōka (school song)',
    year: 1914,
    level: 'N3',
    publicDomain: true,
    credit: 'Lyrics 高野辰之 (1876–1947), melody 岡野貞一 (1878–1941). Public domain.',
    about:
      'A beloved 1914 song painting a spring dusk over rapeseed fields under a hazy moon. Beautiful classical vocabulary — 入日, 山の端, 夕月 — worth learning slowly.',
    lyrics: [
      '菜の花畠に 入日薄れ',
      '見わたす山の端 霞ふかし',
      '春風そよふく 空を見れば',
      '夕月かかりて にほひ淡し',
    ].join('\n'),
    vocab: [
      { word: '菜の花', reading: 'なのはな', meaning: 'rapeseed blossoms' },
      { word: '畠', reading: 'はたけ', meaning: 'field (older form of 畑)' },
      { word: '入日', reading: 'いりひ', meaning: 'setting sun' },
      { word: '山の端', reading: 'やまのは', meaning: 'the edge/ridge of the mountains' },
      { word: '霞', reading: 'かすみ', meaning: 'haze, spring mist' },
      { word: '夕月', reading: 'ゆうづき', meaning: 'the early-evening moon' },
      { word: '淡い', reading: 'あわい', meaning: 'faint, pale' },
    ],
    grammar: [
      { point: 'Classical 〜し ending', explanation: 'ふかし = 深い, 淡し = 淡い — the old adjective ending し survives in songs and poetry.', example: '霞ふかし。', exampleEn: 'The haze lies deep.' },
      { point: '〜ば (classical "when")', explanation: '空を見れば = "when I look at the sky" — in classical style, 〜ば often means "when/upon", not just "if".', example: '空を見れば。', exampleEn: 'When I look up at the sky…' },
    ],
  },
  {
    id: 'kojo-no-tsuki',
    title: '荒城の月',
    titleReading: 'こうじょうのつき',
    titleRomaji: 'Kōjō no Tsuki',
    titleEn: 'The Moon over the Ruined Castle',
    artist: 'Bansui Doi / Rentarō Taki',
    anime: 'Meiji-era art song',
    year: 1901,
    level: 'N3',
    publicDomain: true,
    credit: 'Lyrics 土井晩翠 (1871–1952), melody 滝廉太郎 (1879–1903). Public domain.',
    about:
      'Japan\'s most famous art song (1901) — a haunting meditation on a moonlit castle ruin and vanished glory. Dense, gorgeous classical Japanese; a rewarding N3+ study text.',
    lyrics: [
      '春高楼の 花の宴',
      'めぐる盃 かげさして',
      '千代の松が枝 わけいでし',
      '昔の光 いまいづこ',
    ].join('\n'),
    vocab: [
      { word: '高楼', reading: 'こうろう', meaning: 'high tower, lofty pavilion' },
      { word: '宴', reading: 'うたげ', meaning: 'banquet, feast' },
      { word: '盃', reading: 'さかずき', meaning: 'sake cup' },
      { word: '千代', reading: 'ちよ', meaning: 'a thousand years, ages' },
      { word: '松が枝', reading: 'まつがえ', meaning: 'pine branch (classical)' },
      { word: '昔', reading: 'むかし', meaning: 'the past, long ago' },
      { word: '光', reading: 'ひかり', meaning: 'light, radiance' },
    ],
    grammar: [
      { point: 'いまいづこ', explanation: 'Classical いづこ = どこ. 昔の光いまいづこ = "the light of old — where is it now?" — the song\'s famous refrain.', example: '昔の光 いまいづこ。', exampleEn: 'Where now is the light of long ago?' },
      { point: 'の linking in classical lyric', explanation: 'Strings of の build compressed images: 春高楼の花の宴 = "spring, at the high tower, a banquet of blossoms".', example: '春高楼の花の宴。', exampleEn: 'A blossom banquet at the spring tower.' },
    ],
  },
  {
    id: 'hamabe-no-uta',
    title: '浜辺の歌',
    titleReading: 'はまべのうた',
    titleRomaji: 'Hamabe no Uta',
    titleEn: 'Song of the Seashore',
    artist: 'Kokei Hayashi / Tamezō Narita',
    anime: 'Taishō-era art song',
    year: 1916,
    level: 'N4',
    publicDomain: true,
    credit: 'Lyrics 林古渓 (1875–1947), melody 成田為三 (1893–1945). Public domain.',
    about:
      'A gentle 1916 melody about wandering the morning shore, lost in memories. Lovely nature vocabulary — waves, shells, wind — with a nostalgic classical turn.',
    lyrics: [
      'あした浜辺を さまよへば',
      '昔のことぞ しのばるる',
      '風の音よ 雲のさまよ',
      '寄する波も 貝の色も',
    ].join('\n'),
    vocab: [
      { word: '浜辺', reading: 'はまべ', meaning: 'seashore, beach' },
      { word: 'あした', reading: 'あした', meaning: 'morning (classical); modern: tomorrow' },
      { word: 'さまよう', reading: 'さまよう', meaning: 'to wander' },
      { word: '偲ぶ', reading: 'しのぶ', meaning: 'to recall fondly, to yearn for' },
      { word: '波', reading: 'なみ', meaning: 'wave' },
      { word: '貝', reading: 'かい', meaning: 'shell' },
    ],
    grammar: [
      { point: 'あした = morning', explanation: 'In classical Japanese あした means "morning" (not "tomorrow") — a famous false friend in this song\'s first line.', example: 'あした浜辺をさまよえば。', exampleEn: 'When I wander the shore in the morning…' },
      { point: '〜るる (classical passive)', explanation: 'しのばるる = しのばれる: "(the past) comes fondly to mind" — the classical spontaneous/passive ending るる.', example: '昔のことぞしのばるる。', exampleEn: 'Memories of long ago come drifting back.' },
    ],
  },
]
