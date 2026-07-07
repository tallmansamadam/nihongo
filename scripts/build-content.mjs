// Authors the remote-library readings. Each entry below is written to
// content/readings/<id>.json, then content/catalog.json is regenerated from the
// full set of reading files. All prose is original; the three folktales are
// public-domain tales retold in simple Japanese.
//
//   npm run build-content
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const contentDir = join(root, 'content')
const readingsDir = join(contentDir, 'readings')

/** @type {Array<{id:string,title:string,titleReading:string,titleEn:string,level:string,category:string,summary:string,credit?:string,paragraphs:string[],vocab:{word:string,reading:string,meaning:string}[],grammar?:{point:string,explanation:string,example:string,exampleEn:string}[]}>} */
const READINGS = [
  // ---------------- N5 ----------------
  {
    id: 'morning-routine', title: '朝の習慣', titleReading: 'あさのしゅうかん', titleEn: 'My Morning Routine',
    level: 'N5', category: 'story',
    summary: 'A simple description of one person’s morning, from waking up to leaving home.',
    paragraphs: [
      '私は毎朝六時に起きます。まず、顔を洗って、歯をみがきます。',
      'それから、台所でパンとたまごを食べます。コーヒーも飲みます。',
      '七時半に家を出て、駅まで歩きます。電車の中で本を読みます。',
    ],
    vocab: [
      { word: '起きる', reading: 'おきる', meaning: 'to get up' },
      { word: '顔', reading: 'かお', meaning: 'face' },
      { word: '洗う', reading: 'あらう', meaning: 'to wash' },
      { word: '歯', reading: 'は', meaning: 'tooth, teeth' },
      { word: '台所', reading: 'だいどころ', meaning: 'kitchen' },
      { word: '出る', reading: 'でる', meaning: 'to leave, to go out' },
    ],
    grammar: [{ point: 'まず / それから', explanation: 'Sequence words: まず = "first", それから = "after that / then".', example: 'まず顔を洗って、それから食べます。', exampleEn: 'First I wash my face, then I eat.' }],
  },
  {
    id: 'my-cat', title: '猫の一日', titleReading: 'ねこのいちにち', titleEn: "A Cat's Day",
    level: 'N5', category: 'story',
    summary: 'A lazy house cat’s daily routine, told gently.',
    paragraphs: [
      'うちの猫の名前はミケです。ミケは白と茶色の小さい猫です。',
      '朝、ミケはまどのそばで日なたぼっこをします。昼は一日中よく寝ます。',
      '夜になると、ミケは元気になります。おもちゃで遊んで、私のベッドで寝ます。',
    ],
    vocab: [
      { word: '猫', reading: 'ねこ', meaning: 'cat' },
      { word: '茶色', reading: 'ちゃいろ', meaning: 'brown' },
      { word: '窓', reading: 'まど', meaning: 'window' },
      { word: '一日中', reading: 'いちにちじゅう', meaning: 'all day long' },
      { word: '遊ぶ', reading: 'あそぶ', meaning: 'to play' },
    ],
  },
  {
    id: 'at-the-park', title: '公園で', titleReading: 'こうえんで', titleEn: 'At the Park',
    level: 'N5', category: 'story',
    summary: 'A sunny afternoon spent at the neighborhood park.',
    paragraphs: [
      '日曜日の午後、私は近くの公園へ行きました。天気がよくて、とても暖かかったです。',
      '子どもたちがボールで遊んでいました。おじいさんは犬と散歩していました。',
      '私はベンチにすわって、アイスクリームを食べました。とても楽しい午後でした。',
    ],
    vocab: [
      { word: '公園', reading: 'こうえん', meaning: 'park' },
      { word: '近く', reading: 'ちかく', meaning: 'nearby' },
      { word: '暖かい', reading: 'あたたかい', meaning: 'warm' },
      { word: '散歩', reading: 'さんぽ', meaning: 'a walk, stroll' },
      { word: '座る', reading: 'すわる', meaning: 'to sit' },
    ],
    grammar: [{ point: '〜ている (ongoing action)', explanation: 'The て-form + いる shows an action in progress: 遊んでいる = "is playing".', example: '子どもが遊んでいました。', exampleEn: 'The children were playing.' }],
  },
  {
    id: 'school-lunch', title: '学校の昼ご飯', titleReading: 'がっこうのひるごはん', titleEn: 'School Lunch',
    level: 'N5', category: 'story',
    summary: 'What lunchtime is like at a Japanese elementary school.',
    paragraphs: [
      '日本の小学校では、みんなで教室で昼ご飯を食べます。これを「きゅうしょく」と言います。',
      '今日のきゅうしょくはカレーライスと牛乳とサラダでした。カレーはとても美味しかったです。',
      '食べた後、みんなで教室をそうじします。それから、外で遊びます。',
    ],
    vocab: [
      { word: '小学校', reading: 'しょうがっこう', meaning: 'elementary school' },
      { word: '教室', reading: 'きょうしつ', meaning: 'classroom' },
      { word: '牛乳', reading: 'ぎゅうにゅう', meaning: 'milk' },
      { word: '後', reading: 'あと', meaning: 'after' },
      { word: '掃除', reading: 'そうじ', meaning: 'cleaning' },
    ],
  },
  {
    id: 'my-family', title: '私の家族', titleReading: 'わたしのかぞく', titleEn: 'My Family',
    level: 'N5', category: 'story',
    summary: 'A short introduction to each member of a family.',
    paragraphs: [
      '私の家族は四人です。父と母と、妹と私です。',
      '父は会社員で、毎日おそくまで働いています。母は料理がとても上手です。',
      '妹はまだ小学生です。歌が好きで、いつも家で歌っています。私は家族が大好きです。',
    ],
    vocab: [
      { word: '妹', reading: 'いもうと', meaning: 'younger sister' },
      { word: '会社員', reading: 'かいしゃいん', meaning: 'company employee' },
      { word: '働く', reading: 'はたらく', meaning: 'to work' },
      { word: '料理', reading: 'りょうり', meaning: 'cooking, cuisine' },
      { word: '上手', reading: 'じょうず', meaning: 'skilled, good at' },
    ],
  },
  {
    id: 'my-birthday', title: '私の誕生日', titleReading: 'わたしのたんじょうび', titleEn: 'My Birthday',
    level: 'N5', category: 'story',
    summary: 'A birthday celebration with family and a small surprise.',
    paragraphs: [
      '昨日は私の誕生日でした。家族がパーティーをしてくれました。',
      '母はチョコレートのケーキを作ってくれました。父から新しいかばんをもらいました。',
      'とてもうれしかったです。来年の誕生日も楽しみです。',
    ],
    vocab: [
      { word: '誕生日', reading: 'たんじょうび', meaning: 'birthday' },
      { word: '作る', reading: 'つくる', meaning: 'to make' },
      { word: 'もらう', reading: 'もらう', meaning: 'to receive' },
      { word: '来年', reading: 'らいねん', meaning: 'next year' },
      { word: '楽しみ', reading: 'たのしみ', meaning: 'looking forward to' },
    ],
    grammar: [{ point: '〜てくれる', explanation: 'Someone does something for you (a kindness): 作ってくれた = "made it for me".', example: 'ケーキを作ってくれました。', exampleEn: 'She made a cake for me.' }],
  },
  {
    id: 'my-bicycle', title: '私の自転車', titleReading: 'わたしのじてんしゃ', titleEn: 'My Bicycle',
    level: 'N5', category: 'story',
    summary: 'Getting around town by bike.',
    paragraphs: [
      '私は毎日自転車に乗ります。青い自転車で、去年買いました。',
      '学校まで自転車で二十分ぐらいかかります。雨の日はバスに乗ります。',
      '週末は、自転車で川のそばの道を走ります。気持ちがいいです。',
    ],
    vocab: [
      { word: '自転車', reading: 'じてんしゃ', meaning: 'bicycle' },
      { word: '去年', reading: 'きょねん', meaning: 'last year' },
      { word: 'かかる', reading: 'かかる', meaning: 'to take (time)' },
      { word: '週末', reading: 'しゅうまつ', meaning: 'weekend' },
      { word: '走る', reading: 'はしる', meaning: 'to run, to ride along' },
    ],
  },
  {
    id: 'at-the-supermarket', title: 'スーパーで', titleReading: 'スーパーで', titleEn: 'At the Supermarket',
    level: 'N5', category: 'story',
    summary: 'A quick evening shopping trip.',
    paragraphs: [
      '夕方、母とスーパーへ買い物に行きました。',
      '野菜とくだものと魚を買いました。今日は魚が安かったです。',
      '母は晩ご飯にさかなを焼きました。とても美味しかったです。',
    ],
    vocab: [
      { word: '夕方', reading: 'ゆうがた', meaning: 'evening' },
      { word: '買い物', reading: 'かいもの', meaning: 'shopping' },
      { word: '野菜', reading: 'やさい', meaning: 'vegetables' },
      { word: '安い', reading: 'やすい', meaning: 'cheap' },
      { word: '焼く', reading: 'やく', meaning: 'to grill, to bake' },
    ],
  },
  {
    id: 'first-snow', title: '初雪', titleReading: 'はつゆき', titleEn: 'The First Snow',
    level: 'N5', category: 'story',
    summary: 'The excitement of the winter’s first snowfall.',
    paragraphs: [
      '今朝、まどの外を見て、びっくりしました。雪がふっていました。今年の初雪です。',
      '町が白くなって、とてもきれいでした。子どもたちは外で雪だるまを作っていました。',
      '私も外に出て、少しあそびました。手はつめたかったですが、楽しかったです。',
    ],
    vocab: [
      { word: '初雪', reading: 'はつゆき', meaning: 'first snow of the season' },
      { word: '今朝', reading: 'けさ', meaning: 'this morning' },
      { word: 'びっくりする', reading: 'びっくりする', meaning: 'to be surprised' },
      { word: '雪だるま', reading: 'ゆきだるま', meaning: 'snowman' },
      { word: '冷たい', reading: 'つめたい', meaning: 'cold (to touch)' },
    ],
  },
  {
    id: 'my-room', title: '私の部屋', titleReading: 'わたしのへや', titleEn: 'My Room',
    level: 'N5', category: 'story',
    summary: 'A tour of a small, tidy bedroom.',
    paragraphs: [
      '私の部屋は小さいですが、明るくて静かです。',
      'まどのそばに机といすがあります。机の上にパソコンと本があります。',
      'かべには家族の写真がはってあります。私はこの部屋が大好きです。',
    ],
    vocab: [
      { word: '部屋', reading: 'へや', meaning: 'room' },
      { word: '明るい', reading: 'あかるい', meaning: 'bright' },
      { word: '静か', reading: 'しずか', meaning: 'quiet' },
      { word: '机', reading: 'つくえ', meaning: 'desk' },
      { word: '壁', reading: 'かべ', meaning: 'wall' },
    ],
  },
  {
    id: 'rainy-season', title: '梅雨', titleReading: 'つゆ', titleEn: 'The Rainy Season',
    level: 'N5', category: 'article',
    summary: 'A short explanation of Japan’s early-summer rainy season.',
    paragraphs: [
      '日本には「梅雨」という季節があります。だいたい六月から七月まで続きます。',
      'この時期は毎日のように雨がふります。かさが必要です。',
      '梅雨の後、あつい夏が来ます。梅雨の雨は、米や野菜にとって大切です。',
    ],
    vocab: [
      { word: '梅雨', reading: 'つゆ', meaning: 'rainy season' },
      { word: '季節', reading: 'きせつ', meaning: 'season' },
      { word: '続く', reading: 'つづく', meaning: 'to continue' },
      { word: '必要', reading: 'ひつよう', meaning: 'necessary' },
      { word: '大切', reading: 'たいせつ', meaning: 'important' },
    ],
  },
  {
    id: 'kintaro', title: '金太郎', titleReading: 'きんたろう', titleEn: 'Kintarō, the Golden Boy',
    level: 'N5', category: 'folktale',
    credit: 'Traditional Japanese folktale (public domain). Retold in simple Japanese.',
    summary: 'The classic tale of the super-strong boy who grew up in the mountains.',
    paragraphs: [
      '昔、山の中に金太郎という強い男の子がいました。',
      '金太郎はくまやうさぎといっしょに遊びました。とても力が強くて、大きい石も持ち上げました。',
      '大きくなって、金太郎は町へ行き、みんなのために働くさむらいになりました。',
    ],
    vocab: [
      { word: '強い', reading: 'つよい', meaning: 'strong' },
      { word: '熊', reading: 'くま', meaning: 'bear' },
      { word: '力', reading: 'ちから', meaning: 'strength, power' },
      { word: '石', reading: 'いし', meaning: 'stone' },
      { word: '侍', reading: 'さむらい', meaning: 'samurai' },
    ],
  },

  // ---------------- N4 ----------------
  {
    id: 'moving-house', title: '引っ越し', titleReading: 'ひっこし', titleEn: 'Moving House',
    level: 'N4', category: 'story',
    summary: 'The busy, bittersweet day of moving to a new apartment.',
    paragraphs: [
      '先月、私は新しいアパートに引っ越しました。前のアパートより広くて、駅にも近いです。',
      '引っ越しの日は本当にたいへんでした。友達が手伝ってくれたので、はやく終わりました。',
      '新しい部屋はまだ荷物でいっぱいですが、少しずつかたづけています。早く住みやすくしたいです。',
    ],
    vocab: [
      { word: '引っ越し', reading: 'ひっこし', meaning: 'moving (house)' },
      { word: '広い', reading: 'ひろい', meaning: 'spacious' },
      { word: '手伝う', reading: 'てつだう', meaning: 'to help' },
      { word: '荷物', reading: 'にもつ', meaning: 'luggage, belongings' },
      { word: '片付ける', reading: 'かたづける', meaning: 'to tidy up' },
    ],
    grammar: [{ point: '〜より', explanation: 'Comparison: A は B より〜 = "A is more … than B".', example: '前より広いです。', exampleEn: 'It is more spacious than before.' }],
  },
  {
    id: 'part-time-job', title: 'アルバイト', titleReading: 'アルバイト', titleEn: 'A Part-time Job',
    level: 'N4', category: 'story',
    summary: 'A student’s first part-time job at a café.',
    paragraphs: [
      '私は大学生です。週に三回、カフェでアルバイトをしています。',
      '仕事はコーヒーを作ったり、お客さんに料理を運んだりすることです。はじめはむずかしかったです。',
      '今は仕事にもなれて、楽しくなりました。お金をためて、旅行に行きたいです。',
    ],
    vocab: [
      { word: '大学生', reading: 'だいがくせい', meaning: 'university student' },
      { word: 'お客さん', reading: 'おきゃくさん', meaning: 'customer, guest' },
      { word: '運ぶ', reading: 'はこぶ', meaning: 'to carry' },
      { word: '慣れる', reading: 'なれる', meaning: 'to get used to' },
      { word: '貯める', reading: 'ためる', meaning: 'to save (money)' },
    ],
    grammar: [{ point: '〜たり〜たりする', explanation: 'Lists example actions: A たり B たりする = "do things like A and B".', example: '作ったり運んだりします。', exampleEn: 'I do things like making and carrying.' }],
  },
  {
    id: 'making-curry', title: 'カレーを作る', titleReading: 'カレーをつくる', titleEn: 'Making Curry',
    level: 'N4', category: 'story',
    summary: 'Cooking a pot of Japanese curry for friends.',
    paragraphs: [
      '今日は友達が家に来るので、カレーを作ることにしました。',
      'まず、玉ねぎとにんじんとじゃがいもを切ります。それから、肉といっしょになべでいためます。',
      '水を入れて、三十分ぐらい煮ます。最後にカレーのルーを入れれば、できあがりです。',
    ],
    vocab: [
      { word: '玉ねぎ', reading: 'たまねぎ', meaning: 'onion' },
      { word: '切る', reading: 'きる', meaning: 'to cut' },
      { word: '肉', reading: 'にく', meaning: 'meat' },
      { word: '煮る', reading: 'にる', meaning: 'to simmer, to boil' },
      { word: '最後', reading: 'さいご', meaning: 'the end, last' },
    ],
    grammar: [{ point: '〜ことにする', explanation: 'Deciding to do something: Verb + ことにする = "decide to …".', example: 'カレーを作ることにしました。', exampleEn: 'I decided to make curry.' }],
  },
  {
    id: 'lost-umbrella', title: '忘れ物', titleReading: 'わすれもの', titleEn: 'The Forgotten Umbrella',
    level: 'N4', category: 'story',
    summary: 'A rainy-day mix-up over a left-behind umbrella.',
    paragraphs: [
      '雨の日、私は電車の中にかさを忘れてしまいました。家に着いてから気づきました。',
      '次の日、駅の忘れ物センターに行って、聞いてみました。',
      'よかったです。私のかさがありました。えきいんさんに「ありがとうございます」と言いました。',
    ],
    vocab: [
      { word: '忘れ物', reading: 'わすれもの', meaning: 'a lost/forgotten item' },
      { word: '傘', reading: 'かさ', meaning: 'umbrella' },
      { word: '着く', reading: 'つく', meaning: 'to arrive' },
      { word: '気づく', reading: 'きづく', meaning: 'to notice, to realize' },
      { word: '次', reading: 'つぎ', meaning: 'next' },
    ],
    grammar: [{ point: '〜てしまう', explanation: 'Expresses completion or regret: 忘れてしまった = "went and forgot (oops)".', example: 'かさを忘れてしまいました。', exampleEn: 'I (unfortunately) forgot my umbrella.' }],
  },
  {
    id: 'mountain-hike', title: '山登り', titleReading: 'やまのぼり', titleEn: 'A Mountain Hike',
    level: 'N4', category: 'story',
    summary: 'An early-morning climb rewarded by a view above the clouds.',
    paragraphs: [
      '先週の土曜日、友達と山に登りました。朝早く、まだ暗いうちに出発しました。',
      '道はけっこうきびしくて、何度も休みました。でも、山の空気はとてもきれいでした。',
      '頂上に着いたとき、雲の上に太陽が見えました。がんばってよかったと思いました。',
    ],
    vocab: [
      { word: '登る', reading: 'のぼる', meaning: 'to climb' },
      { word: '出発', reading: 'しゅっぱつ', meaning: 'departure' },
      { word: '空気', reading: 'くうき', meaning: 'air' },
      { word: '頂上', reading: 'ちょうじょう', meaning: 'summit, peak' },
      { word: '太陽', reading: 'たいよう', meaning: 'the sun' },
    ],
    grammar: [{ point: '〜てよかった', explanation: 'Expresses relief/gladness that something was done: 〜てよかった = "I’m glad I …".', example: 'がんばってよかったです。', exampleEn: 'I’m glad I tried hard.' }],
  },
  {
    id: 'letter-to-grandmother', title: '祖母への手紙', titleReading: 'そぼへのてがみ', titleEn: 'A Letter to Grandmother',
    level: 'N4', category: 'story',
    summary: 'A gentle letter home to a grandmother in the countryside.',
    paragraphs: [
      'おばあちゃん、お元気ですか。私は東京で元気にくらしています。',
      '大学の勉強はいそがしいですが、毎日楽しいです。友達もたくさんできました。',
      'ふゆ休みには、そちらに帰ります。おばあちゃんの作るごはんが食べたいです。体に気をつけてください。',
    ],
    vocab: [
      { word: '祖母', reading: 'そぼ', meaning: 'grandmother' },
      { word: '手紙', reading: 'てがみ', meaning: 'letter' },
      { word: '暮らす', reading: 'くらす', meaning: 'to live, to get by' },
      { word: '忙しい', reading: 'いそがしい', meaning: 'busy' },
      { word: '体', reading: 'からだ', meaning: 'body, health' },
    ],
    grammar: [{ point: '〜に気をつける', explanation: '"Be careful of / take care of …": 体に気をつけてください = "please take care of your health".', example: '体に気をつけてください。', exampleEn: 'Please take care of yourself.' }],
  },
  {
    id: 'cat-cafe', title: '猫カフェ', titleReading: 'ねこカフェ', titleEn: 'The Cat Café',
    level: 'N4', category: 'story',
    summary: 'A relaxing hour spent among the cats at a café.',
    paragraphs: [
      '日本には「猫カフェ」という店があります。コーヒーを飲みながら、猫と遊べる店です。',
      '昨日、はじめて猫カフェに行きました。中には十ぴきぐらいの猫がいました。',
      '一ぴきの黒い猫が私のひざの上で寝ました。とてもかわいくて、しあわせな気持ちになりました。',
    ],
    vocab: [
      { word: '店', reading: 'みせ', meaning: 'shop' },
      { word: '初めて', reading: 'はじめて', meaning: 'for the first time' },
      { word: '黒い', reading: 'くろい', meaning: 'black' },
      { word: '膝', reading: 'ひざ', meaning: 'lap, knee' },
      { word: '気持ち', reading: 'きもち', meaning: 'feeling' },
    ],
    grammar: [{ point: '〜ながら', explanation: 'Two actions at once: Verb-stem + ながら = "while doing …".', example: 'コーヒーを飲みながら遊びます。', exampleEn: 'I play while drinking coffee.' }],
  },
  {
    id: 'fireworks-festival', title: '花火大会', titleReading: 'はなびたいかい', titleEn: 'The Fireworks Festival',
    level: 'N4', category: 'story',
    summary: 'A summer evening at a riverside fireworks display.',
    paragraphs: [
      '夏の夜、町で花火大会がありました。私は友達とゆかたを着て行きました。',
      '川のそばにはたくさんの人がいました。屋台でやきそばやかき氷を買いました。',
      '空に大きな花火が上がりました。とてもきれいで、みんな「わあ」と声を上げました。',
    ],
    vocab: [
      { word: '花火', reading: 'はなび', meaning: 'fireworks' },
      { word: '浴衣', reading: 'ゆかた', meaning: 'yukata (summer kimono)' },
      { word: '屋台', reading: 'やたい', meaning: 'food stall' },
      { word: '上がる', reading: 'あがる', meaning: 'to rise, to go up' },
      { word: '声', reading: 'こえ', meaning: 'voice' },
    ],
  },
  {
    id: 'piano-practice', title: 'ピアノの練習', titleReading: 'ピアノのれんしゅう', titleEn: 'Piano Practice',
    level: 'N4', category: 'story',
    summary: 'The slow, patient work of learning a difficult song.',
    paragraphs: [
      '私は三年前からピアノを習っています。毎日少しずつ練習しています。',
      '今、むずかしい曲を練習しています。はじめは全然ひけませんでした。',
      'でも、毎日練習したら、だんだんひけるようになりました。来月、はっぴょう会でひきます。',
    ],
    vocab: [
      { word: '練習', reading: 'れんしゅう', meaning: 'practice' },
      { word: '習う', reading: 'ならう', meaning: 'to learn (from a teacher)' },
      { word: '曲', reading: 'きょく', meaning: 'song, musical piece' },
      { word: '全然', reading: 'ぜんぜん', meaning: '(not) at all' },
      { word: '発表会', reading: 'はっぴょうかい', meaning: 'recital' },
    ],
    grammar: [{ point: '〜ようになる', explanation: 'A change over time / gained ability: ひけるようになった = "came to be able to play".', example: 'ひけるようになりました。', exampleEn: 'I became able to play it.' }],
  },
  {
    id: 'old-bookstore', title: '古い本屋', titleReading: 'ふるいほんや', titleEn: 'The Old Bookstore',
    level: 'N4', category: 'story',
    summary: 'A quiet discovery in a narrow street of secondhand books.',
    paragraphs: [
      '町のせまい通りに、古い本屋があります。おじいさんが一人でやっています。',
      '店の中は古い本のにおいがします。私はときどきそこで古い本をさがします。',
      '昨日、五十年前の写真集を見つけました。昔の東京の写真がのっていて、とてもおもしろかったです。',
    ],
    vocab: [
      { word: '本屋', reading: 'ほんや', meaning: 'bookstore' },
      { word: '狭い', reading: 'せまい', meaning: 'narrow' },
      { word: '通り', reading: 'とおり', meaning: 'street' },
      { word: '探す', reading: 'さがす', meaning: 'to search for' },
      { word: '見つける', reading: 'みつける', meaning: 'to find' },
    ],
  },
  {
    id: 'princess-kaguya', title: 'かぐや姫', titleReading: 'かぐやひめ', titleEn: 'Princess Kaguya',
    level: 'N4', category: 'folktale',
    credit: 'Based on the public-domain tale "Taketori Monogatari". Retold in simple Japanese.',
    summary: 'The moon princess found inside a shining stalk of bamboo.',
    paragraphs: [
      '昔、竹を取って生活しているおじいさんがいました。ある日、光る竹を見つけました。',
      '竹を切ると、中に小さくてきれいな女の子がいました。おじいさんとおばあさんは、その子を大切に育てました。',
      '女の子は美しい姫になりました。しかし、じつは月の世界の人で、ある秋の夜、月へ帰っていきました。',
    ],
    vocab: [
      { word: '竹', reading: 'たけ', meaning: 'bamboo' },
      { word: '光る', reading: 'ひかる', meaning: 'to shine' },
      { word: '育てる', reading: 'そだてる', meaning: 'to raise, to bring up' },
      { word: '姫', reading: 'ひめ', meaning: 'princess' },
      { word: '世界', reading: 'せかい', meaning: 'world' },
    ],
  },
  {
    id: 'hanasaka', title: '花咲かじいさん', titleReading: 'はなさかじいさん', titleEn: 'The Old Man Who Made Flowers Bloom',
    level: 'N4', category: 'folktale',
    credit: 'Traditional Japanese folktale (public domain). Retold in simple Japanese.',
    summary: 'A kind old man, a loyal dog, and ashes that make trees blossom.',
    paragraphs: [
      '昔、心のやさしいおじいさんが、白い犬をかわいがっていました。',
      'その犬のおかげで、おじいさんは山でたくさんの金を見つけました。となりのいじわるなおじいさんは、それをうらやましく思いました。',
      'さいごに、やさしいおじいさんは、はいを木にまいて、かれた木に美しい花をさかせました。とのさまも大よろこびしました。',
    ],
    vocab: [
      { word: '優しい', reading: 'やさしい', meaning: 'kind, gentle' },
      { word: '可愛がる', reading: 'かわいがる', meaning: 'to love, to be affectionate to' },
      { word: '隣', reading: 'となり', meaning: 'next door, neighbor' },
      { word: '灰', reading: 'はい', meaning: 'ash' },
      { word: '咲かせる', reading: 'さかせる', meaning: 'to make bloom' },
    ],
  },
  {
    id: 'the-bento-box', title: 'お弁当', titleReading: 'おべんとう', titleEn: 'The Bento Box',
    level: 'N4', category: 'article',
    summary: 'What a Japanese boxed lunch is and why it’s special.',
    paragraphs: [
      'お弁当は、家で作って外で食べる食事です。学校や会社に持っていきます。',
      '弁当には、ごはんやおかずが色々入っています。魚、たまご焼き、野菜などがよく入っています。',
      '色や形をきれいにならべた弁当は「キャラ弁」と呼ばれ、子どもに人気があります。',
    ],
    vocab: [
      { word: '弁当', reading: 'べんとう', meaning: 'boxed lunch' },
      { word: '食事', reading: 'しょくじ', meaning: 'meal' },
      { word: 'おかず', reading: 'おかず', meaning: 'side dish' },
      { word: '形', reading: 'かたち', meaning: 'shape' },
      { word: '並べる', reading: 'ならべる', meaning: 'to arrange, to line up' },
    ],
  },

  // ---------------- N3 ----------------
  {
    id: 'trains-in-japan', title: '日本の電車', titleReading: 'にほんのでんしゃ', titleEn: 'Trains in Japan',
    level: 'N3', category: 'article',
    summary: 'Why Japan’s railways are famous for being fast, clean, and on time.',
    paragraphs: [
      '日本の電車は、世界でも時間に正確なことで有名です。ほとんどの電車が、一分もおくれずに来ます。',
      '大きな駅では、たくさんの路線が集まっていて、まるでめいろのようです。はじめて来た人はよく道にまよいます。',
      '中でも新幹線は、時速三百キロ近くで走ります。東京から大阪まで、およそ二時間半で着くことができます。',
    ],
    vocab: [
      { word: '正確', reading: 'せいかく', meaning: 'accurate, precise' },
      { word: '遅れる', reading: 'おくれる', meaning: 'to be late, delayed' },
      { word: '路線', reading: 'ろせん', meaning: 'train line, route' },
      { word: '迷う', reading: 'まよう', meaning: 'to get lost, to hesitate' },
      { word: '新幹線', reading: 'しんかんせん', meaning: 'bullet train' },
    ],
    grammar: [{ point: '〜ことで有名', explanation: '"Famous for (doing/being) …": 正確なことで有名 = "famous for being precise".', example: '時間に正確なことで有名です。', exampleEn: 'It is famous for being on time.' }],
  },
  {
    id: 'sorting-the-trash', title: 'ゴミの分別', titleReading: 'ゴミのぶんべつ', titleEn: 'Sorting the Trash',
    level: 'N3', category: 'article',
    summary: 'How and why Japan separates its household garbage so carefully.',
    paragraphs: [
      '日本では、ゴミを細かく分けて出すルールがあります。これを「分別」と言います。',
      '燃えるゴミ、燃えないゴミ、プラスチック、びん、かんなど、種類によって出す日が決まっています。はじめて日本に住む外国人は、よくおどろきます。',
      '少し面倒に感じるかもしれませんが、資源を大切にし、環境を守るために役に立っています。',
    ],
    vocab: [
      { word: '分別', reading: 'ぶんべつ', meaning: 'sorting, separation' },
      { word: '燃える', reading: 'もえる', meaning: 'to burn' },
      { word: '種類', reading: 'しゅるい', meaning: 'kind, type' },
      { word: '面倒', reading: 'めんどう', meaning: 'troublesome, a hassle' },
      { word: '環境', reading: 'かんきょう', meaning: 'environment' },
    ],
    grammar: [{ point: '〜によって', explanation: '"Depending on / according to …": 種類によって = "depending on the type".', example: '種類によって日が決まっています。', exampleEn: 'The day is decided according to the type.' }],
  },
  {
    id: 'history-of-manga', title: '漫画の歴史', titleReading: 'まんがのれきし', titleEn: 'A Short History of Manga',
    level: 'N3', category: 'article',
    summary: 'From playful old picture scrolls to a global pop-culture force.',
    paragraphs: [
      '漫画は今、世界中で読まれていますが、その歴史は長いです。',
      '古い時代の絵巻物には、すでに動物を人のようにえがいた絵があり、これが漫画のもとだと言われています。',
      '戦後、手塚治虫のような作家が、物語のある長い漫画を広めました。今では、漫画は日本を代表する文化の一つになっています。',
    ],
    vocab: [
      { word: '漫画', reading: 'まんが', meaning: 'manga, comics' },
      { word: '歴史', reading: 'れきし', meaning: 'history' },
      { word: '描く', reading: 'えがく', meaning: 'to draw, to depict' },
      { word: '作家', reading: 'さっか', meaning: 'author, creator' },
      { word: '文化', reading: 'ぶんか', meaning: 'culture' },
    ],
    grammar: [{ point: '〜と言われている', explanation: '"It is said that …": 漫画のもとだと言われている = "it is said to be the origin of manga".', example: '漫画のもとだと言われています。', exampleEn: 'It is said to be the origin of manga.' }],
  },
  {
    id: 'hokkaido', title: '北海道', titleReading: 'ほっかいどう', titleEn: 'Hokkaido',
    level: 'N3', category: 'article',
    summary: 'Japan’s big northern island — nature, snow, and food.',
    paragraphs: [
      '北海道は、日本の一番北にある大きな島です。自然がゆたかで、広い土地が広がっています。',
      '冬はとても寒く、雪がたくさんふります。そのため、スキーやゆきまつりが有名で、多くの観光客が集まります。',
      'また、北海道は食べ物がおいしいことでも知られています。新鮮な魚や牛乳、ラーメンなどが人気です。',
    ],
    vocab: [
      { word: '島', reading: 'しま', meaning: 'island' },
      { word: '自然', reading: 'しぜん', meaning: 'nature' },
      { word: '豊か', reading: 'ゆたか', meaning: 'rich, abundant' },
      { word: '観光客', reading: 'かんこうきゃく', meaning: 'tourist' },
      { word: '新鮮', reading: 'しんせん', meaning: 'fresh' },
    ],
  },
  {
    id: 'japanese-work-style', title: '日本の働き方', titleReading: 'にほんのはたらきかた', titleEn: 'Working in Japan',
    level: 'N3', category: 'article',
    summary: 'How work culture in Japan is changing in recent years.',
    paragraphs: [
      '昔の日本では、一つの会社で定年まで働くのがふつうでした。長い時間働く人も多かったです。',
      'しかし、最近は考え方が変わってきています。家族との時間や、自分の生活を大切にする人が増えました。',
      '在宅勤務をみとめる会社も多くなり、働き方はどんどん自由になってきています。',
    ],
    vocab: [
      { word: '定年', reading: 'ていねん', meaning: 'retirement age' },
      { word: '考え方', reading: 'かんがえかた', meaning: 'way of thinking' },
      { word: '生活', reading: 'せいかつ', meaning: 'daily life' },
      { word: '増える', reading: 'ふえる', meaning: 'to increase' },
      { word: '在宅勤務', reading: 'ざいたくきんむ', meaning: 'working from home' },
    ],
    grammar: [{ point: '〜てくる (gradual change)', explanation: 'Shows a change developing up to now: 変わってきている = "has been changing".', example: '考え方が変わってきています。', exampleEn: 'Ways of thinking have been changing.' }],
  },
]

await mkdir(readingsDir, { recursive: true })

// Write each new reading file.
for (const r of READINGS) {
  await writeFile(join(readingsDir, `${r.id}.json`), JSON.stringify(r, null, 2) + '\n', 'utf8')
}

// Rebuild the catalog from ALL reading files, preserving the existing order and
// appending any new ids at the end.
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
} catch {
  /* no previous catalog */
}
for (const id of Object.keys(byId)) if (!order.includes(id)) order.push(id)

const catalog = { version: 1, readings: order.map((id) => byId[id]) }
await writeFile(join(contentDir, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n', 'utf8')

console.log(`Wrote ${READINGS.length} new readings. Catalog now lists ${catalog.readings.length} readings.`)
