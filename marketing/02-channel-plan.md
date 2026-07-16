# Nihongo Reader — Channel & Media Plan

**Budget:** ~$0, organic-first. **Team:** one person. **Date:** 2026-07-15.
**Community sizes below are approximate third-party figures (checked July 2026); verify each sub's rules in-app before posting — mods change them.**

---

## 1. Prioritized channels

### 1. Reddit — r/LearnJapanese (primary), r/movingtojapan + r/JapanTravel (contribute-only)
**Why it fits:** r/LearnJapanese (~850k members) is exactly the "serious learner who plateaued on Duolingo" audience; "what resource should I use" threads are constant. **Free + open-source + offline + no ads/accounts/streaks** is the single most upvotable positioning this community has.
**Rules reality:** r/LearnJapanese restricts self-promotion — message the mods *before* posting anything about your own app, and read the current rules page first. r/JapanTravel (~3.5M) explicitly prohibits self-promotion: never post the app there; instead answer "how do I read menus/signs" questions helpfully and keep the app in your profile/flair only. r/movingtojapan similarly gates promos/surveys behind mod approval — same contribute-first approach.
**What works:** genuinely useful teaching content (kanji-decomposition explainers, JLPT prep write-ups) with the app mentioned once at the end or in a comment when asked; answering questions in daily threads for 2–3 weeks before any launch post.
**Effort:** Medium (daily 15–20 min participation).
**Realistic expectation:** one well-received launch post can drive the single biggest traffic spike you'll get; ongoing participation drives a steady trickle. Assumption: hundreds-to-low-thousands of visits from a front-page-of-sub post, near zero if it reads as an ad.

### 2. Hacker News (Show HN) + Product Hunt — the open-source dev-story angle
**Why it fits:** HN loves free, open-source, offline, no-account, no-dark-patterns software with an interesting technical core — and recursive kanji decomposition + KanjiVG stroke animation *is* an interesting technical core. Many HN readers are Japan-curious travelers/learners themselves.
**What works:** "Show HN: Nihongo Reader — open-source Japanese reading app (every kanji decomposes recursively)" with a link to a **hosted web demo** (non-negotiable: HN will not sideload an APK) and the repo. Lead with the engineering story in comments: data modeling, KanjiVG parsing, hand-authored mnemonics, Tauri. Product Hunt is secondary — do it a few weeks after HN, with the demo GIF as the gallery lead.
**Effort:** Low prep beyond Phase 0 assets; one intense comment-answering day each.
**Realistic expectation:** high variance. A Show HN that lands brings thousands of visits and a GitHub-star spike (which itself compounds via GitHub trending); most Show HNs get modest traction. One retry with a different angle is acceptable per HN norms.

### 3. YouTube Shorts + TikTok (+ Instagram Reels, same asset) — kanji-breakdown micro-content
**Why it fits:** "This kanji is secretly three pictures" content is inherently visual, loops well, and the recursive-decomposition animation is a built-in content machine — every kanji in the app is a potential 30-second video. Reaches anime/manga fans and Japan-bound travelers who never visit Reddit. The retro 50s-travel aesthetic gives a recognizable visual identity.
**What works:** screen-capture of the app decomposing a kanji + stroke animation, voiceover mnemonic, "sound smart at the izakaya" travel hooks, JLPT "can you read this N3 sentence?" challenges. Post the identical vertical video to all three platforms.
**Effort:** Medium-high to start (template + batch recording), Low once templated (2–3/week, ~30 min each).
**Realistic expectation:** slow for weeks, then occasional outlier videos; this is the compounding long-game channel, not the launch channel. Assumption: most videos get low hundreds of views; discovery is algorithmic and spiky.

### 4. SEO via the GitHub Pages web demo + long-tail content
**Why it fits:** the app is already a Vite/React web app — hosting a demo on GitHub Pages is near-zero work and doubles as the SEO surface. Serious learners search long-tail: "kanji radical breakdown [kanji]", "JLPT N3 practice test free offline", "Japanese graded readers with furigana free".
**What works:** a landing page with demo GIF; per-feature pages (JLPT tests, stroke order, graded readers); eventually programmatic per-kanji pages (meaning, radicals, stroke animation, mnemonic) — the data already exists in `src/data/kanji.ts`. That per-kanji play is the biggest long-term SEO asset.
**Effort:** Low to launch the demo + landing page; Medium for programmatic pages (a later project).
**Realistic expectation:** ~zero traffic for 2–3 months (assumption: standard new-domain lag), then steady compounding growth; per-kanji pages could become the top acquisition source in 6–12 months.

### 5. Japanese-learning Discords
**Why it fits:** high-intent, high-trust spaces (large servers exist around r/LearnJapanese, immersion-learning communities like TheMoeWay, English–Japanese language exchange servers). One respected member saying "this is good" beats any ad.
**What works:** be a member first; share the app only in designated #resources/#projects channels or when someone asks for exactly what it does; offer it for feedback ("I built this, tear it apart") rather than promotion. Most servers ban drive-by promo — read each server's rules.
**Effort:** Medium (ongoing presence, can't be faked).
**Realistic expectation:** small numbers (tens of users per server) but the highest-quality early users and best bug reports/word-of-mouth seeders.

### 6. Study-tuber / newsletter outreach
**Why it fits:** micro study-tubers (1k–50k subs) constantly need content and love free tools they can demo; one honest review video outlives any post. Target creators who make "how I passed N2"-style videos, plus Japanese-learning newsletters/blogs that run resource roundups.
**What works:** short personal email/DM: what it is, why their audience specifically, demo GIF, direct web-demo link, "no strings — it's free and open-source, happy to add a feature your viewers need." 10–15 targeted contacts beat 100 spammy ones.
**Effort:** Low-Medium (research + personalized outreach, batched).
**Realistic expectation:** assumption: 1–3 responses per 10 contacts; a single mid-size video can outperform your own channel for months.

### 7. App Store Optimization — the future Play Store listing
**Why it fits:** "learn kanji", "JLPT practice", "Japanese reading" searches on Google Play are perpetual high-intent traffic; sideloading an APK filters out 95%+ of interested Android users today (assumption, but directionally certain).
**What works:** title/subtitle carrying keywords ("Nihongo Reader — Kanji, JLPT & Graded Reading, Offline"), screenshots that show decomposition + retro aesthetic first, "no ads, no account, open source" in the short description; honest review prompts later.
**Effort:** Medium one-time (developer account ~$25 one-time — the only spend in this plan — plus listing assets), Low maintenance.
**Realistic expectation:** modest steady installs that grow with ratings; it's also a prerequisite: every other channel converts better when "install" is one tap.

### 8. Language-exchange communities (HelloTalk, Tandem, r/language_exchange) — deprioritized
**Why it's last:** audiences skew conversation-focused rather than reading-focused, and in-app promotion is against most platforms' ToS. Only worthwhile as profile-bio presence and answering "what app for kanji?" questions. **Effort:** Low. **Expectation:** negligible; do not invest beyond incidental mentions.

---

## 2. Launch sequence

### Phase 0 — Prerequisites (2–4 weeks, before any promotion)
1. **Hosted web demo on GitHub Pages** — the #1 prerequisite; every channel needs a one-click try link. Add a simple landing page + privacy-friendly analytics (e.g., GoatCounter, free).
2. **Demo GIF/video** — 15s recursive kanji decomposition + stroke animation; this asset gets reused everywhere (README, HN, PH, outreach, socials).
3. **Play Store listing** submitted (review takes time; closed-testing requirements for new personal accounts can add weeks — start now). App Store deferred (cost/hardware).
4. **README polish**: screenshots, demo link, feature list, roadmap; add UTM-tagged links from landing page to downloads.
5. Quietly join r/LearnJapanese daily threads + 2–3 Discords and start contributing (the "warm-up" is a prerequisite, not marketing).

### Phase 1 — Launch week
- **Day 1:** Show HN (Tue–Thu morning US time, per common HN wisdom — assumption, not a guarantee). Be present in comments all day.
- **Day 2–3:** r/LearnJapanese post (with prior mod approval) — the usefulness-first post below, not a "check out my app" post.
- **Day 4–5:** Share in Discord #resources channels where you're already a member; post the demo GIF thread on your own X/Bluesky.
- **Day 6–7:** First 3 Shorts/TikToks go live; send first 10 study-tuber outreach emails referencing any HN/Reddit traction.
- Product Hunt: hold 2–3 weeks until after Play Store listing is live, so the PH page converts.

### Phase 2 — Sustain rhythm (one person, ~4–5 hrs/week)
- **Mon:** 20 min Reddit/Discord participation (answer questions; never link unless asked/relevant).
- **Tue:** produce 2 Shorts/TikToks in one batch session (~90 min).
- **Thu:** 1 SEO/content item — a kanji-explainer page or blog post on the demo site (~60 min).
- **Fri:** 3–5 outreach emails OR one improvement to store listing/landing page (~30 min); check KPIs (~15 min).
- **Monthly:** one "big" post (new-feature announcement to Reddit/HN when substantive, e.g., "we now decompose every kanji recursively").

---

## 3. First-post concepts (top 3 channels)

**1. r/LearnJapanese (mod-approved):**
*Title:* "I hand-wrote decomposition mnemonics for every kanji in my N5–N4 graded readers — here's the method, and the whole thing is free/open-source"
*Description:* A teaching-first post explaining the recursive radical→grapheme→mnemonic method with 3 worked examples (e.g., 曜 → 日 + 羽 + 隹) readers can use with any tool. The app link appears once at the end as "I built this into a free open-source reader if you want it applied to full stories."

**2. Hacker News:**
*Title:* "Show HN: Nihongo Reader – open-source Japanese reader where every kanji decomposes recursively"
*Description:* Links the web demo first, repo second; the text focuses on the engineering: parsing KanjiVG stroke data, modeling recursive grapheme trees, hand-authoring per-kanji data, and shipping the same codebase as web/Tauri/Android — with a candid "no ads, no accounts, works offline" philosophy note.

**3. YouTube Shorts / TikTok:**
*Title:* "You already know this 'impossible' kanji — you just can't see the pieces yet"
*Description:* 30-second screen capture: a dense kanji explodes into its component graphemes one tap at a time, each with a one-line mnemonic, ending on the stroke-order animation. No pitch; the app name/aesthetic on screen is the branding, link in bio/pinned comment.

---

## 4. Measurement — 5 solo-trackable KPIs

1. **Web demo weekly unique visitors** (GoatCounter/Plausible) — the top-of-funnel number; segment by referrer to see which channel actually sends people.
2. **GitHub stars + release-asset downloads** (repo Insights + Releases API) — proxy for developer/serious-user interest and desktop adoption.
3. **Play Store installs + store-listing conversion rate** (Play Console, free) — once live, the cleanest "real users" number Android-side.
4. **Referral mix via UTM links** — one distinct UTM per channel (reddit, hn, ph, shorts, outreach); review the split monthly and reallocate the weekly hours toward whatever wins.
5. **Content shipped per week vs. plan** (simple spreadsheet: posts, videos, outreach emails sent, replies received) — the only leading indicator a solo dev fully controls; if outputs slip, all other KPIs will follow.

*No retention KPI is possible without accounts/telemetry — by design. Optional later: an opt-in, anonymous "check for updates" ping as a crude active-installs proxy, clearly disclosed given the privacy positioning.*
