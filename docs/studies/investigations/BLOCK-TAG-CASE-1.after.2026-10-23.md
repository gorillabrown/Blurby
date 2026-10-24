# BLOCK-TAG-CASE-1 — after measurement (Done-when 4), 2026-10-23

The after measurement used the same recipe, route and probe as the base (LL-152). Base figures: `BLOCK-TAG-CASE-1.base.2026-10-23.md`.

- **After build:** `4054974c`, the fix commit, built the same way as the base:
  - a clean `git archive` copy (`src-4054974c`) with `npm ci`;
  - `npm run build`;
  - `electron-builder --win dir --x64` (`eb-out-4054974c`);
  - all three exited 0.
- **Profile:** fresh and empty (`profile-after`). Two launches, and `Session.profilePreflight` passed on each before any input (LL-165). `liveUnchanged: true`.
- **Probe:** `block-probe.mjs`, byte-identical to the base run's probe, with the same `sweep.mjs` (from `src-19658798`). Raw output: `after.json`, `after.log`.

## Verdict on figure (c)

**No section moved away from main's count.** (c), the wrapped (stamped) words, equals main in every section of both books, before and after. (c′), the renderer's own segmentation, is also unchanged in every section, so the word-count part of the hypothesis is not supported:
- grouping text by block does not change how the renderer segments words;
- the remaining undercounts are somewhere else (Meditations sections 1–3 and 15–18; section 18 is −91).

## Before / after
### Meditations (`resources/sample-meditations.epub`)

| Section | Words (main) | (a) blocks base → after | (b) breaks base → after | (c) wrapped base → after | (c) − main, base → after | (c′) segmented − main, base → after | (d) Flow chunks base → after | Block tags after |
|---|---|---|---|---|---|---|---|---|
| 1 | 187 | 1 → 29 (+28) | 1 → 29 (+28) | 187 → 187 | 0 → 0 | -4 → -4 | 7 → 7 | h2 3, div 2, p 22, h1 1, h3 1 |
| 2 | 5293 | 1 → 27 (+26) | 1 → 27 (+26) | 5293 → 5293 | 0 → 0 | -3 → -3 | 156 → 156 | h2 1, p 26 |
| 3 | 3951 | 1 → 24 (+23) | 1 → 24 (+23) | 3951 → 3951 | 0 → 0 | -1 → -1 | 84 → 84 | h2 2, h3 1, p 21 |
| 4 | 2221 | 1 → 17 (+16) | 1 → 17 (+16) | 2221 → 2221 | 0 → 0 | 0 → 0 | 54 → 54 | h2 1, p 16 |
| 5 | 3327 | 1 → 18 (+17) | 1 → 18 (+17) | 3327 → 3327 | 0 → 0 | 0 → 0 | 72 → 72 | h2 1, p 17 |
| 6 | 5410 | 1 → 44 (+43) | 1 → 44 (+43) | 5410 → 5410 | 0 → 0 | 0 → 0 | 148 → 148 | h2 1, p 43 |
| 7 | 5399 | 1 → 32 (+31) | 1 → 32 (+31) | 5399 → 5399 | 0 → 0 | 0 → 0 | 155 → 155 | h2 1, p 31 |
| 8 | 5571 | 1 → 53 (+52) | 1 → 53 (+52) | 5571 → 5571 | 0 → 0 | 0 → 0 | 154 → 154 | h2 1, p 52 |
| 9 | 5989 | 1 → 46 (+45) | 1 → 46 (+45) | 5989 → 5989 | 0 → 0 | 0 → 0 | 166 → 166 | h2 1, p 45 |
| 10 | 5897 | 1 → 58 (+57) | 1 → 58 (+57) | 5897 → 5897 | 0 → 0 | 0 → 0 | 173 → 173 | h2 1, p 57 |
| 11 | 5343 | 1 → 44 (+43) | 1 → 44 (+43) | 5343 → 5343 | 0 → 0 | 0 → 0 | 153 → 153 | h2 1, p 43 |
| 12 | 6230 | 1 → 39 (+38) | 1 → 39 (+38) | 6230 → 6230 | 0 → 0 | 0 → 0 | 171 → 171 | h2 1, p 38 |
| 13 | 4479 | 1 → 32 (+31) | 1 → 32 (+31) | 4479 → 4479 | 0 → 0 | 0 → 0 | 122 → 122 | h2 1, p 31 |
| 14 | 3722 | 1 → 28 (+27) | 1 → 28 (+27) | 3722 → 3722 | 0 → 0 | 0 → 0 | 95 → 95 | h2 1, p 27 |
| 15 | 6081 | 1 → 52 (+51) | 1 → 52 (+51) | 6081 → 6081 | 0 → 0 | -7 → -7 | 190 → 190 | h2 1, p 51 |
| 16 | 1218 | 1 → 46 (+45) | 1 → 46 (+45) | 1218 → 1218 | 0 → 0 | -2 → -2 | 46 → 46 | h2 1, p 45 |
| 17 | 7171 | 1 → 545 (+544) | 1 → 545 (+544) | 7171 → 7171 | 0 → 0 | -33 → -33 | 273 → 273 | h2 1, p 543, h3 1 |
| 18 | 3004 | 1 → 51 (+50) | 1 → 51 (+50) | 3004 → 3004 | 0 → 0 | -91 → -91 | 97 → 97 | div 46, h2 1, li 4 |

Totals: (a) 18 → 1185; (b) 18 → 1185; (c) 80493 → 80493 against main 80493; (d) 2316 → 2316 chunks.
Flow/Focus engine pause set (`surface.getParagraphBreaks()`): base 1 entry, first [182] (main words ["TWELFTH"]); after 29 entries, first [5,88,90,96,109,111,118,124] (main words ["Meditations","using","eBook.","Rome"]).
Flow chunk kinds: base {"sentence":2316}; after {"sentence":2316}; the document's own paragraph breaks (the chunk source with full-book words): base 0, after 0.
(e) Narrate, first two sections: base sections [[1,0,187],[2,187,5480]] (index, start, end), plan breaks [186,5479] at ["GLOSSARY","period."], document paragraph breaks there 0; after sections [[1,0,187],[2,187,5480]] (index, start, end), plan breaks [186,5479] at ["GLOSSARY","period."], document paragraph breaks there 0.
Sections with a main word unstamped, a span outside the section, or span text unlike main's word: base none; after none.

### g0-converted-chapters (`docs/planning/roadmap-reviews/reader-mode-separation-2/live/fixtures/g0-converted-chapters.epub`)

| Section | Words (main) | (a) blocks base → after | (b) breaks base → after | (c) wrapped base → after | (c) − main, base → after | (c′) segmented − main, base → after | (d) Flow chunks base → after | Block tags after |
|---|---|---|---|---|---|---|---|---|
| 0 | 838 | 1 → 31 (+30) | 1 → 31 (+30) | 838 → 838 | 0 → 0 | 0 → 0 | 30 → 30 | h1 1, p 30 |
| 1 | 838 | 1 → 31 (+30) | 1 → 31 (+30) | 838 → 838 | 0 → 0 | 0 → 0 | 29 → 29 | h1 1, p 30 |

Totals: (a) 2 → 62; (b) 2 → 62; (c) 1676 → 1676 against main 1676; (d) 59 → 59 chunks.
Flow/Focus engine pause set (`surface.getParagraphBreaks()`): base 1 entry, first [837] (main words ["all."]); after 31 entries, first [3,30,58,88,116,143,169,197] (main words ["Orchard","began.","changed.","gold."]).
Flow chunk kinds: base {"sentence":59}; after {"sentence":59}; the document's own paragraph breaks (the chunk source with full-book words): base 0, after 0.
(e) Narrate, first two sections: base sections [[0,0,838],[1,838,1676]] (index, start, end), plan breaks [837,1675] at ["all.","gold."], document paragraph breaks there 0; after sections [[0,0,838],[1,838,1676]] (index, start, end), plan breaks [837,1675] at ["all.","gold."], document paragraph breaks there 0.
Sections with a main word unstamped, a span outside the section, or span text unlike main's word: base none; after none.

## Supplementary: where the Flow/Focus paragraph pauses fall

This is not one of figures (a)–(e). It was measured because pause placement decides the tier-2 question. Probe: `pause-probe.mjs` (evidence copy `BLOCK-TAG-CASE-1.pause-probe.mjs.txt`), run on both builds, each with a fresh profile, the preflight, and `liveUnchanged: true`. Raw output: `pause-base.json`, `pause-after.json`.

It compares the Flow engine's pause set (`surface.getParagraphBreaks()`) with the stamped block ends of the loaded sections. Focus's runtime takes the same source: `useFoliate ? surface.getParagraphBreaks()`, `focus/ModeRuntime.ts:553`.

| Route | Build | Pauses | On a stamped block end | Sections the pauses fall in |
|---|---|---|---|---|
| Open the book, then Flow at the start (cover loaded) | base | 0 | 0 | none |
| Open the book, then Flow at the start (cover loaded) | after | 0 | 0 | none |
| Page, then a TOC jump to INTRODUCTION (section 2, word 187), then Flow | base | 1 (5289 "accomplished." / "But") | 0 of 1 | 2 |
| Page, then a TOC jump to INTRODUCTION (section 2, word 187), then Flow | after | 27 | **0 of 27** | 1 and 2 |

After the fix, the pauses land mid-sentence:
- 0 "The" / "Project";
- 383 "was" / "married";
- 887 "tribes," / "and";
- 1657 "weak," / "to".

The cause was already there before this item. The pause set is filled once, from the first full extraction (`extractWordsFromView`). It indexes that loaded slice, counted from 0, while the Flow and Focus engines step over book word indices (`bookWords.words`). The fix gives that set one entry per block instead of one per section, so a misplaced pause becomes many misplaced pauses.

## Consumers (for the tier-2 decision)

- **Flow and Focus paragraph pauses:** they change. After the fix, more pauses fire, and on these routes none of them falls at a paragraph end (above).
- **Flow chunk size:** unchanged, (d) 2316 → 2316 and 59 → 59. With full-book words, `readingChunks()` reads the document's own `paragraphBreaks` (0 for both EPUBs), not the foliate block metadata.
- **Narrate:** unchanged, (e) is identical. With book words, the plan breaks only at section ends (`chunkBreaks`).
- **Page:** wrapping now groups text per block. The stamped counts are unchanged (c).
