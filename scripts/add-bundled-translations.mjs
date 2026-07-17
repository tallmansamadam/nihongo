// Inserts paragraphsEn / lyricsEn / credits into the bundled data files
// (src/data/{stories,readings,songs}.ts) by anchoring on each item's id line.
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')

const STORY_EN = {
  'my-day': [
    'I am a student of Japanese. Every morning, I go to school. At school, I study Japanese.',
    'My teacher is a very kind person. I read books together with my friends. At noon, I eat lunch. These days, I love Japanese.',
  ],
  breakfast: [
    'The weather is lovely today. My mother makes breakfast.',
    'I eat fish and rice. My father drinks tea. It is all delicious.',
    'Every morning, our family talks together. I love the morning hours.',
  ],
  'mountain-and-sea': [
    'During summer vacation, I went to the mountains with my friends. The mountains were tall and beautiful. The river water was cold.',
    'At noon, we went to the sea. We saw fish in the water. The sky was very beautiful. It was a wonderful day.',
  ],
  'shop-in-town': [
    "There is a new shop in my town. It is my friend's mother's shop.",
    'I buy books there. Yesterday, I bought a Japanese book. Everyone at the shop is kind.',
    'I go by train from the station. I love this shop.',
  ],
}

const READING_EN = {
  'cat-tama': [
    'At my house there is a cat named Tama. Tama is a small white cat.',
    'Every morning, Tama sleeps on my bed. When I come home from school, Tama is waiting by the door.',
    'Tama loves fish. At night she goes out, and in the morning she comes home again. I love Tama.',
  ],
  'rainy-day': [
    'It has been raining since this morning. I stayed home and read a book.',
    'My mother made me warm tea.',
    'In the afternoon, the rain stopped and a rainbow appeared in the sky. It was beautiful.',
  ],
  'kyoto-trip': [
    'Last week, my family went to Kyoto. Kyoto is an old Japanese city with many temples.',
    'We took an early-morning train. We saw famous temples and took lots of photos.',
    'At noon, we ate delicious soba. Before going home, we bought souvenirs. It was a very fun day.',
  ],
  'four-seasons': [
    'Japan has four seasons: spring, summer, autumn, and winter.',
    'In spring, the cherry blossoms bloom. Many people hold hanami parties in the parks. Summer is hot, and many people go to the sea or the pool.',
    'In autumn, the leaves turn red and yellow. Winter is cold, and in the north a great deal of snow falls.',
    'With each season, the food and the festivals change too.',
  ],
  'about-sushi': [
    'Sushi is one of the most famous foods of Japan.',
    "Long ago, sushi was a way of preserving fish. Today's sushi is made by placing fresh fish on top of rice.",
    'Sushi is very popular abroad as well. You can eat it at a restaurant, or make it at home.',
  ],
  momotaro: [
    'Long, long ago, in a certain place, there lived an old man and an old woman.',
    'One day, the old woman found a huge peach in the river. When they took it home and cut it open, out came a healthy baby boy. They named him Momotarō — the Peach Boy.',
    'When Momotarō grew up, he set out on a journey to defeat the oni. Along the road, a dog, a monkey, and a pheasant joined him.',
    'Together they defeated the oni. Momotarō returned home with the treasure.',
  ],
}

// line-for-line with each song's `lyrics` field (public-domain works;
// translations original to this project)
const SONG_EN = {
  'sakura-sakura': [
    'Cherry blossoms, cherry blossoms',
    'Across the hills and villages',
    'As far as the eye can see',
    'Like mist, like clouds',
    'Fragrant in the morning sun',
    'Cherry blossoms, cherry blossoms',
    'In full bloom',
  ],
  furusato: [
    'Those hills where I chased rabbits',
    'That river where I fished for minnows',
    'Even now they return in my dreams',
    'My unforgettable home',
  ],
  'haru-ga-kita': [
    'Spring has come, spring has come — where has it come?',
    'To the hills, to the village, and to the fields',
  ],
  oborozukiyo: [
    'Over the field of rapeseed flowers, the setting sun fades',
    'The mountain rims I gaze upon lie deep in haze',
    'When I look at the sky where the spring breeze stirs',
    'The evening moon hangs there, faint in its glow',
  ],
  'kojo-no-tsuki': [
    'Spring: a flower banquet at the high castle tower',
    'The passing cups catching the light',
    'Through branches of thousand-year pines it shone',
    'That light of old — where is it now?',
  ],
  'hamabe-no-uta': [
    'Wandering the beach at morning',
    'Memories of long ago come back to me',
    'The sound of the wind, the shapes of the clouds',
    'The lapping waves, the colors of the shells',
  ],
}

// Creator credits (composer/lyricist — not just the performer).
const SONG_CREDITS = {
  'real-folk-blues': 'Music: 菅野よう子 (Yoko Kanno) · Lyrics: 岩里祐穂 (Yūho Iwasato) · Vocals: 山根麻衣 (Mai Yamane)',
  'cruel-angel-thesis': 'Music: 佐藤英敏 (Hidetoshi Satō) · Lyrics: 及川眠子 (Neko Oikawa) · Vocals: 高橋洋子 (Yoko Takahashi)',
  'my-will': 'Lyrics: 松室麻衣 (Mai Matsumuro) · Music: BOUNCEBACK · Vocals: dream',
  'sakura-sakura': 'Traditional — author unknown (Edo period)',
  furusato: 'Lyrics: 高野辰之 (Tatsuyuki Takano) · Music: 岡野貞一 (Teiichi Okano)',
  'haru-ga-kita': 'Lyrics: 高野辰之 (Tatsuyuki Takano) · Music: 岡野貞一 (Teiichi Okano)',
  oborozukiyo: 'Lyrics: 高野辰之 (Tatsuyuki Takano) · Music: 岡野貞一 (Teiichi Okano)',
  'kojo-no-tsuki': 'Lyrics: 土井晩翠 (Bansui Doi) · Music: 滝廉太郎 (Rentarō Taki)',
  'hamabe-no-uta': 'Lyrics: 林古渓 (Kokei Hayashi) · Music: 成田為三 (Tamezō Narita)',
}

function insertAfterId(src, id, insertion, marker) {
  const anchor = `id: '${id}',`
  const idx = src.indexOf(anchor)
  if (idx === -1) throw new Error(`anchor not found for ${id}`)
  if (src.includes(marker)) return src // already patched (idempotent-ish per marker)
  return src.slice(0, idx + anchor.length) + insertion + src.slice(idx + anchor.length)
}

// stories.ts
let stories = await readFile(join(dataDir, 'stories.ts'), 'utf8')
for (const [id, en] of Object.entries(STORY_EN)) {
  if (stories.includes(`/*en:${id}*/`)) continue
  stories = insertAfterId(stories, id, `\n    /*en:${id}*/ paragraphsEn: ${JSON.stringify(en)},`, `/*en:${id}*/`)
}
await writeFile(join(dataDir, 'stories.ts'), stories, 'utf8')

// readings.ts
let readings = await readFile(join(dataDir, 'readings.ts'), 'utf8')
for (const [id, en] of Object.entries(READING_EN)) {
  if (readings.includes(`/*en:${id}*/`)) continue
  readings = insertAfterId(readings, id, `\n    /*en:${id}*/ paragraphsEn: ${JSON.stringify(en)},`, `/*en:${id}*/`)
}
await writeFile(join(dataDir, 'readings.ts'), readings, 'utf8')

// songs.ts — credits for all, lyricsEn for public-domain songs
let songs = await readFile(join(dataDir, 'songs.ts'), 'utf8')
for (const [id, credits] of Object.entries(SONG_CREDITS)) {
  if (songs.includes(`/*cr:${id}*/`)) continue
  let ins = `\n    /*cr:${id}*/ credits: ${JSON.stringify(credits)},`
  if (SONG_EN[id]) ins += `\n    lyricsEn: ${JSON.stringify(SONG_EN[id].join('\n'))},`
  songs = insertAfterId(songs, id, ins, `/*cr:${id}*/`)
}
await writeFile(join(dataDir, 'songs.ts'), songs, 'utf8')

console.log('Patched stories.ts, readings.ts, songs.ts.')
