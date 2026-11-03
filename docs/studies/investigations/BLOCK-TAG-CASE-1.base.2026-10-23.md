# BLOCK-TAG-CASE-1 — base measurement (Done-when 1), 2026-10-23

No code change. Build, route and probe are reused unchanged for the after measurement (LL-152).

- **Base:** `19658798`, the branch base: `eb/flow-para-keys-1` @ `100b41dd` with `origin/main` @ `644f01d2` merged in.
- **Build:** a clean `git archive` copy with real `node_modules` (`npm ci`), then `npm run build` and `electron-builder --win dir --x64`, all exit 0. Copy: `C:\Projects\Blurby-artifacts\block-tag-case-1\src-19658798`. Package: `eb-out-19658798\win-unpacked\Blurby.exe`. Log: `build-19658798.log`.
- **Profile:** a fresh, empty scratch folder (`profile-base`), set by `BLURBY_USER_DATA_DIR` and `--user-data-dir`.
  - `Session.profilePreflight` passed on both launches before any input (LL-165): `app.getPath('userData')` over the main-process inspector was the scratch folder.
  - The live profile's hashes were the same before and after: `liveUnchanged: true`.
  - Launch 1 creates the profile with the sample book and quits. Launch 2 measures.
  - Between the launches, the g0 book is added to `library.json` as a file-backed EPUB, using a copy inside the scratch profile. Without a source folder, `import-dropped-files` keeps an EPUB as text only, and the reader then shows "needs to be re-imported".
- **Probe:** `C:\Projects\Blurby-artifacts\block-tag-case-1\block-probe.mjs`; the evidence copy is `BLOCK-TAG-CASE-1.probe.mjs.txt` in this folder. It follows `keys-fix\word-probe.mjs`:
  - it finds the mode runtime by walking the React fiber tree, and reads state, not screenshots (LL-166);
  - it opens each book and switches to Flow (paused);
  - for each section in main's `bookWords.sections`, it calls the runtime's `surface.goToSection(i)` and waits until the section's stamped span count and extracted word count are stable;
  - it then switches to Narrate.
  - Raw output: `base.json` and `base.log`.
- **Figures:**
  - **(a)** distinct `blockId` among the Flow view's extracted words for the section, that is, `collectBlockTextNodes` groups that yield a word.
  - **(b)** `paragraphBreakAfter` count among those words.
  - **(c)** distinct `data-word-index` values stamped in the section document, against main's `endWordIdx − startWordIdx`.
  - **(c′)** the renderer's own segmented word count (`extractWordsFromSection` / `extractWordsFromView`) minus main's. Wrapping content-aligns against main's words (SRL-067), so (c) can equal main while (c′) shows the segmentation difference.
  - **(d)** Flow `readingChunks()` whose start lies in the section.
  - **(e)** Narrate's `chunkBreaks(bookWords.words)` within the first two sections.
- Every section document loaded as `application/xhtml+xml`. Meditations has no section 0 in `bookWords.sections`: the cover has no words.
## Table

### Meditations (`resources/sample-meditations.epub`)

| Section | Words (main) | (a) blocks | (b) paragraph breaks | (c) wrapped words | (c) − main | (c′) segmented words − main | (d) Flow chunks | Block tags | Block elements in the XHTML |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 187 | 1 | 1 | 187 | 0 | -4 | 7 | body 1 | 36 |
| 2 | 5293 | 1 | 1 | 5293 | 0 | -3 | 156 | body 1 | 28 |
| 3 | 3951 | 1 | 1 | 3951 | 0 | -1 | 84 | body 1 | 25 |
| 4 | 2221 | 1 | 1 | 2221 | 0 | 0 | 54 | body 1 | 18 |
| 5 | 3327 | 1 | 1 | 3327 | 0 | 0 | 72 | body 1 | 19 |
| 6 | 5410 | 1 | 1 | 5410 | 0 | 0 | 148 | body 1 | 45 |
| 7 | 5399 | 1 | 1 | 5399 | 0 | 0 | 155 | body 1 | 33 |
| 8 | 5571 | 1 | 1 | 5571 | 0 | 0 | 154 | body 1 | 54 |
| 9 | 5989 | 1 | 1 | 5989 | 0 | 0 | 166 | body 1 | 47 |
| 10 | 5897 | 1 | 1 | 5897 | 0 | 0 | 173 | body 1 | 59 |
| 11 | 5343 | 1 | 1 | 5343 | 0 | 0 | 153 | body 1 | 45 |
| 12 | 6230 | 1 | 1 | 6230 | 0 | 0 | 171 | body 1 | 40 |
| 13 | 4479 | 1 | 1 | 4479 | 0 | 0 | 122 | body 1 | 33 |
| 14 | 3722 | 1 | 1 | 3722 | 0 | 0 | 95 | body 1 | 29 |
| 15 | 6081 | 1 | 1 | 6081 | 0 | -7 | 190 | body 1 | 101 |
| 16 | 1218 | 1 | 1 | 1218 | 0 | -2 | 46 | body 1 | 47 |
| 17 | 7171 | 1 | 1 | 7171 | 0 | -33 | 273 | body 1 | 558 |
| 18 | 3004 | 1 | 1 | 3004 | 0 | -91 | 97 | body 1 | 53 |

Totals: (a) 18; (b) 18; (c) 80493 against main 80493; (d) 2316 chunks.
Flow/Focus engine pause set (`surface.getParagraphBreaks()`): base 1 entry, first [182] (main words ["TWELFTH"]).
Flow chunk kinds: base {"sentence":2316}; the document's own paragraph breaks (the chunk source with full-book words): base 0.
(e) Narrate, first two sections: base sections [[1,0,187],[2,187,5480]] (index, start, end), plan breaks [186,5479] at ["GLOSSARY","period."], document paragraph breaks there 0.
Sections with a main word unstamped, a span outside the section, or span text unlike main's word: base none.

### g0-converted-chapters (`docs/planning/roadmap-reviews/reader-mode-separation-2/live/fixtures/g0-converted-chapters.epub`)

| Section | Words (main) | (a) blocks | (b) paragraph breaks | (c) wrapped words | (c) − main | (c′) segmented words − main | (d) Flow chunks | Block tags | Block elements in the XHTML |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 838 | 1 | 1 | 838 | 0 | 0 | 30 | body 1 | 31 |
| 1 | 838 | 1 | 1 | 838 | 0 | 0 | 29 | body 1 | 31 |

Totals: (a) 2; (b) 2; (c) 1676 against main 1676; (d) 59 chunks.
Flow/Focus engine pause set (`surface.getParagraphBreaks()`): base 1 entry, first [837] (main words ["all."]).
Flow chunk kinds: base {"sentence":59}; the document's own paragraph breaks (the chunk source with full-book words): base 0.
(e) Narrate, first two sections: base sections [[0,0,838],[1,838,1676]] (index, start, end), plan breaks [837,1675] at ["all.","gold."], document paragraph breaks there 0.
Sections with a main word unstamped, a span outside the section, or span text unlike main's word: base none.

## Reading of the base

- **(a) and (b):** every section is one `body` block with one paragraph break. This holds on both books, which confirms the case-sensitive lookup on XHTML pages.
- **(c):** wrapped equals main in every section, because wrapping aligns to main's words. **(c′):** the renderer's own segmentation undercounts in some Meditations sections (section 1, the contents list, −4; section 2, INTRODUCTION, which starts at word 187, −3). Its first-load word list sets the Flow/Focus pause set's index space.
- **Flow/Focus pause set:** one entry, at a loaded-slice index, not a book index. On Meditations, entry 182 falls on main's word "TWELFTH" in section 1, not on that section's last word (186): the slice had 183 segmented words (−4). The pause source is filled once, at the first full extraction, and indexes the loaded slice, while the engine runs over book words.
- **(d) Flow chunks:** with full-book words, `readingChunks()` takes no foliate block metadata (`foliateWords` is used only without `bookWords`). Its paragraph source is the document's own `paragraphBreaks`, which is 0 for both EPUBs, so every chunk is a `sentence` chunk.
- **(e) Narrate:** with book words, the plan breaks only at section ends.
