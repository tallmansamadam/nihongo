// Adds paragraphsEn to the batch-1/2 library readings.
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'readings')

const EN = {
  'at-the-library': [
    'Next week there is an important exam. So today, I studied at the library.',
    'The library is very quiet, and I can concentrate. Whatever I did not understand, I looked up in books I borrowed from my teacher.',
    'Before going home, I borrowed three books on Japanese history. For the exam, I intend to work hard at home too.',
  ],
  'at-the-park': [
    'On Sunday afternoon, I went to the park nearby. The weather was good and it was very warm.',
    'Children were playing with a ball. An old man was walking his dog.',
    'I sat on a bench and ate an ice cream. It was a very pleasant afternoon.',
  ],
  'at-the-supermarket': [
    'In the evening, I went shopping at the supermarket with my mother.',
    'We bought vegetables, fruit, and fish. Fish was cheap today.',
    'My mother grilled the fish for dinner. It was delicious.',
  ],
  'autumn-festival': [
    'When autumn comes, towns and villages across Japan hold festivals. The autumn festival gives thanks for a plentiful rice harvest.',
    'On the day of the festival, people carry a mikoshi — a portable shrine — through the streets. The sound of the drums carries far.',
    'Food stalls line the streets: takoyaki, candied apples, goldfish scooping. Children and adults alike look forward to this day.',
  ],
  'cat-cafe': [
    'Japan has shops called "cat cafés" — places where you can play with cats while drinking your coffee.',
    'Yesterday, I went to a cat café for the first time. There were about ten cats inside.',
    'One black cat fell asleep on my lap. It was so cute, and I felt completely happy.',
  ],
  'cherry-blossoms': [
    'When spring comes, cherry blossoms bloom all over Japan. They are pink and very beautiful.',
    'People gather in parks and eat boxed lunches under the cherry trees. This is called "hanami" — flower viewing.',
    'The blossoms scatter after only a week or so. Because they bloom for such a short time, everyone treasures their beauty.',
  ],
  'convenience-stores': [
    'Walk through any Japanese town and convenience stores catch your eye everywhere. A konbini is a small shop open twenty-four hours a day.',
    'They sell not just food and drinks but magazines and daily necessities. You can also pay bills and send packages there.',
    'In the middle of busy lives, the konbini has become indispensable to many people. It is so convenient that plenty of people find themselves going every single day.',
  ],
  'fireworks-festival': [
    'On a summer night, there was a fireworks festival in town. I went with my friends, wearing a yukata.',
    'There were crowds of people by the river. We bought yakisoba and shaved ice at the stalls.',
    'Great fireworks rose into the sky. They were so beautiful that everyone cried out "Waaa!"',
  ],
  'first-snow': [
    "This morning I looked out the window and was amazed. It was snowing — this year's first snow.",
    'The town turned white and looked beautiful. Children were building a snowman outside.',
    'I went out and played a little too. My hands were freezing, but it was fun.',
  ],
  'grandmas-garden': [
    "During summer vacation, I went to my grandmother's house. She keeps a small vegetable garden.",
    'Early in the morning, we picked tomatoes and cucumbers together. The just-picked tomatoes smelled of the sun.',
    'At lunch, we made a salad with those vegetables. "Vegetables you picked yourself taste better, don\'t they?" Grandma said with a laugh.',
  ],
  'grateful-crane': [
    'Long ago, there was a poor but kind-hearted old man. One cold day, he freed a crane that had been caught in a trap.',
    'That night, a young woman came to his house. She stayed, and wove him beautiful cloth. "While I am weaving, please do not look into the room," she said.',
    'The cloth sold well, but at last the old man broke his promise and peeked into the room. There stood a crane, weaving cloth from its own feathers.',
    'Discovered, the crane said, "I am the crane you saved," and flew away into the sky. The old man deeply regretted not keeping his promise.',
  ],
  hanami: [
    'When spring arrives, cherry trees bloom all across Japan. People gather in parks to eat and drink beneath the flowers. This is hanami.',
    'The blossoms scatter within a week or so. That is exactly why everyone treasures the short time they have.',
    'Cherry blossoms at night are called "yozakura," and they have a beauty all their own, different from the daytime.',
  ],
  hanasaka: [
    'Long ago, a kind-hearted old man doted on his white dog.',
    'Thanks to that dog, the old man found gold in the mountains. The mean old man next door was filled with envy.',
    'In the end, the kind old man scattered ashes over the withered trees — and beautiful blossoms burst into bloom. Even the lord rejoiced.',
  ],
  'history-of-manga': [
    'Manga is read all over the world today, but its history is a long one.',
    'Ancient picture scrolls already showed animals drawn as if they were people — these are said to be the origin of manga.',
    'After the war, artists like Osamu Tezuka spread long-form story manga. Today, manga is one of the cultures that represents Japan.',
  ],
  hokkaido: [
    'Hokkaido is the great island at the northern tip of Japan. It is rich in nature, with wide-open land stretching in every direction.',
    'Winters are bitterly cold and heavy with snow. That is why skiing and the Snow Festival are famous, drawing crowds of visitors.',
    'Hokkaido is also known for its delicious food. Fresh fish, dairy, and ramen are favorites.',
  ],
  'hot-springs': [
    'Japan has many onsen — hot springs. An onsen is warm water that rises from the ground.',
    'With so many mountains and volcanoes, hot springs can be found all over Japan.',
    'Before entering, you wash yourself well. Then you sink slowly into the water. A hot spring melts your tiredness away and restores both body and heart.',
  ],
  'japanese-food': [
    'Rice is the heart of the Japanese meal. Most people eat rice every day.',
    'With the sea so near, fish is eaten often too. Sushi and sashimi are famous around the world.',
    'In winter, families often gather around a hot pot. Sharing warm food together is one of the great pleasures of the table.',
  ],
  'japanese-school-life': [
    'At Japanese middle and high schools, students usually wear uniforms. The design differs from school to school.',
    'When classes end, students do not go straight home. Most join club activities — baseball, soccer, brass band, calligraphy, and more.',
    'Also, in Japanese schools, the students clean their own classrooms. The idea is that you keep the places you use clean yourself.',
  ],
  'japanese-tea': [
    'Tea is inseparable from Japanese life. With meals and on breaks alike, people drink tea.',
    'There are many kinds of green tea: sencha, hōjicha, genmaicha, and matcha. Matcha is powdered tea, used in the tea ceremony.',
    'The tea ceremony is a Japanese tradition of calming the heart through tea. A single bowl is offered carefully, with one\'s whole spirit.',
  ],
  'japanese-work-style': [
    'In the old days in Japan, it was normal to work at one company until retirement. Many people worked very long hours.',
    'Recently, however, thinking has been changing. More and more people treasure time with family and their own lives.',
    'Many companies now allow working from home, and work styles keep growing freer.',
  ],
  kintaro: [
    'Long ago, deep in the mountains, there lived a strong boy named Kintarō.',
    'Kintarō played with the bears and the rabbits. He was so strong he could lift great stones.',
    'When he grew up, Kintarō went to town and became a samurai who worked for the good of all.',
  ],
  kotatsu: [
    'A kotatsu is a low table with a heater underneath. You drape a quilt over the table and warm your legs inside.',
    'In winter, the family gathers around the kotatsu. Eating mandarin oranges while watching TV — that is the classic scene of a Japanese winter.',
    'The kotatsu is so perfectly warm that once you are in, you cannot get out. "I don\'t want to leave the kotatsu" is the password of winter.',
  ],
  'letter-to-grandmother': [
    'Dear Grandma, how are you? I am doing well here in Tokyo.',
    'My university studies keep me busy, but every day is enjoyable. I have made many friends.',
    'I will come home for winter vacation. I want to eat your cooking again. Please take care of yourself.',
  ],
  'lost-umbrella': [
    'On a rainy day, I left my umbrella on the train. I only noticed after I got home.',
    'The next day, I went to the lost-and-found at the station and asked.',
    'What a relief — my umbrella was there. I told the station attendant, "Thank you so much."',
  ],
  'making-curry': [
    'A friend is coming over today, so I decided to make curry.',
    'First, cut the onions, carrots, and potatoes. Then stir-fry them in a pot together with the meat.',
    'Add water and simmer for about thirty minutes. Stir in the curry roux at the end, and it is ready.',
  ],
  'morning-routine': [
    'I get up at six every morning. First I wash my face and brush my teeth.',
    'Then, in the kitchen, I have bread and eggs. I drink coffee too.',
    'At seven thirty I leave the house and walk to the station. On the train, I read a book.',
  ],
  'mount-fuji': [
    'Mt. Fuji is the tallest mountain in Japan — 3,776 meters high.',
    'Since ancient times, Fuji has been cherished as a special mountain. It appears in countless paintings and poems.',
    'In summer, many people climb to the summit. The sunrise seen from the top is called "goraikō," and people say it is something to see once in your life.',
  ],
  'mountain-hike': [
    'Last Saturday, I climbed a mountain with my friends. We set out early, while it was still dark.',
    'The trail was fairly tough, and we rested many times. But the mountain air was wonderfully clean.',
    'When we reached the summit, the sun appeared above the clouds. I thought: it was worth the effort.',
  ],
  'moving-house': [
    'Last month I moved to a new apartment. It is bigger than the old one and closer to the station.',
    'Moving day was truly exhausting. My friends helped, so we finished quickly.',
    'The new room is still full of boxes, but I am tidying it bit by bit. I want to make it comfortable soon.',
  ],
  'my-bicycle': [
    'I ride my bicycle every day. It is a blue bicycle I bought last year.',
    'It takes about twenty minutes to get to school by bike. On rainy days I take the bus.',
    'On weekends, I ride along the road by the river. It feels wonderful.',
  ],
  'my-birthday': [
    'Yesterday was my birthday. My family threw a party for me.',
    'My mother made a chocolate cake. From my father, I got a new bag.',
    'I was so happy. I am already looking forward to next year\'s birthday.',
  ],
  'my-cat': [
    'Our cat is called Mike. Mike is a small cat, white and brown.',
    'In the morning, Mike suns herself by the window. She sleeps soundly all day long.',
    'When night comes, Mike wakes right up. She plays with her toys and then sleeps on my bed.',
  ],
  'my-dog': [
    'There is a dog at my house. His name is Pochi. Pochi is white and full of energy.',
    'Every morning, I walk Pochi in the park. He loves his ball and is always running.',
    'At night, Pochi sleeps beside me. He is my precious friend.',
  ],
  'my-family': [
    'There are four in my family: my father, my mother, my little sister, and me.',
    'My father is a company employee and works late every day. My mother is a wonderful cook.',
    'My sister is still in elementary school. She loves singing and is always singing at home. I love my family.',
  ],
  'my-room': [
    'My room is small, but bright and quiet.',
    'By the window there is a desk and a chair. On the desk are my computer and my books.',
    'On the wall are photos of my family. I love this room.',
  ],
  'new-year': [
    'New Year is one of the most important holidays in Japan. Most people spend it with family.',
    'On January first, people visit shrines and temples. This is called "hatsumōde" — the first visit of the year.',
    'At New Year, people eat special food called osechi. Children receive gifts of money called "otoshidama" from their families, to their great delight.',
  ],
  'old-bookstore': [
    'On a narrow street in town there is an old bookshop. An old man runs it alone.',
    'Inside, it smells of old books. I sometimes go there to hunt for old volumes.',
    'Yesterday I found a book of photographs from fifty years ago. It was full of pictures of old Tokyo, and it was fascinating.',
  ],
  'on-the-train': [
    'Every morning, I take the train to work. The morning train is always crowded.',
    'Today, an elderly woman was standing in front of me. I stood up from my seat and said, "Please."',
    'She said "Thank you" and smiled happily. It made my whole morning feel brighter too.',
  ],
  origami: [
    'Origami is the Japanese art of folding paper into shapes. No scissors, no glue.',
    'The most famous fold is the crane. The crane is a symbol of long life.',
    'It is said that if you fold a thousand cranes, your wish will come true. This is called "senbazuru" — a thousand cranes.',
  ],
  'part-time-job': [
    'I am a university student. Three times a week, I work part-time at a café.',
    'The job is making coffee and carrying food to customers. At first, it was hard.',
    'Now I am used to the work and I enjoy it. I am saving up money because I want to travel.',
  ],
  'piano-practice': [
    'I have been learning piano for three years. I practice a little every day.',
    'Right now I am practicing a difficult piece. At first I could not play it at all.',
    'But practicing every day, I slowly became able to play it. Next month, I will perform it at a recital.',
  ],
  'princess-kaguya': [
    'Long ago, there was an old man who lived by cutting bamboo. One day, he found a stalk of bamboo that glowed.',
    'When he cut it open, inside was a tiny, beautiful girl. The old man and his wife raised her with loving care.',
    'The girl grew into a beautiful princess. But she was, in truth, a person of the Moon — and on an autumn night, she returned to it.',
  ],
  'rainy-season': [
    'Japan has a season called "tsuyu" — the rainy season. It lasts from about June to July.',
    'During this time it rains nearly every day. You need an umbrella.',
    'After tsuyu comes the hot summer. The rains of tsuyu are precious for the rice and the vegetables.',
  ],
  ramen: [
    'Ramen is now one of the foods that represents Japan. It came originally from China, but developed in its own way here.',
    'There are many kinds of broth: shōyu, miso, shio, and tonkotsu are the famous ones. The taste changes completely from region to region.',
    'Long lines form outside the popular shops. A steaming bowl of ramen on a cold day is the best thing there is.',
  ],
  'school-lunch': [
    'At Japanese elementary schools, everyone eats lunch together in the classroom. This is called "kyūshoku."',
    "Today's kyūshoku was curry rice, milk, and salad. The curry was delicious.",
    'After eating, everyone cleans the classroom together. Then we play outside.',
  ],
  'shrines-and-temples': [
    'Japan has shrines and temples. They may look alike, but they are different things: shrines belong to Shinto, temples to Buddhism.',
    'At a shrine\'s entrance stands a torii gate. When you pray, you bow twice and clap twice. At a temple you do not clap — you quietly press your hands together.',
    'At New Year, crowds visit shrines and temples for hatsumōde, praying for a happy year. It is a treasured custom.',
  ],
  'snowy-train': [
    'On a morning of heavy snow, the trains stopped. The platform was packed, and everyone looked cold.',
    'A small elderly woman stood next to me. I bought two hot coffees from the vending machine and handed her one.',
    'She was startled — then broke into a smile. "Warm, isn\'t it." The train still didn\'t come, but my heart had warmed right up.',
  ],
  'sorting-the-trash': [
    'In Japan, there are rules for sorting garbage into fine categories before putting it out. This is called "bunbetsu."',
    'Burnable, non-burnable, plastic, bottles, cans — each type has its own collection day. Foreigners living in Japan for the first time are often astonished.',
    'It may feel like a chore, but it helps conserve resources and protect the environment.',
  ],
  sumo: [
    'Sumo, called Japan\'s national sport, is very old. Two wrestlers battle on a round ring of earth called a dohyō.',
    'The rules are simple: push your opponent out of the ring, or make any part of him other than the soles of his feet touch the ground. Many bouts are over in seconds.',
    'Wrestlers live together in training stables called "heya," practicing every day. The highest rank of all is "yokozuna."',
  ],
  sunday: [
    'On Sunday there is no work and no school. I get up slowly.',
    'After breakfast, I go to the park near my house. I read, or take photographs.',
    'In the afternoon I go home and listen to music. Sunday is a quiet, good day.',
  ],
  'the-bento-box': [
    'A bento is a meal made at home and eaten elsewhere. People take them to school or to work.',
    'Inside a bento are rice and various side dishes — fish, rolled omelet, vegetables.',
    'Bento arranged into pretty colors and shapes are called "kyaraben," and children love them.',
  ],
  'train-manners': [
    'Japanese trains have many unwritten rules. First: talking on the phone inside the train is considered bad manners.',
    'On a crowded train, you carry your backpack in front. Those getting off go first; those getting on wait — that is the basic rule.',
    'Near the priority seats, silence your phone, and give up your seat to the elderly and those who need it.',
  ],
  'trains-in-japan': [
    'Japanese trains are famous worldwide for their punctuality. Most trains arrive without even a minute\'s delay.',
    'At the big stations, so many lines converge that it feels like a maze. First-time visitors often get lost.',
    'Above all is the shinkansen, running at nearly three hundred kilometers per hour. Tokyo to Osaka takes about two and a half hours.',
  ],
  'vending-machines': [
    'Japan has an extraordinary number of vending machines — about four million nationwide, it is said.',
    'Drink machines are the most common. In winter, the same machine sells both hot and cold drinks.',
    'Because the towns are safe, the machines are not vandalized even at night. That, apparently, is rare in the world.',
  ],
}

let ok = 0
let fail = 0
for (const [id, en] of Object.entries(EN)) {
  const file = join(dir, `${id}.json`)
  const r = JSON.parse(await readFile(file, 'utf8'))
  if (r.paragraphs.length !== en.length) {
    console.error(`SKIP ${id}: ${r.paragraphs.length} paragraphs vs ${en.length} translations`)
    fail++
    continue
  }
  r.paragraphsEn = en
  await writeFile(file, JSON.stringify(r, null, 2) + '\n', 'utf8')
  ok++
}
console.log(`Added translations to ${ok} readings${fail ? `, ${fail} skipped` : ''}.`)
