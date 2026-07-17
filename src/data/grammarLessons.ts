// Curated grammar lessons. Clicking a grammar point anywhere in the app looks
// up a lesson here (by normalized pattern); items without a curated lesson fall
// back to an auto-lesson built from the clicked note itself.

export interface GrammarExample {
  jp: string
  en: string
}

export interface GrammarLesson {
  /** normalized key, e.g. 'てはいけません' */
  key: string
  /** other normalized spellings that should match this lesson */
  aliases?: string[]
  title: string
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  explanation: string
  formation: string
  examples: GrammarExample[]
  note?: string
}

/** Strip 〜/～, whitespace, ASCII annotations and trailing punctuation so
 *  「〜てはいけません (rule)」 matches 'てはいけません'. */
export function normalizePoint(point: string): string {
  return point
    .replace(/[〜～]/g, '')
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/[a-zA-Z0-9''".,:;!?/-]+/g, '')
    .replace(/\s+/g, '')
    .trim()
}

export function findLesson(point: string): GrammarLesson | null {
  const n = normalizePoint(point)
  if (!n) return null
  for (const l of LESSONS) {
    if (l.key === n || l.aliases?.includes(n)) return l
  }
  // fuzzy: the normalized point contains a lesson key (or vice versa)
  let best: GrammarLesson | null = null
  for (const l of LESSONS) {
    if (n.includes(l.key) || l.key.includes(n)) {
      if (!best || l.key.length > best.key.length) best = l
    }
  }
  return best
}

export const LESSONS: GrammarLesson[] = [
  // ---------------- N5 particles & basics ----------------
  {
    key: 'は',
    aliases: ['はが', 'topicは'],
    title: 'は — the topic particle',
    level: 'N5',
    explanation:
      'は marks the topic — what the sentence is about. It is written は but pronounced わ. The rest of the sentence is a comment about the topic.',
    formation: '[topic] は + comment',
    examples: [
      { jp: 'わたしは 学生です。', en: 'I am a student.' },
      { jp: 'これは わたしの ペンです。', en: 'This is my pen.' },
      { jp: '日本は きれいな 国です。', en: 'Japan is a beautiful country.' },
    ],
    note: 'Compare が, which marks the grammatical subject and often introduces new information.',
  },
  {
    key: 'を',
    title: 'を — the object particle',
    level: 'N5',
    explanation:
      'を marks the direct object — the thing the verb acts on. It is pronounced お.',
    formation: '[noun] を + [verb]',
    examples: [
      { jp: '本を 読みます。', en: 'I read a book.' },
      { jp: 'コーヒーを のみます。', en: 'I drink coffee.' },
      { jp: 'まどを あけてください。', en: 'Please open the window.' },
    ],
  },
  {
    key: 'にへ',
    aliases: ['に', 'へ'],
    title: 'に / へ — direction and location',
    level: 'N5',
    explanation:
      'Both mark a destination with motion verbs (行く, 来る, 帰る); へ emphasizes direction, に the endpoint. に also marks the location of existence with あります/います, and points in time.',
    formation: '[place] に/へ + motion verb · [place] に あります/います · [time] に',
    examples: [
      { jp: 'がっこうへ 行きます。', en: 'I go to school.' },
      { jp: 'つくえの 上に 本が あります。', en: 'There is a book on the desk.' },
      { jp: '七時に おきます。', en: 'I get up at seven.' },
    ],
  },
  {
    key: 'で',
    title: 'で — place of action / means',
    level: 'N5',
    explanation:
      'で marks where an action happens, or the tool/means used to do it.',
    formation: '[place] で + action verb · [tool] で + verb',
    examples: [
      { jp: 'としょかんで べんきょうします。', en: 'I study at the library.' },
      { jp: 'でんしゃで 行きます。', en: 'I go by train.' },
      { jp: 'はしで 食べます。', en: 'I eat with chopsticks.' },
    ],
  },
  {
    key: 'と',
    aliases: ['とと'],
    title: 'と — "with" and "and"',
    level: 'N5',
    explanation:
      'と joins nouns ("A and B") and marks the person you do something together with.',
    formation: '[noun] と [noun] · [person] と + verb',
    examples: [
      { jp: 'パンと たまごを 買いました。', en: 'I bought bread and eggs.' },
      { jp: 'ともだちと えいがを 見ます。', en: 'I watch a movie with a friend.' },
    ],
  },
  {
    key: 'ましたます',
    aliases: ['ました', 'ます'],
    title: 'ます / ました — polite present and past',
    level: 'N5',
    explanation:
      'The 〜ます form is the polite non-past ("do / will do"); 〜ました is its past ("did"). Negatives are 〜ません and 〜ませんでした.',
    formation: 'verb stem + ます / ました / ません / ませんでした',
    examples: [
      { jp: 'まいにち 走ります。', en: 'I run every day.' },
      { jp: 'きのう えいがを 見ました。', en: 'I watched a movie yesterday.' },
      { jp: 'あさごはんを 食べませんでした。', en: 'I did not eat breakfast.' },
    ],
  },
  {
    key: 'てください',
    title: '〜てください — polite requests',
    level: 'N5',
    explanation:
      'The て-form of a verb + ください makes a polite request. The negative request is 〜ないでください.',
    formation: 'verb て-form + ください',
    examples: [
      { jp: 'まどを あけてください。', en: 'Please open the window.' },
      { jp: 'ゆっくり 話してください。', en: 'Please speak slowly.' },
      { jp: 'ここで しゃしんを とらないでください。', en: 'Please do not take photos here.' },
    ],
  },
  {
    key: 'ています',
    aliases: ['ている'],
    title: '〜ている — ongoing action and states',
    level: 'N5',
    explanation:
      '〜ている expresses an action in progress ("is doing") or a continuing state/result ("is married", "knows"). Context decides which.',
    formation: 'verb て-form + いる/います',
    examples: [
      { jp: 'いま ごはんを 食べています。', en: 'I am eating right now.' },
      { jp: 'とうきょうに すんでいます。', en: 'I live in Tokyo.' },
      { jp: 'まどが あいています。', en: 'The window is open.' },
    ],
  },
  {
    key: 'たい',
    aliases: ['たいです'],
    title: '〜たい — wanting to do',
    level: 'N5',
    explanation:
      'Attach たい to a verb stem to say you want to do something. It conjugates like an い-adjective (たくない, たかった).',
    formation: 'verb stem + たい(です)',
    examples: [
      { jp: '日本へ 行きたいです。', en: 'I want to go to Japan.' },
      { jp: 'なにも 食べたくない。', en: 'I do not want to eat anything.' },
      { jp: 'ずっと 会いたかった。', en: 'I wanted to see you for so long.' },
    ],
  },
  {
    key: 'たかったからです',
    aliases: ['からです', 'から'],
    title: '〜から / 〜からです — giving reasons',
    level: 'N5',
    explanation:
      'から after a clause means "because". Ending an answer with 〜からです ("it\'s because…") directly answers a why-question; 〜たかったからです adds past desire: "because I wanted to…".',
    formation: '[reason clause] から · [reason clause] からです',
    examples: [
      { jp: 'あついですから、まどを あけます。', en: 'Because it is hot, I will open the window.' },
      { jp: 'どうして 行きましたか。— 友だちに 会いたかったからです。', en: 'Why did you go? — Because I wanted to see my friend.' },
    ],
  },
  {
    key: 'ましょう',
    title: '〜ましょう — "let\'s…"',
    level: 'N5',
    explanation:
      '〜ましょう proposes doing something together; 〜ましょうか offers to do something for someone or asks "shall we?".',
    formation: 'verb stem + ましょう(か)',
    examples: [
      { jp: 'いっしょに 帰りましょう。', en: "Let's go home together." },
      { jp: 'てつだいましょうか。', en: 'Shall I help you?' },
    ],
  },
  {
    key: 'ないでください',
    title: '〜ないでください — "please don\'t"',
    level: 'N5',
    explanation: 'The negative て-request: ない-form + でください asks someone not to do something.',
    formation: 'verb ない-form + でください',
    examples: [
      { jp: 'ここに 入らないでください。', en: 'Please do not enter here.' },
      { jp: 'わすれないでください。', en: 'Please do not forget.' },
    ],
  },
  {
    key: 'になるくなる',
    aliases: ['になる', 'くなる', 'なる'],
    title: '〜になる / 〜くなる — becoming',
    level: 'N5',
    explanation:
      'なる ("to become") attaches with に after nouns and な-adjectives, and turns い-adjectives\' い into く.',
    formation: '[noun/な-adj] に なる · [い-adj stem] く なる',
    examples: [
      { jp: 'いしゃに なりたいです。', en: 'I want to become a doctor.' },
      { jp: 'そらが くらく なりました。', en: 'The sky got dark.' },
    ],
  },
  // ---------------- N5/N4 from the readings ----------------
  {
    key: 'ていると',
    title: '〜ていると — "while/when doing …"',
    level: 'N4',
    explanation:
      'A 〜ている clause + と describes something discovered or felt during an ongoing action: "when/while I am doing X, Y (happens)". The result is natural or automatic, not chosen.',
    formation: 'verb て-form + いると + [resulting clause]',
    examples: [
      { jp: '金魚を 見ていると、時間を わすれます。', en: 'When I watch the goldfish, I lose track of time.' },
      { jp: '音楽を 聞いていると、ねむく なります。', en: 'When I listen to music, I get sleepy.' },
    ],
  },
  {
    key: 'に合わせて',
    title: '〜に合わせて — "in time with, matching"',
    level: 'N4',
    explanation:
      '合わせる means "to match". 〜に合わせて means doing something in coordination with something else — music, a schedule, another person.',
    formation: '[noun] に合わせて + action',
    examples: [
      { jp: '音楽に合わせて おどります。', en: 'We dance in time with the music.' },
      { jp: 'あなたの 予定に合わせて 行きます。', en: "I'll come whenever suits your schedule." },
    ],
  },
  {
    key: '気がする',
    title: '〜気がする — "to have a feeling that…"',
    level: 'N4',
    explanation:
      '気がする expresses a subjective hunch or sense: "I feel like / I have the feeling that". Weaker and more intuitive than と思う.',
    formation: '[plain clause] 気がする',
    examples: [
      { jp: '少し 大人になった気がしました。', en: 'I felt like I had grown up a little.' },
      { jp: 'だれかに 見られている気がする。', en: 'I have the feeling someone is watching me.' },
    ],
  },
  {
    key: 'てあります',
    aliases: ['てある'],
    title: '〜てある — a state someone left behind',
    level: 'N4',
    explanation:
      '〜てある describes a state that exists because somebody did something on purpose: the door has been left open, a name is written. The doer is implied, not stated. Compare 〜ている, which just describes the state.',
    formation: 'transitive verb て-form + ある/あります',
    examples: [
      { jp: '首輪に 名前が 書いてあります。', en: 'A name is written on the collar (someone wrote it).' },
      { jp: 'まどが あけてあります。', en: 'The window has been (deliberately) left open.' },
    ],
  },
  {
    key: 'てくれる',
    aliases: ['てくれました'],
    title: '〜てくれる — kindness toward me',
    level: 'N4',
    explanation:
      'くれる after a て-form marks the action as done FOR the speaker (or the speaker\'s group) as a favor. The giver is the subject. Its polite past 〜てくれました is very common in storytelling.',
    formation: '[giver] が/は + verb て-form + くれる',
    examples: [
      { jp: '父が むかしの 話を してくれました。', en: 'My father told us stories (for us).' },
      { jp: '駅員さんが 手伝ってくれた。', en: 'The station attendant helped me out.' },
    ],
    note: 'The set: あげる (I do for others), くれる (someone does for me), もらう (I receive the favor).',
  },
  {
    key: 'てきました',
    aliases: ['てくる'],
    title: '〜てくる — change arriving / coming on',
    level: 'N4',
    explanation:
      'て-form + くる marks something beginning, approaching, or developing toward the speaker in time or space: 降ってきた "it started to rain", 見えてきた "came into view".',
    formation: 'verb て-form + くる/きました',
    examples: [
      { jp: '急に 雨が ふってきました。', en: 'It suddenly started to rain.' },
      { jp: '日本語が わかるように なってきた。', en: 'I have gradually come to understand Japanese.' },
    ],
  },
  {
    key: 'おかげで',
    title: '〜のおかげで — "thanks to …"',
    level: 'N3',
    explanation:
      'おかげ ("indebtedness, favor") + で credits a good result to someone or something. For negative results, 〜のせいで is used instead.',
    formation: '[noun] のおかげで · [plain clause] おかげで',
    examples: [
      { jp: '親切の おかげで、間に合いました。', en: 'Thanks to his kindness, I made it in time.' },
      { jp: '先生の おかげで 合格できた。', en: 'I passed thanks to my teacher.' },
    ],
  },
  {
    key: 'てはいけません',
    aliases: ['てはいけない'],
    title: '〜てはいけない — prohibition',
    level: 'N5',
    explanation:
      'て-form + はいけません states that something is not allowed — rules, warnings, and the classic fairy-tale interdiction.',
    formation: 'verb て-form + は いけません/いけない/だめ',
    examples: [
      { jp: 'この 箱を あけてはいけません。', en: 'You must not open this box.' },
      { jp: '湯船に タオルを 入れてはいけません。', en: 'You must not put your towel in the bathtub.' },
    ],
  },
  {
    key: 'まま',
    title: '〜まま — an unchanged state',
    level: 'N4',
    explanation:
      'まま means something stays as it is while something else happens (or fails to happen): "with the TV still on", "stayed small as he was".',
    formation: 'verb た-form/ない-form + まま · [noun] のまま · [adj] まま',
    examples: [
      { jp: '体は 小さいままでした。', en: 'His body stayed small.' },
      { jp: 'テレビを つけたまま ねてしまった。', en: 'I fell asleep with the TV still on.' },
    ],
  },
  {
    key: 'のに',
    title: '〜のに — "even though" (with feeling)',
    level: 'N4',
    explanation:
      'のに links two clauses where the second defies the expectation set by the first, with a tinge of surprise, regret, or complaint — stronger emotionally than けれど.',
    formation: '[plain clause] のに + [unexpected result]',
    examples: [
      { jp: '大みそかなのに、お金が ありません。', en: "Even though it's New Year's Eve, they have no money." },
      { jp: 'たくさん べんきょうしたのに、しけんに おちた。', en: 'Even though I studied hard, I failed the exam.' },
    ],
  },
  {
    key: 'ほうを選ぶ',
    aliases: ['ほう', 'ほうがいい'],
    title: '〜ほう — comparing and choosing',
    level: 'N4',
    explanation:
      'ほう ("side, direction") singles out one of two alternatives: 小さいほう "the smaller one". 〜たほうがいい gives advice: "you had better…".',
    formation: '[adj/verb] ほう · verb た-form + ほうがいい',
    examples: [
      { jp: 'おじいさんは 小さいほうを えらびました。', en: 'The old man chose the smaller one.' },
      { jp: 'はやく ねたほうが いいですよ。', en: 'You had better go to bed early.' },
    ],
  },
  {
    key: 'らしい',
    title: '〜らしい — "typical of" and hearsay',
    level: 'N3',
    explanation:
      'After a noun, らしい means "just like / worthy of the name": 日本らしい夜 "a very Japanese night". After a clause it reports hearsay: "apparently, it seems".',
    formation: '[noun] らしい · [plain clause] らしい',
    examples: [
      { jp: 'とても 日本らしい 夜です。', en: 'It is a very Japanese sort of night.' },
      { jp: 'あの 店は 来月 しまるらしい。', en: 'Apparently that shop closes next month.' },
    ],
  },
  {
    key: 'と条件',
    aliases: ['と発見', 'とdiscovery', 'と条件形'],
    title: '〜と — natural consequence / discovery',
    level: 'N4',
    explanation:
      'A plain non-past clause + と states that whenever the first thing happens, the second naturally follows — laws of nature, machines, directions — or marks a discovery upon doing something.',
    formation: '[plain non-past clause] と + [result]',
    examples: [
      { jp: '春に なると、さくらが さきます。', en: 'When spring comes, the cherry trees bloom.' },
      { jp: '旅館に とまると、和食の 朝ご飯が 出てきます。', en: 'When you stay at an inn, a Japanese breakfast is served.' },
      { jp: '戸を あけると、米や もちが おいてありました。', en: 'When he opened the door, he found rice and mochi left there.' },
    ],
  },
  {
    key: 'から生まれた',
    aliases: ['から作られた'],
    title: '〜から — origin and material',
    level: 'N4',
    explanation:
      'から marks a source or origin: where something comes from, what it was made or born from (when the material is transformed beyond recognition).',
    formation: '[source noun] から + 生まれる/作られる/できる',
    examples: [
      { jp: 'かなは 漢字から 生まれました。', en: 'Kana were born from kanji.' },
      { jp: 'この さけは 米から つくられます。', en: 'This sake is made from rice.' },
    ],
  },
  {
    key: 'かけて',
    aliases: ['にかけて'],
    title: '〜(を)かけて — over a span of time',
    level: 'N3',
    explanation:
      '時間をかけて emphasizes the duration a process takes: "taking two months". AからBにかけて spans a range in time or space.',
    formation: '[duration] (を)かけて · AからBにかけて',
    examples: [
      { jp: '桜前線は 二か月かけて 日本を 旅します。', en: 'The cherry-blossom front travels Japan over two months.' },
      { jp: '今夜から あしたの朝にかけて、雪が ふるでしょう。', en: 'Snow will fall from tonight into tomorrow morning.' },
    ],
  },
  {
    key: 'ながら',
    title: '〜ながら — doing two things at once',
    level: 'N4',
    explanation:
      'Verb stem + ながら expresses two simultaneous actions by the same person; the main action comes second.',
    formation: 'verb stem + ながら + [main action]',
    examples: [
      { jp: '電話を しながら お辞儀を します。', en: 'They bow while talking on the phone.' },
      { jp: '音楽を 聞きながら べんきょうします。', en: 'I study while listening to music.' },
    ],
  },
  {
    key: 'かわりに',
    title: '〜かわりに — "instead of / in exchange"',
    level: 'N3',
    explanation:
      'かわり ("substitute") + に marks a replacement or a trade-off: "instead of doors there are fusuma"; "I\'ll cook, and in exchange you wash up".',
    formation: '[noun] のかわりに · [plain clause] かわりに',
    examples: [
      { jp: 'ドアの かわりに、ふすまが あります。', en: 'Instead of doors, there are fusuma.' },
      { jp: 'わたしが 作るかわりに、あなたが あらってください。', en: "I'll cook; in exchange, you do the dishes." },
    ],
  },
  {
    key: 'ごとに',
    title: '〜ごとに — "each and every"',
    level: 'N3',
    explanation: 'ごとに attaches to nouns and counters: "every region", "every three hours".',
    formation: '[noun/number+counter] ごとに',
    examples: [
      { jp: '土地ごとに 名物が あります。', en: 'Every region has its own specialty.' },
      { jp: '三時間ごとに くすりを のみます。', en: 'I take the medicine every three hours.' },
    ],
  },
  {
    key: 'ても',
    title: '〜ても — "even if / even though"',
    level: 'N4',
    explanation:
      'て-form + も concedes something: "even if X, still Y". With question words (いくら、どんなに) it means "no matter how much".',
    formation: 'verb/adj て-form + も',
    examples: [
      { jp: '安くても 品質が いいです。', en: "Even though it's cheap, the quality is good." },
      { jp: 'いくら 高くても、ひつような ものは 買う。', en: 'No matter how expensive it is, I buy what I need.' },
    ],
  },
  {
    key: 'なら',
    title: '〜なら — "if it\'s X (you mean)…"',
    level: 'N4',
    explanation:
      'なら takes up something just mentioned or assumed as the topic of a conditional: "if it\'s Hokkaido (we\'re talking about), then crab". Often used to give advice keyed to the listener\'s situation.',
    formation: '[noun/plain clause] なら + [comment/advice]',
    examples: [
      { jp: '北海道なら かにです。', en: "If it's Hokkaido, it's crab." },
      { jp: '日本語を ならうなら、この アプリが いいですよ。', en: "If you're going to learn Japanese, this app is good." },
    ],
  },
  {
    key: 'ようとする',
    title: '〜ようとする — trying / about to',
    level: 'N3',
    explanation:
      'The volitional form + とする expresses attempting something or being on the verge of it. 話そうとする気持ち = "the intent to (try to) speak".',
    formation: 'verb volitional (〜よう/〜おう) + とする',
    examples: [
      { jp: 'ていねいに 話そうとする 気持ちが 大切です。', en: 'What matters is trying to speak politely.' },
      { jp: '出かけようとした とき、電話が 鳴った。', en: 'Just as I was about to leave, the phone rang.' },
    ],
  },
  {
    key: 'と呼ばれる',
    aliases: ['と呼ばれています'],
    title: '〜と呼ばれる — "is called …"',
    level: 'N3',
    explanation:
      'The passive of 呼ぶ ("to call") reports an established name or reputation: "is called the seven-minute miracle".',
    formation: '[name] と呼ばれる/呼ばれている',
    examples: [
      { jp: '「七分間の奇跡」と 呼ばれています。', en: 'It is called "the seven-minute miracle."' },
      { jp: '富士山は 日本一の 山と 呼ばれる。', en: "Mt. Fuji is called Japan's greatest mountain." },
    ],
  },
  // ---------------- N4/N3 core from quizzes ----------------
  {
    key: 'ようになる',
    aliases: ['ようになりました'],
    title: '〜ようになる — a change that came about',
    level: 'N4',
    explanation:
      'ようになる marks a gradual change of state or ability: something that didn\'t happen before now does. With potential verbs: "came to be able to".',
    formation: 'verb dictionary/potential form + ようになる',
    examples: [
      { jp: '日本語が 話せるように なりました。', en: 'I have come to be able to speak Japanese.' },
      { jp: 'まいあさ 走るように なった。', en: 'I now run every morning (a new habit).' },
    ],
  },
  {
    key: 'かどうか',
    title: '〜かどうか — "whether or not"',
    level: 'N4',
    explanation:
      'かどうか embeds a yes/no question inside a sentence: "I don\'t know whether I can read this kanji or not".',
    formation: '[plain clause] かどうか + わからない/しらべる/きく…',
    examples: [
      { jp: 'この 漢字が 読めるかどうか わかりません。', en: "I don't know whether I can read this kanji." },
      { jp: '行くかどうか、まだ きめていません。', en: "I haven't decided whether to go." },
    ],
  },
  {
    key: 'ておく',
    aliases: ['ておきました'],
    title: '〜ておく — doing in advance',
    level: 'N4',
    explanation:
      'て-form + おく means doing something ahead of time for a future purpose, or leaving something in a state. Casually contracts to 〜とく.',
    formation: 'verb て-form + おく',
    examples: [
      { jp: 'へやを きれいに しておきました。', en: 'I tidied the room in advance.' },
      { jp: 'ホテルを よやくしておこう。', en: "Let's book the hotel ahead of time." },
    ],
  },
  {
    key: 'られる受身',
    aliases: ['よばれました', 'られる', '受身'],
    title: '受身 〜られる — the passive',
    level: 'N4',
    explanation:
      'The passive puts the receiver of an action in the subject slot: 呼ばれる "be called", 食べられる "be eaten". Japanese also uses it for adversity ("I got rained on") and neutral reporting.',
    formation: 'godan: 〜あれる (よぶ→よばれる) · ichidan: 〜られる (たべる→たべられる)',
    examples: [
      { jp: '先生に 名前を よばれました。', en: 'My name was called by the teacher.' },
      { jp: '雨に ふられて、ぬれてしまった。', en: 'I got rained on and ended up soaked.' },
    ],
  },
  {
    key: 'ば',
    aliases: ['ばあれば', 'あれば'],
    title: '〜ば — the "if" conditional',
    level: 'N4',
    explanation:
      'The ば-form states a logical condition: "if X, then Y". It focuses on the condition itself and is common in proverbs and general truths.',
    formation: 'godan: 〜えば (あう→あえば) · ichidan: 〜れば · い-adj: 〜ければ',
    examples: [
      { jp: 'お金が あれば、りょこうします。', en: 'If I have money, I will travel.' },
      { jp: 'いそげば、間に合いますよ。', en: 'If you hurry, you will make it.' },
    ],
  },
  {
    key: 'たことがある',
    title: '〜たことがある — past experience',
    level: 'N4',
    explanation:
      'た-form + ことがある states that you have had the experience of doing something at least once.',
    formation: 'verb た-form + ことが ある/あります',
    examples: [
      { jp: '日本へ 行ったことが あります。', en: 'I have been to Japan.' },
      { jp: 'うなぎを 食べたことが ありません。', en: 'I have never eaten eel.' },
    ],
  },
  {
    key: 'にとって',
    title: '〜にとって — "for / from the standpoint of"',
    level: 'N3',
    explanation:
      'にとって frames a judgment from someone\'s point of view: what something means *for* them. Usually followed by an evaluation (むずかしい, 大切だ).',
    formation: '[person/group] にとって + evaluation',
    examples: [
      { jp: 'この 仕事は 私にとって むずかしすぎる。', en: 'This job is too difficult for me.' },
      { jp: 'ことばは 学習者にとって 一番の 道具だ。', en: 'Language is the learner\'s best tool.' },
    ],
  },
  {
    key: 'によると',
    title: '〜によると — "according to …"',
    level: 'N3',
    explanation:
      'によると cites an information source; the sentence typically ends with hearsay そうだ or らしい.',
    formation: '[source] によると、… そうだ/らしい',
    examples: [
      { jp: '天気予報によると、あしたは 雨だそうです。', en: 'According to the forecast, it will rain tomorrow.' },
      { jp: '店主によると、本を えらぶ 時間を 楽しむ人が へったそうだ。', en: 'According to the owner, fewer people enjoy the time spent choosing books.' },
    ],
  },
  {
    key: 'ばほど',
    aliases: ['ばーほど', 'ば〜ほど'],
    title: '〜ば〜ほど — "the more …, the more …"',
    level: 'N3',
    explanation:
      'Repeat the verb in ば-form and dictionary form + ほど: as one thing increases, so does the other.',
    formation: 'verb ば-form + same verb dictionary form + ほど',
    examples: [
      { jp: 'べんきょうすれば するほど、力が つく。', en: 'The more you study, the stronger you get.' },
      { jp: '漢字は 書けば 書くほど おぼえられる。', en: 'The more you write kanji, the better you remember them.' },
    ],
  },
  {
    key: 'にもかかわらず',
    title: '〜にもかかわらず — "despite"',
    level: 'N2',
    explanation:
      'A formal connective: something happened in defiance of the circumstance stated first. Stiffer than のに, common in writing and news.',
    formation: '[noun/plain clause] にもかかわらず',
    examples: [
      { jp: '雨にもかかわらず、しあいは 行われた。', en: 'Despite the rain, the match was held.' },
      { jp: 'どりょくにもかかわらず、しっぱいした。', en: 'Despite the effort, it failed.' },
    ],
  },
  {
    key: 'たりたり',
    aliases: ['たり'],
    title: '〜たり〜たり — listing example actions',
    level: 'N5',
    explanation:
      'た-form + り lists representative activities among others ("things like reading and swimming"), ending with する.',
    formation: 'verb た-form + り、verb た-form + り + する',
    examples: [
      { jp: '週末は 本を 読んだり、およいだり します。', en: 'On weekends I do things like reading and swimming.' },
      { jp: '雨の日は そうじを したり、りょうりを したり する。', en: 'On rainy days I clean, cook, and so on.' },
    ],
  },
  {
    key: 'てしまう',
    aliases: ['てしまいました', 'ちゃう'],
    title: '〜てしまう — completion and regret',
    level: 'N4',
    explanation:
      'て-form + しまう marks an action as completely finished — often with regret or "oops" when unintended. Casually contracts to 〜ちゃう/〜じゃう.',
    formation: 'verb て-form + しまう',
    examples: [
      { jp: '太郎は おじいさんに なってしまいました。', en: 'Tarō ended up an old man.' },
      { jp: 'ケーキを 全部 食べてしまった。', en: 'I ate the whole cake (oops).' },
    ],
  },
  {
    key: 'そうだ',
    aliases: ['そうです'],
    title: '〜そうだ — hearsay vs. appearance',
    level: 'N4',
    explanation:
      'Two different patterns share this shape. Plain clause + そうだ reports hearsay ("I hear that…"). Verb stem/adj stem + そうだ describes appearance ("looks like it will rain").',
    formation: 'hearsay: [plain clause] そうだ · appearance: [stem] そうだ',
    examples: [
      { jp: '駅前の 本屋が 閉店するそうだ。', en: 'I hear the bookshop by the station is closing.' },
      { jp: '雨が ふりそうです。', en: 'It looks like it is about to rain.' },
    ],
  },
  {
    key: 'かもしれない',
    aliases: ['かもしれません'],
    title: '〜かもしれない — "might"',
    level: 'N4',
    explanation:
      'かもしれない expresses possibility without commitment — weaker than でしょう. Attaches to plain forms and nouns directly.',
    formation: '[plain clause/noun] かもしれない/かもしれません',
    examples: [
      { jp: 'まわりの 人が いやな 顔を するかもしれません。', en: 'People around you might make an unhappy face.' },
      { jp: 'あしたは 雪かもしれない。', en: 'It might snow tomorrow.' },
    ],
  },
  {
    key: 'なければならない',
    aliases: ['なければなりません', 'なきゃ'],
    title: '〜なければならない — obligation',
    level: 'N4',
    explanation:
      'Literally "if you don\'t do it, it won\'t do": the standard way to say "must". Casual contractions: 〜なきゃ, 〜ないと.',
    formation: 'verb ない-stem + なければ ならない/なりません',
    examples: [
      { jp: '電話に 出なければならない 時も ある。', en: 'Sometimes you simply must answer the phone.' },
      { jp: 'もう 帰らなければ なりません。', en: 'I have to go home now.' },
    ],
  },
  {
    key: 'すぎる',
    title: '〜すぎる — "too much"',
    level: 'N5',
    explanation:
      'すぎる attaches to verb and adjective stems to mean excess: 食べすぎる "eat too much", 高すぎる "too expensive".',
    formation: 'verb/adj stem + すぎる',
    examples: [
      { jp: 'この 仕事は 私にとって むずかしすぎる。', en: 'This job is too difficult for me.' },
      { jp: 'きのうは 食べすぎました。', en: 'I ate too much yesterday.' },
    ],
  },
]
