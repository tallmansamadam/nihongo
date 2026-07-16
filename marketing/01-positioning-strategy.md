# Nihongo Reader — Positioning & Audience Strategy

*v1.0 — July 2026. Solo-dev indie launch. Free, open source, Windows + Android (sideload) + possible web build.*

---

## 1. Audience personas

A note on the original four hypotheses: **"travel to Japan" is demoted from audience to aesthetic.** Casual travelers want phrasebooks and Google Translate Lens; functional reading is a months-long project, and travelers who commit to it become one of the personas below. Keep the retro 50s/60s travel-poster look as the emotional wrapper — it sells the *dream* — but don't spend acquisition effort on travelers as a segment.

### P1 — The Plateau Graduate ("streak-rich, reading-poor")
- **Who:** 25–40, has a 200+ day Duolingo/Busuu streak, roughly N5 ability, and just discovered they can't read an NHK Easy article or a menu. Feels vaguely cheated; motivated but rudderless.
- **Job to be done:** "Prove to myself I'm actually progressing — by reading real Japanese, not clearing lessons."
- **Where they hang out:** r/LearnJapanese and r/languagelearning ("quit Duolingo, now what?" threads are a recurring genre), YouTube study-method channels (ToKini Andy, Game Gengo and their comment sections), Refold and immersion-learning Discords, HelloTalk.
- **Hook:** Graded stories they can finish *today*, with every unknown kanji one tap from a full explanation. No streak guilt.

### P2 — The JLPT Candidate
- **Who:** N4→N2 range, registered (or intending to register) for the December/July sitting. Already uses Anki/WaniKani/Bunpro; time-poor, tool-savvy, allergic to fluff.
- **Job to be done:** "Build reading stamina and drill test format without paying for another subscription."
- **Where they hang out:** r/LearnJapanese JLPT megathreads, WaniKani community forums, Bunpro/MaruMori communities, JLPT-prep blogs, study-group Discords, #JLPT on X.
- **Hook:** JLPT-style practice tests N5–N1 with 100 variations per level, plus graded reading — offline, free, no account.

### P3 — The Anime-to-Manga Graduate
- **Who:** 18–30, hundreds of words learned by ear, near-zero kanji literacy. Wants to read manga, visual novels, and song lyrics without a lookup-per-word slog.
- **Job to be done:** "Turn the Japanese I already half-know from listening into reading ability."
- **Where they hang out:** r/LearnJapanese, r/visualnovels, MyAnimeList forums, anime-lyrics and song-translation YouTube comments, AJATT/immersion Discords.
- **Hook:** Anime-song study packs (paste your own lyrics — nothing pirated), annotated classic songs, and the kanji X-ray on every character. Folktales as a bridge to native media.

### P4 — The Open-Source Tinkerer (distribution-critical)
- **Who:** Hacker News / r/opensource / F-Droid crowd. Often *also* one of P1–P3, but reached through technical channels. Values no-account, offline, no telemetry, inspectable code.
- **Why they matter disproportionately:** until Play Store listing exists, **this is the only persona for whom installation is zero-friction.** They sideload APKs and run unsigned Windows binaries without blinking, and they file issues and evangelize.
- **Where they hang out:** Hacker News (Show HN), Lobsters, r/opensource, r/fossdroid, GitHub trending.
- **Hook:** "A serious, offline, open-source Japanese reader with no account and no ads" is a natively HN-shaped sentence.

**Sequencing:** launch to P4 (they can actually install it), let them validate P1–P3 messaging, then widen to P1–P3 as the web build / store listings close the distribution gap.

---

## 2. Positioning statement

> **For self-directed Japanese learners who have outgrown gamified apps, Nihongo Reader is a free, open-source reading environment that turns real Japanese — stories, folktales, songs, articles — into fully explorable text: every kanji can be tapped for its reading, radicals, recursive decomposition, stroke order, and a mnemonic. Unlike engagement-optimized apps that reward showing up, it rewards understanding — with no ads, no account, no streaks, and full offline use.**

Category framing: a **reading environment / study companion**, not a "language course." Don't promise to teach from zero; promise to make real text readable. This sidesteps unwinnable comparisons with full curricula and matches what the product actually is.

---

## 3. Messaging pillars → proof points

### Pillar 1: "Read real Japanese from day one."
*The goal is reading, not a streak.*
- Graded stories, articles, and folktales at N5–N3 with furigana.
- Public-domain classic songs (さくらさくら, 故郷, 荒城の月) with fully annotated lyrics; anime-song study packs where users paste their own lyrics (no copyrighted lyrics bundled — say this proudly, it signals integrity).
- Remote content library that grows without app updates.

### Pillar 2: "Every kanji, fully explained — on contact."
*The signature demo-able feature. Lead every video/GIF with it.*
- Hover/tap any kanji for reading, radical, and **recursive grapheme decomposition** — down to the atoms.
- Animated stroke order and mnemonics, inline, without leaving the text.
- Tap-to-pronounce and a text-to-speech voice reader for whole passages.

### Pillar 3: "Serious tools, zero manipulation."
*Respect for the learner is the differentiator gamified apps can't copy.*
- No ads, no account, no streaks, no notifications engineering. Free.
- Works fully offline. Open source at github.com/tallmansamadam/nihongo — inspect it.
- JLPT-style practice tests N5–N1 (100 variations/level, original questions) and flashcards with known-card tracking: substance where gamified apps have confetti.
- The retro Japan-travel aesthetic is the flavor of this pillar — nostalgic, calm, adult — not a pillar itself.

---

## 4. The Duolingo comparison: **modify — keep the plateau, drop the anti-AI**

**(a) "Too easy / plateau" — USE, reframed.** The sentiment is real and well-documented among serious learners (r/LearnJapanese treats "Duolingo won't get you reading Japanese" as received wisdom). But frame it as *graduation, not attack*: "Finished your streak. Can't read a menu?" / "What comes after Duolingo?" This is opinion-framed, targets the learner's stage rather than asserting facts about a competitor, flatters the user ("you outgrew it"), and captures high-intent search traffic ("Duolingo alternative Japanese"). Never claim Duolingo "doesn't work" as a factual statement — that's both unverifiable and needlessly combative. Say what's true and checkable: Nihongo Reader has no streaks, no ads, no account, and is built around reading real text.

**(b) "Tired of their AI adoption?" — DROP. This is a live grenade.** Three reasons:
1. **Hypocrisy is one click away.** The app was built with AI assistance and parts of the content pipeline are AI-assisted — and the repo is public, with AI co-authorship visible in the commit history. An anti-AI campaign from this codebase would be falsified by our own GitHub within hours of a Show HN. The exact audiences we're courting (HN, Reddit) are the ones who check.
2. **It misreads the backlash.** The 2025 "AI-first" anger was substantially about workers being replaced and learners feeling deprioritized — not AI per se. We can own the *underlying* emotion honestly: "nothing here is optimized for engagement metrics; no ads, no account, nothing to monetize you." That's the contrast that actually stings, and every word is verifiable.
3. **Defamation/claim risk.** "Tired of their AI adoption" implies their AI content is bad — a quality claim about a competitor we can't substantiate. Comparative marketing must stay at verifiable facts or clearly framed opinion.

**Instead, make transparency the counter-position.** Disclose proactively (README + FAQ): *"Built by one person with AI-assisted tooling; content is human-curated and open source — when something's wrong, you can see it, report it, and watch it get fixed."* Never claim "no AI" or "100% human-made," anywhere, ever.

---

## 5. Top 3 risks & mitigations

| # | Risk | Mitigation |
|---|------|-----------|
| 1 | **AI-hypocrisy blowback.** Any anti-AI messaging is contradicted by the public repo; screenshots of our own commits become the story. | Drop the anti-AI angle entirely (§4). Proactive disclosure in README/FAQ. If challenged, the prepared line is transparency-vs-opacity, not human-vs-AI. Audit all copy for implicit "human-made" claims. |
| 2 | **Distribution gap: sideload-only Android, no store presence.** ~Every non-technical user bounces at "download this APK"; unsigned Windows binaries trigger SmartScreen warnings. | Sequence launch to P4 first (§1). Prioritize the web build as the zero-friction front door for P1–P3. Submit to F-Droid (credibility + reach for exactly this audience). Publish clear, honest sideload instructions. Treat Play Store listing as the top roadmap item and say so publicly. |
| 3 | **Content-credibility risk.** Serious learners and JLPT candidates nitpick ruthlessly; one wrong reading or off-spec "JLPT-style" question, partly AI-assisted, becomes a top Reddit comment. | Always "JLPT-*style*, unofficial" — never imply endorsement. One-tap error reporting via GitHub issues; treat corrections as marketing ("filed 9am, fixed by noon — that's open source"). Prioritize a native/advanced-speaker review pass on test items before promoting the JLPT pillar hard. |

*(Watchlist, not top-3: solo-dev abandonment perception — mitigate with a visible commit cadence and roadmap; anime-song feature being misread as lyrics piracy — mitigate by foregrounding the paste-your-own design in all copy.)*

---

## 6. One-line brand promise

> **"Real Japanese, fully explained — no streaks, no ads, no account. Just reading."**

---

*Assumptions marked as such: persona channel lists are informed judgment, not survey data. No usage statistics are claimed anywhere in this document. Learner-sentiment claims (plateau critique; 2025 AI-first backlash and walkback) are grounded in widely reported coverage (TechCrunch, Fortune, Aug 2025) and long-running community discussion, not proprietary research.*
