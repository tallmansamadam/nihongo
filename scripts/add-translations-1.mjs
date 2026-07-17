// Adds paragraphsEn to library readings (batch 3). Validates that the English
// paragraph count matches the Japanese before writing.
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'readings')

const EN = {
  'post-office': [
    'Today I went to the post office. It was because I wanted to send my friend a birthday present.',
    'I put a book and some sweets in a box. The person at the counter weighed it and said, "That will be three hundred yen."',
    'A week later, my friend called me. "Thank you for the present!" I was really happy.',
  ],
  goldfish: [
    'At the summer festival I played goldfish scooping. I got two goldfish.',
    'When I got home, I filled a big glass bowl with water. The goldfish are named Aka and Shiro — Red and White.',
    'Every morning I feed them. The goldfish eat with their little mouths gulping away. Watching them, I forget the time.',
  ],
  'radio-taiso': [
    'On summer-vacation mornings, I go to the park at six thirty. That is because there are radio exercises.',
    'Children and elderly people alike all move their bodies in time with the music.',
    'After the exercises, we get a stamp on our cards. Collect them all and you get sweets. The morning air feels wonderful.',
  ],
  'first-train-ride': [
    "Today, I rode the train alone for the first time. It is two stops to my grandmother's house.",
    'Gripping my ticket, I watched out the window. "Next stop: Sakura Station." That\'s my station!',
    'Grandma was waiting on the platform. "Look at you, coming all this way!" I felt like I had grown up a little.',
  ],
  'lost-puppy': [
    'One rainy evening, a small puppy was shivering in front of my house. It had a collar, but no name written on it.',
    'I dried the puppy with a towel and gave it some milk. Then I put up notices around the neighborhood: "We are looking after a puppy."',
    'Three days later, a girl came running. "Pochi!" The puppy wagged its tail hard. Saying goodbye was a little sad, but I think it was for the best.',
  ],
  'blackout-night': [
    'On the night of the typhoon, the electricity suddenly went out. The TV, the air conditioner — nothing worked.',
    'My mother brought out candles. The family gathered around the small light.',
    'My father told us stories from when he was a child. The blackout ended after two hours, but I still remember the stories from that night.',
  ],
  'rain-shelter': [
    'On my way home, it suddenly started to pour. I had no umbrella, so I took shelter under the eaves of a little shop.',
    'An old man was standing next to me. "It\'s really coming down." "It certainly is." And so we talked for a while.',
    'Fifteen minutes later, the rain stopped. "Well then, take care." Someone whose name I don\'t even know — and yet I walked away feeling warm inside.',
  ],
  'last-train': [
    'On Friday night, work dragged on, and before I knew it, it was eleven thirty. Only ten minutes until the last train.',
    'I ran to the station. At the ticket gate, I couldn\'t find my commuter pass. As I was turning my bag inside out, a station attendant said, "Go ahead and board. You can pay at the station where you get off."',
    'I made it with seconds to spare. A tired face was reflected in the train window. But thanks to that kindness, it felt like not such a bad night after all.',
  ],
  'urashima-taro': [
    'Long ago, there was a young fisherman called Urashima Tarō. One day, he rescued a turtle that was being bullied by children.',
    'In thanks, the turtle took Tarō to the Dragon Palace at the bottom of the sea. Tarō spent happy days there with the beautiful Princess Otohime.',
    'When he was leaving, Otohime gave him a treasure box, saying, "You must not open it." When he returned to his village, hundreds of years had passed. Tarō opened the box, white smoke rose from it, and he turned into an old man.',
  ],
  issunboshi: [
    'Long ago, a boy no bigger than a finger was born. His name was Issun-bōshi.',
    'Even as he grew older, his body stayed small. Issun-bōshi took a needle for a sword and sailed to the capital in a bowl for a boat.',
    'In the capital, Issun-bōshi fought an oni. The oni swallowed him whole, but he jabbed at its belly from inside with his needle until it surrendered. When he swung the magic mallet the oni had dropped, Issun-bōshi became a splendid young man.',
  ],
  'kasa-jizo': [
    "Long ago, there lived a poor old man and old woman. Though it was New Year's Eve, they had no money to buy rice cakes for the New Year.",
    'The old man went to town to sell woven hats, but could not sell a single one. On the way home, he saw six stone Jizō statues capped with snow, and he put his unsold hats on them.',
    'That night, there was a sound outside the house. When they opened the door, rice, rice cakes, and fish had been left there. Through the snow, they could just see the Jizō statues in their hats, heading home.',
  ],
  'shitakiri-suzume': [
    'Long ago, a kind old man doted on a little sparrow. But the mean old woman, angry that it had eaten her rice starch, cut the sparrow\'s tongue and drove it away.',
    'The old man went into the mountains to search for the sparrow. The sparrows welcomed him with a feast and brought out two wicker boxes, one large and one small. The old man chose the smaller one. Inside was treasure.',
    'Hearing this, the old woman went to claim the large box. But out of it came snakes and insects. Greed, the tale says, brings its own loss.',
  ],
  'moon-viewing': [
    'In autumn, on the night the moon is most beautiful, people in Japan hold otsukimi — moon viewing.',
    'They offer round dumplings and pampas grass to the round moon. It is said a rabbit lives on the moon.',
    'Quietly watching the moon — that is the whole of it, and yet it is a very Japanese sort of night.',
  ],
  'japanese-breakfast': [
    'The traditional Japanese breakfast is rice and miso soup. Grilled fish, eggs, nori seaweed, and pickles are also common.',
    'These days, plenty of people have bread and coffee instead. But stay at a ryokan inn, and a beautiful Japanese-style breakfast will appear.',
    'Warm rice and warm miso soup. Simple — but it is the strength you start the day with.',
  ],
  'kana-story': [
    'Japanese has two kana scripts, hiragana and katakana. Both were born from kanji.',
    'Hiragana are whole kanji written in a soft, flowing hand. Katakana are pieces taken from parts of kanji.',
    'Hiragana is used for Japanese words, katakana for words that came from abroad. That is why "kōhī" — coffee — is written in katakana.',
  ],
  'cherry-blossom-front': [
    'When spring comes, you hear the words "sakura zensen" — the cherry blossom front — on the news. It is the line connecting the places where cherry trees are beginning to bloom.',
    'The front starts in Kyushu in the south in March and reaches Hokkaido in the north in May. It travels the length of Japan over two months.',
    'Like a weather forecast, "bloom predictions" are announced, and people study them to plan their hanami parties.',
  ],
  bowing: [
    'In Japan, people lower their heads in greeting. This is called ojigi — the bow.',
    'There are kinds of bows. A light greeting is fifteen degrees; a polite greeting, thirty; and for apologies or deep gratitude, you bow forty-five degrees.',
    'Some people even bow while talking on the phone. The other person cannot see it — but feeling shows itself in the body all the same.',
  ],
  sento: [
    'A sento is a public bath shared by the whole neighborhood. In the old days many homes had no bath of their own, and the sento was an essential part of life.',
    'Before getting in, you wash yourself thoroughly. You must not put your towel in the bathwater. On the wall, more often than not, is a great painting of Mt. Fuji.',
    'Their numbers have dwindled, but the pleasure of a long soak in a big, deep bath is something a bath at home cannot give you.',
  ],
  'japanese-houses': [
    'When you enter a Japanese house, you first take off your shoes in the genkan. It is a culture that draws a clear line between inside and outside.',
    'Traditional rooms are laid with tatami mats. In a tatami room you spread a futon to sleep, and in the morning you fold it up and put it away in the closet.',
    'Instead of hinged doors there are sliding fusuma and shoji panels. Being able to change the shape of the rooms freely is one of the pleasures of a Japanese house.',
  ],
  omiyage: [
    'When Japanese people travel, they bring back omiyage — souvenirs — for family and coworkers. Most often, sweets from the place they visited.',
    'That is why Japan\'s stations and airports overflow with sweets in beautiful boxes. Every region has its specialty: Hokkaido chocolate, Kyoto matcha confections, and so on.',
    'An omiyage carries a message: "I was thinking of you even while I was away."',
  ],
  'hundred-yen-shops': [
    'A hundred-yen shop is a store where nearly everything in it costs one hundred yen.',
    'Tableware, stationery, cleaning goods, cosmetics, toys — tens of thousands of different items. Again and again you catch yourself thinking, "THIS is a hundred yen?"',
    'They are popular with travelers too; some people buy every souvenir there. Cheap, yet well made — which is a very Japanese thing.',
  ],
  ekiben: [
    'An ekiben is a boxed meal sold at train stations. It is no ordinary bento: packed with local specialties, it is one of the joys of a journey.',
    'Crab if it\'s Hokkaido, beef tongue in Sendai, conger eel in Hiroshima. Even the minutes spent choosing one are part of the pleasure.',
    'And the taste of an ekiben, eaten while the scenery streams past the shinkansen window, is something special.',
  ],
  keigo: [
    'Keigo is the Japanese way of speaking that expresses respect for the person you are talking to. Broadly, there are three kinds.',
    'Teineigo is the polite desu/masu style. Sonkeigo elevates the other person\'s actions — taberu, "to eat," becomes meshiagaru. Kenjōgo humbles your own — iku, "to go," becomes ukagau.',
    'Even Japanese people get keigo wrong. It need not be perfect: the wish to speak politely matters most of all.',
  ],
  'shinkansen-cleaning': [
    'A shinkansen that pulls into Tokyo Station departs with new passengers just twelve minutes later. The time left for cleaning: exactly seven minutes.',
    'The cleaning team lines up and bows before boarding. Seats are turned, floors swept, tables wiped, lost items checked — all of it finished within seven minutes.',
    'This remarkable work has come to be called "the seven-minute miracle," and media around the world have told its story.',
  ],
}

let ok = 0
for (const [id, en] of Object.entries(EN)) {
  const file = join(dir, `${id}.json`)
  const r = JSON.parse(await readFile(file, 'utf8'))
  if (r.paragraphs.length !== en.length) {
    console.error(`SKIP ${id}: ${r.paragraphs.length} paragraphs vs ${en.length} translations`)
    continue
  }
  r.paragraphsEn = en
  await writeFile(file, JSON.stringify(r, null, 2) + '\n', 'utf8')
  ok++
}
console.log(`Added translations to ${ok}/${Object.keys(EN).length} readings.`)
