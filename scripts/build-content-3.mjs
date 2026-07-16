// Third batch of remote-library readings (original prose; folktales are
// ancient public-domain tales retold in simple Japanese). Writes each to
// content/readings/<id>.json and regenerates content/catalog.json.
//   node scripts/build-content-3.mjs
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const contentDir = join(root, 'content')
const readingsDir = join(contentDir, 'readings')

const READINGS = [
  // ---- stories ----
  {
    id: 'post-office', title: '郵便局で', titleReading: 'ゆうびんきょくで', titleEn: 'At the Post Office',
    level: 'N5', category: 'story', summary: 'Mailing a birthday present to a friend far away.',
    paragraphs: [
      '今日、郵便局へ行きました。友達に誕生日のプレゼントを送りたかったからです。',
      '箱に本とお菓子を入れました。窓口の人が重さをはかって、「三百円です」と言いました。',
      '一週間後、友達から電話が来ました。「プレゼント、ありがとう！」。私はとてもうれしかったです。',
    ],
    vocab: [
      { word: '郵便局', reading: 'ゆうびんきょく', meaning: 'post office' },
      { word: '送る', reading: 'おくる', meaning: 'to send' },
      { word: '箱', reading: 'はこ', meaning: 'box' },
      { word: '窓口', reading: 'まどぐち', meaning: 'service window, counter' },
      { word: '重さ', reading: 'おもさ', meaning: 'weight' },
    ],
    grammar: [{ point: '〜たかったからです', explanation: 'Reason in the past: 送りたかったからです = "because I wanted to send it".', example: '送りたかったからです。', exampleEn: 'Because I wanted to send it.' }],
  },
  {
    id: 'goldfish', title: '金魚', titleReading: 'きんぎょ', titleEn: 'The Goldfish',
    level: 'N5', category: 'story', summary: 'Two goldfish from the summer festival get a new home.',
    paragraphs: [
      '夏祭りで金魚すくいをしました。二ひきの金魚をもらいました。',
      '家に帰って、大きいガラスのはちに水を入れました。金魚の名前は「あか」と「しろ」です。',
      '毎朝、えさをあげます。金魚は口をぱくぱくさせて食べます。見ていると、時間を忘れます。',
    ],
    vocab: [
      { word: '金魚', reading: 'きんぎょ', meaning: 'goldfish' },
      { word: '金魚すくい', reading: 'きんぎょすくい', meaning: 'goldfish scooping (festival game)' },
      { word: '鉢', reading: 'はち', meaning: 'bowl, basin' },
      { word: '餌', reading: 'えさ', meaning: 'feed, food (for animals)' },
      { word: '忘れる', reading: 'わすれる', meaning: 'to forget' },
    ],
    grammar: [{ point: '〜ていると', explanation: '"While/when doing…": 見ていると、時間を忘れます = "when I watch them, I lose track of time".', example: '見ていると、時間を忘れます。', exampleEn: 'Watching them, I forget the time.' }],
  },
  {
    id: 'radio-taiso', title: 'ラジオ体操', titleReading: 'ラジオたいそう', titleEn: 'Radio Exercises',
    level: 'N5', category: 'story', summary: 'Summer mornings start with exercise in the park.',
    paragraphs: [
      '夏休みの朝、六時半に公園へ行きます。ラジオ体操があるからです。',
      '子どもも、お年寄りも、みんなで音楽に合わせて体を動かします。',
      '体操の後、カードにはんこをもらいます。全部集まると、お菓子がもらえます。朝の空気は気持ちがいいです。',
    ],
    vocab: [
      { word: '体操', reading: 'たいそう', meaning: 'exercises, gymnastics' },
      { word: 'お年寄り', reading: 'おとしより', meaning: 'elderly people' },
      { word: '合わせる', reading: 'あわせる', meaning: 'to match, to keep in time with' },
      { word: '動かす', reading: 'うごかす', meaning: 'to move (something)' },
      { word: '集まる', reading: 'あつまる', meaning: 'to gather, to be collected' },
    ],
    grammar: [{ point: '〜に合わせて', explanation: '"In time with / matching": 音楽に合わせて体を動かす.', example: '音楽に合わせて体を動かします。', exampleEn: 'We move our bodies in time with the music.' }],
  },
  {
    id: 'first-train-ride', title: 'はじめてのおつかい電車', titleReading: 'はじめてのおつかいでんしゃ', titleEn: 'First Solo Train Ride',
    level: 'N5', category: 'story', summary: 'A child rides two stops alone to grandma’s house.',
    paragraphs: [
      '今日、はじめて一人で電車に乗りました。おばあちゃんの家まで、駅二つです。',
      '切符をにぎって、まどの外を見ていました。「次は、さくら駅」。私の駅です！',
      'ホームでおばあちゃんが待っていました。「よく来たね」。私は少し大人になった気がしました。',
    ],
    vocab: [
      { word: '一人で', reading: 'ひとりで', meaning: 'alone, by oneself' },
      { word: '切符', reading: 'きっぷ', meaning: 'ticket' },
      { word: '握る', reading: 'にぎる', meaning: 'to grip, to clutch' },
      { word: '次', reading: 'つぎ', meaning: 'next' },
      { word: '大人', reading: 'おとな', meaning: 'adult' },
    ],
    grammar: [{ point: '〜気がする', explanation: '"To feel that / have a sense that": 大人になった気がしました.', example: '大人になった気がしました。', exampleEn: 'I felt like I had grown up a little.' }],
  },
  {
    id: 'lost-puppy', title: '迷子の子犬', titleReading: 'まいごのこいぬ', titleEn: 'The Lost Puppy',
    level: 'N4', category: 'story', summary: 'A rainy evening, a shivering puppy, and a search for its owner.',
    paragraphs: [
      '雨の夕方、家の前で小さい子犬がふるえていました。首輪はありますが、名前が書いてありません。',
      '私はタオルで子犬をふいて、牛乳をあげました。それから、近所に「子犬をあずかっています」という紙をはりました。',
      '三日後、女の子がかけてきました。「ポチ！」子犬はしっぽを強くふりました。さよならは少しさびしかったですが、よかったと思います。',
    ],
    vocab: [
      { word: '迷子', reading: 'まいご', meaning: 'lost child/animal' },
      { word: '震える', reading: 'ふるえる', meaning: 'to shiver, tremble' },
      { word: '首輪', reading: 'くびわ', meaning: 'collar' },
      { word: '近所', reading: 'きんじょ', meaning: 'neighborhood' },
      { word: '預かる', reading: 'あずかる', meaning: 'to look after, keep temporarily' },
    ],
    grammar: [{ point: '〜てあります', explanation: 'A state resulting from someone\'s action: 名前が書いてありません = "no name is written (on it)".', example: '名前が書いてありません。', exampleEn: 'No name is written on it.' }],
  },
  {
    id: 'blackout-night', title: '停電の夜', titleReading: 'ていでんのよる', titleEn: 'The Night of the Blackout',
    level: 'N4', category: 'story', summary: 'When the lights go out, a family rediscovers candles and conversation.',
    paragraphs: [
      '台風の夜、急に電気が消えました。テレビも、エアコンも、何も動きません。',
      '母がろうそくを出してきました。小さい光のまわりに、家族が集まりました。',
      '父が子どものころの話をしてくれました。停電は二時間で終わりましたが、あの夜の話は今でも覚えています。',
    ],
    vocab: [
      { word: '停電', reading: 'ていでん', meaning: 'power outage' },
      { word: '台風', reading: 'たいふう', meaning: 'typhoon' },
      { word: '急に', reading: 'きゅうに', meaning: 'suddenly' },
      { word: '蝋燭', reading: 'ろうそく', meaning: 'candle' },
      { word: '覚える', reading: 'おぼえる', meaning: 'to remember' },
    ],
    grammar: [{ point: '〜てくれる (story-telling)', explanation: 'してくれました marks the action as a kindness toward the speaker.', example: '話をしてくれました。', exampleEn: 'He told us stories (for us).' }],
  },
  {
    id: 'rain-shelter', title: '雨宿り', titleReading: 'あまやどり', titleEn: 'Taking Shelter from the Rain',
    level: 'N4', category: 'story', summary: 'A sudden shower, a shared awning, and a short conversation.',
    paragraphs: [
      '帰り道、急に強い雨がふってきました。かさがなかったので、小さい店の前で雨宿りをしました。',
      'となりに、おじいさんも立っていました。「よくふりますね」「本当ですね」。それから、少し話をしました。',
      '十五分後、雨は止みました。「じゃあ、お気をつけて」。名前も知らない人ですが、なんだか温かい気持ちになりました。',
    ],
    vocab: [
      { word: '雨宿り', reading: 'あまやどり', meaning: 'taking shelter from rain' },
      { word: '帰り道', reading: 'かえりみち', meaning: 'the way home' },
      { word: '隣', reading: 'となり', meaning: 'next to' },
      { word: '止む', reading: 'やむ', meaning: 'to stop (rain)' },
      { word: '温かい', reading: 'あたたかい', meaning: 'warm (feeling)' },
    ],
    grammar: [{ point: '〜てきました (change arriving)', explanation: 'ふってきました = "it started to rain (came on)". て-form + くる for something arriving/beginning.', example: '雨がふってきました。', exampleEn: 'It started to rain.' }],
  },
  {
    id: 'last-train', title: '終電', titleReading: 'しゅうでん', titleEn: 'The Last Train',
    level: 'N3', category: 'story', summary: 'Almost missing the last train home — and the stranger who helped.',
    paragraphs: [
      '金曜日の夜、仕事が長引いて、気がつくと十一時半でした。終電まであと十分しかありません。',
      '駅まで走りました。改札の前で、定期券が見つかりません。かばんの中をひっくり返していると、駅員さんが「先に乗ってください。着いた駅で払えばいいですよ」と言ってくれました。',
      'ぎりぎりで間に合いました。電車の窓に、疲れた顔がうつっています。でも、親切のおかげで、悪くない夜だったと思えました。',
    ],
    vocab: [
      { word: '終電', reading: 'しゅうでん', meaning: 'last train' },
      { word: '長引く', reading: 'ながびく', meaning: 'to drag on, run late' },
      { word: '改札', reading: 'かいさつ', meaning: 'ticket gate' },
      { word: '定期券', reading: 'ていきけん', meaning: 'commuter pass' },
      { word: '間に合う', reading: 'まにあう', meaning: 'to be in time' },
    ],
    grammar: [{ point: '〜おかげで', explanation: '"Thanks to…": 親切のおかげで = "thanks to (his) kindness".', example: '親切のおかげで間に合いました。', exampleEn: 'Thanks to his kindness, I made it.' }],
  },
  // ---- folktales (public-domain tales, retold) ----
  {
    id: 'urashima-taro', title: '浦島太郎', titleReading: 'うらしまたろう', titleEn: 'Urashima Tarō',
    level: 'N4', category: 'folktale', credit: 'Traditional Japanese folktale (public domain). Retold in simple Japanese.',
    summary: 'The fisherman who saved a turtle and visited the palace under the sea.',
    paragraphs: [
      '昔、浦島太郎という若い漁師がいました。ある日、子どもたちにいじめられている亀を助けました。',
      '亀はお礼に、太郎を海の底の竜宮城へ連れて行きました。太郎は美しい乙姫と楽しい日々を過ごしました。',
      '帰る時、乙姫は「開けてはいけません」と言って、玉手箱をくれました。村に戻ると、何百年も時間が過ぎていました。太郎が箱を開けると、白いけむりが出て、太郎はおじいさんになってしまいました。',
    ],
    vocab: [
      { word: '漁師', reading: 'りょうし', meaning: 'fisherman' },
      { word: '亀', reading: 'かめ', meaning: 'turtle' },
      { word: '助ける', reading: 'たすける', meaning: 'to save, help' },
      { word: '過ごす', reading: 'すごす', meaning: 'to spend (time)' },
      { word: '煙', reading: 'けむり', meaning: 'smoke' },
    ],
    grammar: [{ point: '〜てはいけません', explanation: 'Prohibition: 開けてはいけません = "you must not open it" — the tale\'s famous warning.', example: '開けてはいけません。', exampleEn: 'You must not open it.' }],
  },
  {
    id: 'issunboshi', title: '一寸法師', titleReading: 'いっすんぼうし', titleEn: 'Issun-bōshi, the One-Inch Boy',
    level: 'N4', category: 'folktale', credit: 'Traditional Japanese folktale (public domain). Retold in simple Japanese.',
    summary: 'A boy the size of a finger sets out with a needle for a sword.',
    paragraphs: [
      '昔、指ほどの小さい男の子が生まれました。名前は一寸法師です。',
      '大きくなっても体は小さいままでした。一寸法師は針の刀を持って、おわんの船で都へ行きました。',
      '都で、一寸法師は鬼と戦いました。鬼は一寸法師を飲みこみましたが、おなかの中を針でついたので、鬼は降参しました。鬼が落とした打ち出の小づちをふると、一寸法師は立派な若者になりました。',
    ],
    vocab: [
      { word: '指', reading: 'ゆび', meaning: 'finger' },
      { word: '針', reading: 'はり', meaning: 'needle' },
      { word: '刀', reading: 'かたな', meaning: 'sword' },
      { word: '都', reading: 'みやこ', meaning: 'the capital' },
      { word: '立派', reading: 'りっぱ', meaning: 'splendid, fine' },
    ],
    grammar: [{ point: '〜まま', explanation: 'Unchanged state: 小さいままでした = "stayed small (as he was)".', example: '体は小さいままでした。', exampleEn: 'His body stayed small.' }],
  },
  {
    id: 'kasa-jizo', title: '笠地蔵', titleReading: 'かさじぞう', titleEn: 'The Hats for Jizō',
    level: 'N4', category: 'folktale', credit: 'Traditional Japanese folktale (public domain). Retold in simple Japanese.',
    summary: 'A poor old man gives his unsold hats to six stone statues in the snow.',
    paragraphs: [
      '昔、貧しいおじいさんとおばあさんがいました。大みそかなのに、お正月のもちを買うお金がありません。',
      'おじいさんは笠を売りに町へ行きましたが、一つも売れませんでした。帰り道、雪をかぶった六つのお地蔵さまを見て、売れなかった笠をかぶせてあげました。',
      'その夜、家の外で音がしました。戸を開けると、米やもちや魚が置いてありました。雪の中を、笠をかぶったお地蔵さまたちが帰っていくのが見えました。',
    ],
    vocab: [
      { word: '貧しい', reading: 'まずしい', meaning: 'poor' },
      { word: '大晦日', reading: 'おおみそか', meaning: 'New Year\'s Eve' },
      { word: '笠', reading: 'かさ', meaning: 'woven hat' },
      { word: '地蔵', reading: 'じぞう', meaning: 'Jizō statue' },
      { word: '被せる', reading: 'かぶせる', meaning: 'to put (a hat) on someone' },
    ],
    grammar: [{ point: '〜のに', explanation: 'Contrast/regret: 大みそかなのに = "even though it\'s New Year\'s Eve".', example: '大みそかなのに、お金がありません。', exampleEn: 'Even though it\'s New Year\'s Eve, they have no money.' }],
  },
  {
    id: 'shitakiri-suzume', title: '舌切り雀', titleReading: 'したきりすずめ', titleEn: 'The Tongue-Cut Sparrow',
    level: 'N4', category: 'folktale', credit: 'Traditional Japanese folktale (public domain). Retold in simple Japanese.',
    summary: 'Kindness and greed each get the box they choose.',
    paragraphs: [
      '昔、やさしいおじいさんが一羽の雀をかわいがっていました。しかし、いじわるなおばあさんが、のりを食べた雀の舌を切って、追い出してしまいました。',
      'おじいさんは山へ雀をさがしに行きました。雀たちは喜んで、ごちそうをして、大小二つのつづらを出しました。おじいさんは小さいほうを選びました。中には宝物が入っていました。',
      'それを聞いたおばあさんは、大きいつづらをもらいに行きました。しかし、中から出たのはへびや虫でした。欲張りは損をするというお話です。',
    ],
    vocab: [
      { word: '雀', reading: 'すずめ', meaning: 'sparrow' },
      { word: '舌', reading: 'した', meaning: 'tongue' },
      { word: '追い出す', reading: 'おいだす', meaning: 'to drive out' },
      { word: '葛籠', reading: 'つづら', meaning: 'wicker box' },
      { word: '欲張り', reading: 'よくばり', meaning: 'greed, greedy person' },
    ],
    grammar: [{ point: '〜ほうを選ぶ', explanation: 'Choosing between options: 小さいほうを選びました = "chose the smaller one".', example: '小さいほうを選びました。', exampleEn: 'He chose the smaller one.' }],
  },
  // ---- articles ----
  {
    id: 'moon-viewing', title: 'お月見', titleReading: 'おつきみ', titleEn: 'Moon Viewing',
    level: 'N5', category: 'article', summary: 'Autumn’s quiet festival of dumplings and the full moon.',
    paragraphs: [
      '秋、月が一番きれいな夜に、日本では「お月見」をします。',
      'まるい月に、まるいだんごとすすきをそなえます。月の中には、うさぎがいると言われています。',
      '静かに月を見る。それだけの行事ですが、とても日本らしい夜です。',
    ],
    vocab: [
      { word: '月見', reading: 'つきみ', meaning: 'moon viewing' },
      { word: '団子', reading: 'だんご', meaning: 'dumpling' },
      { word: '芒', reading: 'すすき', meaning: 'pampas grass' },
      { word: '供える', reading: 'そなえる', meaning: 'to offer (to gods/spirits)' },
      { word: '行事', reading: 'ぎょうじ', meaning: 'event, observance' },
    ],
    grammar: [{ point: '〜らしい', explanation: '"Typical of / just like": 日本らしい夜 = "a very Japanese night".', example: 'とても日本らしい夜です。', exampleEn: 'It is a very Japanese sort of night.' }],
  },
  {
    id: 'japanese-breakfast', title: '日本の朝ご飯', titleReading: 'にほんのあさごはん', titleEn: 'The Japanese Breakfast',
    level: 'N5', category: 'article', summary: 'Rice, miso soup, fish — the classic morning table.',
    paragraphs: [
      '日本の伝統的な朝ご飯は、ご飯とみそ汁です。焼き魚や、たまご、のり、つけものもよく食べます。',
      '最近は、パンとコーヒーの人も多いです。でも、旅館に泊まると、きれいな和食の朝ご飯が出てきます。',
      '温かいご飯と温かいみそ汁。simpleですが、一日を始める力になります。',
    ],
    vocab: [
      { word: '伝統的', reading: 'でんとうてき', meaning: 'traditional' },
      { word: '味噌汁', reading: 'みそしる', meaning: 'miso soup' },
      { word: '焼き魚', reading: 'やきざかな', meaning: 'grilled fish' },
      { word: '漬物', reading: 'つけもの', meaning: 'pickles' },
      { word: '旅館', reading: 'りょかん', meaning: 'Japanese inn' },
    ],
    grammar: [{ point: '〜と (discovery)', explanation: '泊まると、〜が出てきます = "when you stay (at an inn), … appears".', example: '旅館に泊まると、和食が出てきます。', exampleEn: 'When you stay at an inn, Japanese food is served.' }],
  },
  {
    id: 'kana-story', title: 'ひらがなとカタカナ', titleReading: 'ひらがなとカタカナ', titleEn: 'Hiragana and Katakana',
    level: 'N5', category: 'article', summary: 'Why Japanese has two alphabets — and where they came from.',
    paragraphs: [
      '日本語には、ひらがなとカタカナという二つのかな文字があります。どちらも、漢字から生まれました。',
      'ひらがなは、漢字をやわらかくくずした形です。カタカナは、漢字の一部分を取った形です。',
      'ひらがなは日本語のことばに、カタカナは外国から来たことばに使います。だから「コーヒー」はカタカナで書きます。',
    ],
    vocab: [
      { word: '文字', reading: 'もじ', meaning: 'letter, character' },
      { word: '生まれる', reading: 'うまれる', meaning: 'to be born' },
      { word: '崩す', reading: 'くずす', meaning: 'to simplify, break down (a form)' },
      { word: '一部分', reading: 'いちぶぶん', meaning: 'a part, portion' },
      { word: '外国', reading: 'がいこく', meaning: 'foreign country' },
    ],
    grammar: [{ point: '〜から生まれた', explanation: '"Born from / derived from": 漢字から生まれました.', example: 'かなは漢字から生まれました。', exampleEn: 'Kana were born from kanji.' }],
  },
  {
    id: 'cherry-blossom-front', title: '桜前線', titleReading: 'さくらぜんせん', titleEn: 'The Cherry Blossom Front',
    level: 'N4', category: 'article', summary: 'The bloom line that travels the length of Japan every spring.',
    paragraphs: [
      '春になると、ニュースで「桜前線」という言葉を聞きます。桜がさき始める場所を線でつないだものです。',
      '桜前線は、三月に南の九州から始まり、五月に北の北海道に着きます。二か月かけて、日本を旅するのです。',
      '天気予報のように「開花予想」が発表され、人々はそれを見て花見の計画を立てます。',
    ],
    vocab: [
      { word: '前線', reading: 'ぜんせん', meaning: 'front (weather)' },
      { word: '繋ぐ', reading: 'つなぐ', meaning: 'to connect' },
      { word: '開花', reading: 'かいか', meaning: 'blooming' },
      { word: '予想', reading: 'よそう', meaning: 'forecast, prediction' },
      { word: '計画', reading: 'けいかく', meaning: 'plan' },
    ],
    grammar: [{ point: '〜かけて', explanation: 'Duration of a process: 二か月かけて = "taking two months".', example: '二か月かけて日本を旅します。', exampleEn: 'It travels Japan over two months.' }],
  },
  {
    id: 'bowing', title: 'お辞儀', titleReading: 'おじぎ', titleEn: 'Bowing',
    level: 'N4', category: 'article', summary: 'The many angles of the Japanese bow.',
    paragraphs: [
      '日本では、あいさつの時に頭を下げます。これを「お辞儀」と言います。',
      'お辞儀には種類があります。軽いあいさつは十五度、ていねいなあいさつは三十度、あやまる時や深く感謝する時は四十五度、頭を下げます。',
      '電話をしながらお辞儀をする人もいます。相手には見えませんが、気持ちは自然に体に出るのです。',
    ],
    vocab: [
      { word: 'お辞儀', reading: 'おじぎ', meaning: 'bow (greeting)' },
      { word: '頭を下げる', reading: 'あたまをさげる', meaning: 'to lower one\'s head' },
      { word: '度', reading: 'ど', meaning: 'degree' },
      { word: '謝る', reading: 'あやまる', meaning: 'to apologize' },
      { word: '自然に', reading: 'しぜんに', meaning: 'naturally' },
    ],
    grammar: [{ point: '〜ながら', explanation: 'Simultaneous actions: 電話をしながらお辞儀をする = "bow while on the phone".', example: '電話をしながらお辞儀をします。', exampleEn: 'They bow while talking on the phone.' }],
  },
  {
    id: 'sento', title: '銭湯', titleReading: 'せんとう', titleEn: 'The Public Bath',
    level: 'N4', category: 'article', summary: 'Neighborhood bathhouses and their painted Mt. Fuji walls.',
    paragraphs: [
      '銭湯は、町のみんなが使うお風呂です。昔は家にお風呂がない家が多く、銭湯は生活に欠かせない場所でした。',
      '入る前に、体をよく洗います。湯船にタオルを入れてはいけません。かべには、大きな富士山の絵がかいてあることが多いです。',
      '今は数が減りましたが、広いお風呂でゆっくり温まる気持ちよさは、家のお風呂では味わえません。',
    ],
    vocab: [
      { word: '銭湯', reading: 'せんとう', meaning: 'public bath' },
      { word: '風呂', reading: 'ふろ', meaning: 'bath' },
      { word: '湯船', reading: 'ゆぶね', meaning: 'bathtub' },
      { word: '減る', reading: 'へる', meaning: 'to decrease' },
      { word: '味わう', reading: 'あじわう', meaning: 'to savor, experience' },
    ],
    grammar: [{ point: '〜てはいけません (rule)', explanation: 'Bath rule: タオルを入れてはいけません = "you must not put towels in the water".', example: '湯船にタオルを入れてはいけません。', exampleEn: 'You must not put your towel in the tub.' }],
  },
  {
    id: 'japanese-houses', title: '日本の家', titleReading: 'にほんのいえ', titleEn: 'Japanese Houses',
    level: 'N4', category: 'article', summary: 'Genkan, tatami, and doors that slide instead of swing.',
    paragraphs: [
      '日本の家に入る時は、まず玄関でくつをぬぎます。家の中と外を、はっきり分ける文化です。',
      '伝統的な部屋には、たたみがしいてあります。たたみの部屋では、ふとんをしいて寝ます。朝になると、ふとんをたたんで、押し入れにしまいます。',
      'ドアのかわりに、横にすべる「ふすま」や「しょうじ」もあります。部屋の形を自由に変えられるのが、日本の家のおもしろいところです。',
    ],
    vocab: [
      { word: '玄関', reading: 'げんかん', meaning: 'entryway' },
      { word: '脱ぐ', reading: 'ぬぐ', meaning: 'to take off (shoes/clothes)' },
      { word: '畳', reading: 'たたみ', meaning: 'tatami mat' },
      { word: '押し入れ', reading: 'おしいれ', meaning: 'closet' },
      { word: '障子', reading: 'しょうじ', meaning: 'paper sliding door' },
    ],
    grammar: [{ point: '〜かわりに', explanation: '"Instead of": ドアのかわりに、ふすまがあります.', example: 'ドアのかわりに、ふすまがあります。', exampleEn: 'Instead of doors, there are fusuma.' }],
  },
  {
    id: 'omiyage', title: 'お土産の文化', titleReading: 'おみやげのぶんか', titleEn: 'The Culture of Omiyage',
    level: 'N4', category: 'article', summary: 'Why every Japanese station sells beautifully boxed sweets.',
    paragraphs: [
      '日本人は旅行に行くと、家族や会社の人にお土産を買って帰ります。多くの場合、その土地のお菓子です。',
      'だから、日本の駅や空港には、きれいな箱のお菓子がたくさん売っています。「北海道のチョコレート」「京都の抹茶のお菓子」など、土地ごとに名物があります。',
      'お土産は「あなたのことを旅行中も思っていましたよ」という気持ちを伝えるものなのです。',
    ],
    vocab: [
      { word: '土産', reading: 'みやげ', meaning: 'souvenir' },
      { word: '土地', reading: 'とち', meaning: 'place, region' },
      { word: '名物', reading: 'めいぶつ', meaning: 'local specialty' },
      { word: '伝える', reading: 'つたえる', meaning: 'to convey' },
      { word: '気持ち', reading: 'きもち', meaning: 'feeling' },
    ],
    grammar: [{ point: '〜ごとに', explanation: '"Each / every": 土地ごとに名物があります = "each region has its specialty".', example: '土地ごとに名物があります。', exampleEn: 'Every region has its own specialty.' }],
  },
  {
    id: 'hundred-yen-shops', title: '百円ショップ', titleReading: 'ひゃくえんショップ', titleEn: 'The 100-Yen Shop',
    level: 'N4', category: 'article', summary: 'Japan’s wonderland of surprisingly good cheap things.',
    paragraphs: [
      '百円ショップは、店の中のほとんどの物が百円で買える店です。',
      '食器、文房具、そうじ道具、化粧品、おもちゃ。品物の種類は数万点もあります。「これが百円？」とおどろく物も多いです。',
      '旅行者にも人気で、お土産をここでそろえる人もいます。安くても品質がいいのが、日本らしいところです。',
    ],
    vocab: [
      { word: '食器', reading: 'しょっき', meaning: 'tableware' },
      { word: '文房具', reading: 'ぶんぼうぐ', meaning: 'stationery' },
      { word: '品物', reading: 'しなもの', meaning: 'goods, items' },
      { word: '揃える', reading: 'そろえる', meaning: 'to gather, buy a full set' },
      { word: '品質', reading: 'ひんしつ', meaning: 'quality' },
    ],
    grammar: [{ point: '〜ても (concession)', explanation: '安くても品質がいい = "even though cheap, the quality is good".', example: '安くても品質がいいです。', exampleEn: 'Even though it\'s cheap, the quality is good.' }],
  },
  {
    id: 'ekiben', title: '駅弁', titleReading: 'えきべん', titleEn: 'Station Bento',
    level: 'N4', category: 'article', summary: 'The train-station lunch boxes worth traveling for.',
    paragraphs: [
      '「駅弁」は、駅で売っているお弁当のことです。ただのお弁当ではありません。その土地の名物料理が入った、旅の楽しみの一つです。',
      '北海道ならかに、仙台なら牛たん、広島ならあなご。駅弁を選ぶ時間も楽しいものです。',
      '新幹線の窓の外を景色が流れていく中で食べる駅弁の味は、特別です。',
    ],
    vocab: [
      { word: '駅弁', reading: 'えきべん', meaning: 'station bento' },
      { word: '名物料理', reading: 'めいぶつりょうり', meaning: 'local specialty dish' },
      { word: '選ぶ', reading: 'えらぶ', meaning: 'to choose' },
      { word: '景色', reading: 'けしき', meaning: 'scenery' },
      { word: '特別', reading: 'とくべつ', meaning: 'special' },
    ],
    grammar: [{ point: '〜なら', explanation: 'Topic-conditional: 北海道ならかに = "if it\'s Hokkaido, then crab".', example: '北海道ならかにです。', exampleEn: 'If it\'s Hokkaido, it\'s crab.' }],
  },
  {
    id: 'keigo', title: '敬語入門', titleReading: 'けいごにゅうもん', titleEn: 'An Introduction to Keigo',
    level: 'N3', category: 'article', summary: 'The three levels of polite Japanese, gently explained.',
    paragraphs: [
      '敬語は、相手への敬意を表す日本語の話し方です。大きく分けて三つあります。',
      '「ていねい語」は です・ます の形。「尊敬語」は相手の動作を高める言い方で、「食べる」が「めしあがる」になります。「けんじょう語」は自分の動作を低くする言い方で、「行く」が「うかがう」になります。',
      '日本人でも敬語をまちがえることがあります。完璧でなくても、ていねいに話そうとする気持ちが一番大切です。',
    ],
    vocab: [
      { word: '敬語', reading: 'けいご', meaning: 'honorific language' },
      { word: '敬意', reading: 'けいい', meaning: 'respect' },
      { word: '尊敬語', reading: 'そんけいご', meaning: 'respectful language' },
      { word: '謙譲語', reading: 'けんじょうご', meaning: 'humble language' },
      { word: '完璧', reading: 'かんぺき', meaning: 'perfect' },
    ],
    grammar: [{ point: '〜ようとする', explanation: 'Trying/attempting: 話そうとする気持ち = "the intention of trying to speak (politely)".', example: 'ていねいに話そうとする気持ちが大切です。', exampleEn: 'What matters is trying to speak politely.' }],
  },
  {
    id: 'shinkansen-cleaning', title: '新幹線の七分間', titleReading: 'しんかんせんのななふんかん', titleEn: 'The Shinkansen’s Seven Minutes',
    level: 'N3', category: 'article', summary: 'The famous seven-minute miracle of bullet-train cleaning.',
    paragraphs: [
      '東京駅に着いた新幹線は、わずか十二分後には次の乗客を乗せて出発します。そうじに使える時間は、たった七分です。',
      'そうじチームは一列に並んで礼をしてから、車内に入ります。ざせきの向きを変え、ゆかをはき、テーブルをふき、わすれ物をチェックする。すべてが七分で終わります。',
      'この見事な仕事は「七分間の奇跡」と呼ばれ、海外のメディアにも取り上げられました。',
    ],
    vocab: [
      { word: '僅か', reading: 'わずか', meaning: 'merely, only' },
      { word: '乗客', reading: 'じょうきゃく', meaning: 'passenger' },
      { word: '座席', reading: 'ざせき', meaning: 'seat' },
      { word: '見事', reading: 'みごと', meaning: 'splendid, admirable' },
      { word: '奇跡', reading: 'きせき', meaning: 'miracle' },
    ],
    grammar: [{ point: '〜と呼ばれる', explanation: 'Passive naming: 「七分間の奇跡」と呼ばれています = "is called the seven-minute miracle".', example: '「七分間の奇跡」と呼ばれています。', exampleEn: 'It is called "the seven-minute miracle."' }],
  },
]

await mkdir(readingsDir, { recursive: true })
for (const r of READINGS) {
  await writeFile(join(readingsDir, `${r.id}.json`), JSON.stringify(r, null, 2) + '\n', 'utf8')
}
const files = (await readdir(readingsDir)).filter((f) => f.endsWith('.json'))
const byId = {}
for (const f of files) {
  const r = JSON.parse(await readFile(join(readingsDir, f), 'utf8'))
  byId[r.id] = { id: r.id, title: r.title, titleReading: r.titleReading, titleEn: r.titleEn, level: r.level, category: r.category, summary: r.summary }
}
let order = []
try {
  const prev = JSON.parse(await readFile(join(contentDir, 'catalog.json'), 'utf8'))
  order = prev.readings.map((r) => r.id).filter((id) => id in byId)
} catch { /* none */ }
for (const id of Object.keys(byId)) if (!order.includes(id)) order.push(id)
await writeFile(join(contentDir, 'catalog.json'), JSON.stringify({ version: 1, readings: order.map((id) => byId[id]) }, null, 2) + '\n', 'utf8')
console.log(`Wrote ${READINGS.length} new readings. Catalog now lists ${order.length}.`)
