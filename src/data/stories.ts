import type { Story } from './types'

// Tokens: `w` is the written surface form, `r` is the hiragana reading (used for
// furigana over words containing kanji), `g` is an optional whole-word gloss.
// Particles, kana words, and punctuation omit `r`.

export const STORIES: Story[] = [
  {
    id: 'my-day',
    title: '私の一日',
    titleReading: 'わたしのいちにち',
    titleEn: 'My Day',
    level: 'N5',
    summary: 'A student introduces their daily routine — school, friends, and Japanese.',
    paragraphs: [
      [
        [{ w: '私', r: 'わたし', g: 'I, me' }, { w: 'は' }, { w: '日本語', r: 'にほんご', g: 'Japanese language' }, { w: 'の' }, { w: '学生', r: 'がくせい', g: 'student' }, { w: 'です' }, { w: '。' }],
        [{ w: '毎朝', r: 'まいあさ', g: 'every morning' }, { w: '、' }, { w: '学校', r: 'がっこう', g: 'school' }, { w: 'へ' }, { w: '行きます', r: 'いきます', g: 'to go' }, { w: '。' }],
        [{ w: '学校', r: 'がっこう' }, { w: 'で' }, { w: '日本語', r: 'にほんご' }, { w: 'を' }, { w: '学びます', r: 'まなびます', g: 'to learn' }, { w: '。' }],
      ],
      [
        [{ w: '先生', r: 'せんせい', g: 'teacher' }, { w: 'は' }, { w: 'とても' }, { w: 'いい' }, { w: '人', r: 'ひと', g: 'person' }, { w: 'です' }, { w: '。' }],
        [{ w: '友だち', r: 'ともだち', g: 'friend' }, { w: 'と' }, { w: 'いっしょに' }, { w: '本', r: 'ほん', g: 'book' }, { w: 'を' }, { w: '読みます', r: 'よみます', g: 'to read' }, { w: '。' }],
        [{ w: 'おひる' }, { w: 'に' }, { w: 'ごはん' }, { w: 'を' }, { w: '食べます', r: 'たべます', g: 'to eat' }, { w: '。' }],
        [{ w: '今', r: 'いま', g: 'now' }, { w: '、' }, { w: '日本語', r: 'にほんご' }, { w: 'が' }, { w: '大好き', r: 'だいすき', g: 'to love / like a lot' }, { w: 'です' }, { w: '。' }],
      ],
    ],
    vocab: [
      { word: '学生', reading: 'がくせい', meaning: 'student' },
      { word: '毎朝', reading: 'まいあさ', meaning: 'every morning' },
      { word: '学校', reading: 'がっこう', meaning: 'school' },
      { word: '学ぶ', reading: 'まなぶ', meaning: 'to learn, to study' },
      { word: '先生', reading: 'せんせい', meaning: 'teacher' },
      { word: '友だち', reading: 'ともだち', meaning: 'friend' },
      { word: '読む', reading: 'よむ', meaning: 'to read' },
      { word: '大好き', reading: 'だいすき', meaning: 'to love, to really like' },
    ],
    grammar: [
      { point: '〜は 〜です', explanation: 'The basic "A is B" sentence. は marks the topic; です makes it polite.', example: '私は学生です。', exampleEn: 'I am a student.' },
      { point: '〜へ 行きます', explanation: 'へ marks a destination of motion. Use it with 行く (go), 来る (come), 帰る (return).', example: '学校へ行きます。', exampleEn: 'I go to school.' },
      { point: '〜を [verb]ます', explanation: 'を marks the direct object — the thing the verb acts on.', example: '本を読みます。', exampleEn: 'I read a book.' },
      { point: '〜が 好き / 大好き です', explanation: 'The thing you like is marked with が, not を. 大好き = like a lot.', example: '日本語が大好きです。', exampleEn: 'I love Japanese.' },
    ],
  },
  {
    id: 'breakfast',
    title: '朝ごはん',
    titleReading: 'あさごはん',
    titleEn: 'Breakfast',
    level: 'N5',
    summary: 'A warm look at one family eating breakfast together in the morning.',
    paragraphs: [
      [
        [{ w: '今日', r: 'きょう', g: 'today' }, { w: 'は' }, { w: 'いい' }, { w: '天気', r: 'てんき', g: 'weather' }, { w: 'です' }, { w: '。' }],
        [{ w: '母', r: 'はは', g: 'mother' }, { w: 'は' }, { w: '朝ごはん', r: 'あさごはん', g: 'breakfast' }, { w: 'を' }, { w: 'つくります' }, { w: '。' }],
      ],
      [
        [{ w: '私', r: 'わたし' }, { w: 'は' }, { w: '魚', r: 'さかな', g: 'fish' }, { w: 'と' }, { w: 'ごはん' }, { w: 'を' }, { w: '食べます', r: 'たべます' }, { w: '。' }],
        [{ w: '父', r: 'ちち', g: 'father' }, { w: 'は' }, { w: 'おちゃ' }, { w: 'を' }, { w: '飲みます', r: 'のみます', g: 'to drink' }, { w: '。' }],
        [{ w: 'とても' }, { w: 'おいしい' }, { w: 'です' }, { w: '。' }],
      ],
      [
        [{ w: '毎朝', r: 'まいあさ' }, { w: '、' }, { w: '家ぞく', r: 'かぞく', g: 'family' }, { w: 'で' }, { w: '話します', r: 'はなします', g: 'to talk' }, { w: '。' }],
        [{ w: '朝', r: 'あさ', g: 'morning' }, { w: 'の' }, { w: '時間', r: 'じかん', g: 'time' }, { w: 'が' }, { w: '大好き', r: 'だいすき' }, { w: 'です' }, { w: '。' }],
      ],
    ],
    vocab: [
      { word: '今日', reading: 'きょう', meaning: 'today' },
      { word: '天気', reading: 'てんき', meaning: 'weather' },
      { word: '朝ごはん', reading: 'あさごはん', meaning: 'breakfast' },
      { word: '魚', reading: 'さかな', meaning: 'fish' },
      { word: '飲む', reading: 'のむ', meaning: 'to drink' },
      { word: '話す', reading: 'はなす', meaning: 'to talk, to speak' },
      { word: '時間', reading: 'じかん', meaning: 'time, hour' },
    ],
    grammar: [
      { point: '〜と〜', explanation: 'と connects two nouns like "and": A と B = "A and B".', example: '魚とごはん', exampleEn: 'fish and rice' },
      { point: '〜で (means / location of action)', explanation: 'で marks where an action happens, or the means by which it is done.', example: '家ぞくで話します。', exampleEn: 'We talk as a family.' },
      { point: 'い-adjective + です', explanation: 'い-adjectives (おいしい, いい) come straight before です with no な.', example: 'とてもおいしいです。', exampleEn: 'It is very delicious.' },
    ],
  },
  {
    id: 'mountain-and-sea',
    title: '山と海',
    titleReading: 'やまとうみ',
    titleEn: 'The Mountain and the Sea',
    level: 'N5',
    summary: 'A day trip with a friend — climbing a mountain and visiting the sea.',
    paragraphs: [
      [
        [{ w: 'なつやすみ' }, { w: '、' }, { w: '友だち', r: 'ともだち' }, { w: 'と' }, { w: '山', r: 'やま', g: 'mountain' }, { w: 'へ' }, { w: '行きました', r: 'いきました', g: 'went' }, { w: '。' }],
        [{ w: '山', r: 'やま' }, { w: 'は' }, { w: '高くて', r: 'たかくて', g: 'tall and…' }, { w: '、' }, { w: 'きれい' }, { w: 'でした' }, { w: '。' }],
        [{ w: '川', r: 'かわ', g: 'river' }, { w: 'の' }, { w: '水', r: 'みず', g: 'water' }, { w: 'は' }, { w: 'つめたかった' }, { w: 'です' }, { w: '。' }],
      ],
      [
        [{ w: 'おひる' }, { w: 'に' }, { w: '海', r: 'うみ', g: 'sea' }, { w: 'へ' }, { w: '行きました', r: 'いきました' }, { w: '。' }],
        [{ w: '海', r: 'うみ' }, { w: 'で' }, { w: '魚', r: 'さかな' }, { w: 'を' }, { w: '見ました', r: 'みました', g: 'saw' }, { w: '。' }],
        [{ w: '空', r: 'そら', g: 'sky' }, { w: 'は' }, { w: 'とても' }, { w: 'きれい' }, { w: 'でした' }, { w: '。' }],
        [{ w: '楽しい', r: 'たのしい', g: 'fun, enjoyable' }, { w: '一日', r: 'いちにち', g: 'one day' }, { w: 'でした' }, { w: '。' }],
      ],
    ],
    vocab: [
      { word: '山', reading: 'やま', meaning: 'mountain' },
      { word: '高い', reading: 'たかい', meaning: 'tall, high; expensive' },
      { word: '川', reading: 'かわ', meaning: 'river' },
      { word: '海', reading: 'うみ', meaning: 'sea, ocean' },
      { word: '見る', reading: 'みる', meaning: 'to see, to look' },
      { word: '空', reading: 'そら', meaning: 'sky' },
      { word: '楽しい', reading: 'たのしい', meaning: 'fun, enjoyable' },
    ],
    grammar: [
      { point: '〜ました (past polite)', explanation: 'Change ます to ました for the polite past tense.', example: '山へ行きました。', exampleEn: 'I went to the mountain.' },
      { point: 'い-adjective + くて', explanation: 'Drop い and add くて to join adjectives or clauses: "tall and…".', example: '高くて、きれいでした。', exampleEn: 'It was tall and beautiful.' },
      { point: 'でした', explanation: 'The past tense of です. Use it with nouns and な-adjectives.', example: '楽しい一日でした。', exampleEn: 'It was a fun day.' },
    ],
  },
  {
    id: 'shop-in-town',
    title: '町の店',
    titleReading: 'まちのみせ',
    titleEn: 'The Shop in Town',
    level: 'N5',
    summary: 'A favorite little bookshop run by a friend\'s mother.',
    paragraphs: [
      [
        [{ w: '私', r: 'わたし' }, { w: 'の' }, { w: '町', r: 'まち', g: 'town' }, { w: 'に' }, { w: '新しい', r: 'あたらしい', g: 'new' }, { w: '店', r: 'みせ', g: 'shop' }, { w: 'が' }, { w: 'あります' }, { w: '。' }],
        [{ w: '友だち', r: 'ともだち' }, { w: 'の' }, { w: 'お母さん', r: 'おかあさん', g: 'mother (polite)' }, { w: 'の' }, { w: '店', r: 'みせ' }, { w: 'です' }, { w: '。' }],
      ],
      [
        [{ w: 'そこ' }, { w: 'で' }, { w: '本', r: 'ほん' }, { w: 'を' }, { w: '買います', r: 'かいます', g: 'to buy' }, { w: '。' }],
        [{ w: 'きのう' }, { w: '、' }, { w: '日本語', r: 'にほんご' }, { w: 'の' }, { w: '本', r: 'ほん' }, { w: 'を' }, { w: '買いました', r: 'かいました', g: 'bought' }, { w: '。' }],
        [{ w: '店', r: 'みせ' }, { w: 'の' }, { w: '人', r: 'ひと' }, { w: 'は' }, { w: 'みんな' }, { w: 'やさしい' }, { w: 'です' }, { w: '。' }],
      ],
      [
        [{ w: '電車', r: 'でんしゃ', g: 'train' }, { w: 'で' }, { w: '駅', r: 'えき', g: 'station' }, { w: 'から' }, { w: '行きます', r: 'いきます' }, { w: '。' }],
        [{ w: '私', r: 'わたし' }, { w: 'は' }, { w: 'この' }, { w: '店', r: 'みせ' }, { w: 'が' }, { w: '大好き', r: 'だいすき' }, { w: 'です' }, { w: '。' }],
      ],
    ],
    vocab: [
      { word: '町', reading: 'まち', meaning: 'town' },
      { word: '新しい', reading: 'あたらしい', meaning: 'new' },
      { word: '店', reading: 'みせ', meaning: 'shop, store' },
      { word: '買う', reading: 'かう', meaning: 'to buy' },
      { word: '電車', reading: 'でんしゃ', meaning: 'train' },
      { word: '駅', reading: 'えき', meaning: 'station' },
    ],
    grammar: [
      { point: '〜に 〜が あります', explanation: 'Existence of inanimate things: "in/at PLACE, there is THING".', example: '町に店があります。', exampleEn: 'There is a shop in town.' },
      { point: '〜で (place of action)', explanation: 'で marks the location where an activity takes place.', example: 'そこで本を買います。', exampleEn: 'I buy books there.' },
      { point: '〜から', explanation: 'から means "from" a starting point in space or time.', example: '駅から行きます。', exampleEn: 'I go from the station.' },
    ],
  },
]
