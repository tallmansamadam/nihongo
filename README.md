# 日本語 · Nihongo Reader

A local web app for learning Japanese through short graded stories. Hover any
kanji to see its readings, radical, component graphemes, animated stroke order,
and a mnemonic. Each story comes with a vocabulary list and grammar notes.

- **Level:** N5–N4 (beginner)
- **Content:** four bundled curated stories, no API key, works fully offline
- **Stack:** Vite + React + TypeScript

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build           # type-check + production build into dist/
npm run preview         # serve the production build
npm run fetch-kanjivg   # re-download stroke-order SVGs (already committed)
```

## How it works

- **Stories** live in `src/data/stories.ts`. Each word is a token with an
  optional hiragana reading (`r`) for furigana and a gloss (`g`) shown on hover.
- **Kanji data** lives in `src/data/kanji.ts` — meanings, on/kun readings,
  stroke count, JLPT level, classifying radical, component graphemes, and a
  mnemonic, hand-authored for every kanji used in the stories.
- **Stroke order** is rendered in `src/components/StrokeOrder.tsx` from
  [KanjiVG](http://kanjivg.tagaini.net) SVGs in `public/kanjivg/`. The component
  parses the stroke paths and animates them one at a time; press **↻ Replay** to
  watch again.
- Toggle **Furigana** in the reader header to hide/show readings.

## Adding content

1. Add a story object to `STORIES` in `src/data/stories.ts`.
2. Make sure every kanji you use has an entry in `src/data/kanji.ts`
   (add new ones as needed).
3. Run `npm run fetch-kanjivg` to pull stroke-order SVGs for any new kanji.

## Credits

Stroke-order data from **KanjiVG** by Ulrich Apel, licensed
[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
