# FLOW-PARA-PAUSE-INDEX-1 — base pause measurement (Done-when 1), 2026-10-23

No code change. This measures where the Flow and Focus word engines pause for a paragraph on the base, BLOCK-TAG-CASE-1's held tip `61cbbf7e`.

- **Build:**
  - a clean `git archive 61cbbf7e` copy (`C:\Projects\Blurby-artifacts\flow-para-pause-index-1\src-61cbbf7e`) with its own `npm ci`;
  - `npm run build`;
  - `npx electron-builder --win dir --x64` into `eb-out-61cbbf7e`.
  - All three exited 0. `resources/app.asar` sha256 `d1164b17…6fff`.
- **Profile:** fresh and empty (`profile-base`). There were two launches, and `Session.profilePreflight` passed on each before any input (LL-165). The live-profile hashes were the same before and after (`liveUnchanged: true`; `library.json` `d4b884bd…`, `settings.json` `2e1d5245…`).
- **Probe:** `para-pause-probe.mjs` (evidence copy `FLOW-PARA-PAUSE-INDEX-1.pause-probe.mjs.txt`, sha256 `9c72c21a…4454`). It extends BLOCK-TAG-CASE-1's pause probe to Focus and to the g0 book. It uses `scripts/ui-sweep/sweep.mjs` from this branch (sha256 `06208079…8bc2`).
  - It reads the set held by the running word engine (`runtime.engine.paragraphBreaks`, the set that `scheduleNext` tests), not a screenshot (LL-166).
  - Each pause is checked against the loaded section documents. **block end** means the pause is the last stamped word of a block (blocks grouped by nearest block ancestor, any case). **section end** means the next word starts a book section. **MID** means the pause is not a paragraph end.
  - The engine was started with Space and paused with Space before each read.
  - Raw output: `base.json` and `base.log`. The table was made by `table.mjs` (evidence copy `FLOW-PARA-PAUSE-INDEX-1.table.mjs.txt`).
- **Routes:**
  - **M:** *Meditations*, then Page, then a contents jump to INTRODUCTION (section 2, words 187–5479), then the mode.
  - **G0:** `g0-converted-chapters`, opened at the start (section 0, words 0–837), then the mode.
  - **G1:** g0, then Page, then a contents jump to "Chapter Two: The River" (section 1, words 838–1675), then the mode.

## Verdict

On the base, the pauses are the loaded slice's block ends, numbered from 0, while the engine reads book-wide words:
- **M:** in both modes, 27 of 27 pauses are not paragraph ends.
- **G1:** 30 of 31 are not paragraph ends. The one exception, 837, is right only by coincidence. The loaded slice (section 1, 838 words) ends at slice index 837, and book word 837 happens to be section 0's last word. All 31 pauses fall in section 0, which is not the section being read.
- **G0:** 31 of 31 are block ends. Here the loaded slice starts at book word 0, so slice and book indices coincide. That makes this route the detector's positive control (LL-166): the probe sees correct pauses when they exist.

The results are the same in Flow and Focus. Both modes take `surface.getParagraphBreaks()` at play.

| Mode | Route | Loaded sections | Paragraphs (blocks) in the loaded section | Pauses in it | Of those on a paragraph end | All pauses | Block end | Section end | MID |
|---|---|---|---|---|---|---|---|---|---|
| flow | Meditations, contents jump to INTRODUCTION | 2 | 27 | 26 | 0 | 27 | 0 | 0 | 27 |
| flow | g0, opened at the start (section 0) | 0 | 31 | 31 | 31 | 31 | 31 | 0 | 0 |
| flow | g0, contents jump to Chapter Two (section 1) | 1 | 31 | 0 | 0 | 31 | 0 | 1 | 30 |
| focus | Meditations, contents jump to INTRODUCTION | 2 | 27 | 26 | 0 | 27 | 0 | 0 | 27 |
| focus | g0, opened at the start (section 0) | 0 | 31 | 31 | 31 | 31 | 31 | 0 | 0 |
| focus | g0, contents jump to Chapter Two (section 1) | 1 | 31 | 0 | 0 | 31 | 0 | 1 | 30 |

## Every pause

#### flow, Meditations, contents jump to INTRODUCTION

| # | Word index | Section | Word | Next word | Verdict |
|---|---|---|---|---|---|
| 1 | 0 | 1 | The | Project | **not a paragraph end** |
| 2 | 383 | 2 | was | married | **not a paragraph end** |
| 3 | 421 | 2 | conducted | with | **not a paragraph end** |
| 4 | 887 | 2 | tribes, | and | **not a paragraph end** |
| 5 | 1101 | 2 | had | won | **not a paragraph end** |
| 6 | 1165 | 2 | news, | immediately | **not a paragraph end** |
| 7 | 1327 | 2 | success; | but | **not a paragraph end** |
| 8 | 1657 | 2 | weak, | to | **not a paragraph end** |
| 9 | 1828 | 2 | even | to | **not a paragraph end** |
| 10 | 1978 | 2 | upshot | the | **not a paragraph end** |
| 11 | 1986 | 2 | stubborn | endurance, | **not a paragraph end** |
| 12 | 2130 | 2 | called | the | **not a paragraph end** |
| 13 | 2193 | 2 | put | it, | **not a paragraph end** |
| 14 | 2305 | 2 | true | from | **not a paragraph end** |
| 15 | 2634 | 2 | no | gradations | **not a paragraph end** |
| 16 | 2832 | 2 | special | mention. | **not a paragraph end** |
| 17 | 3001 | 2 | worldwide | brotherhood, | **not a paragraph end** |
| 18 | 3528 | 2 | wrongs; | but | **not a paragraph end** |
| 19 | 3984 | 2 | unspotted | by | **not a paragraph end** |
| 20 | 4116 | 2 | plain | from | **not a paragraph end** |
| 21 | 4461 | 2 | contentment | with | **not a paragraph end** |
| 22 | 4681 | 2 | all | who | **not a paragraph end** |
| 23 | 4843 | 2 | is | strange | **not a paragraph end** |
| 24 | 4905 | 2 | part | concerned | **not a paragraph end** |
| 25 | 5105 | 2 | and | good, | **not a paragraph end** |
| 26 | 5188 | 2 | ambition | or | **not a paragraph end** |
| 27 | 5289 | 2 | accomplished. | But | **not a paragraph end** |

#### flow, g0, opened at the start (section 0)

| # | Word index | Section | Word | Next word | Verdict |
|---|---|---|---|---|---|
| 1 | 3 | 0 | Orchard | A | block end |
| 2 | 30 | 0 | began. | The | block end |
| 3 | 58 | 0 | changed. | A | block end |
| 4 | 88 | 0 | gold. | The | block end |
| 5 | 116 | 0 | night. | A | block end |
| 6 | 143 | 0 | all. | The | block end |
| 7 | 169 | 0 | began. | An | block end |
| 8 | 197 | 0 | changed. | The | block end |
| 9 | 226 | 0 | gold. | A | block end |
| 10 | 254 | 0 | night. | The | block end |
| 11 | 281 | 0 | all. | A | block end |
| 12 | 308 | 0 | began. | The | block end |
| 13 | 336 | 0 | changed. | A | block end |
| 14 | 366 | 0 | gold. | The | block end |
| 15 | 394 | 0 | night. | A | block end |
| 16 | 421 | 0 | all. | The | block end |
| 17 | 447 | 0 | began. | An | block end |
| 18 | 475 | 0 | changed. | The | block end |
| 19 | 504 | 0 | gold. | A | block end |
| 20 | 532 | 0 | night. | The | block end |
| 21 | 559 | 0 | all. | A | block end |
| 22 | 586 | 0 | began. | The | block end |
| 23 | 614 | 0 | changed. | A | block end |
| 24 | 644 | 0 | gold. | The | block end |
| 25 | 672 | 0 | night. | A | block end |
| 26 | 699 | 0 | all. | The | block end |
| 27 | 725 | 0 | began. | An | block end |
| 28 | 753 | 0 | changed. | The | block end |
| 29 | 782 | 0 | gold. | A | block end |
| 30 | 810 | 0 | night. | The | block end |
| 31 | 837 | 0 | all. | Chapter | block end |

#### flow, g0, contents jump to Chapter Two (section 1)

| # | Word index | Section | Word | Next word | Verdict |
|---|---|---|---|---|---|
| 1 | 3 | 0 | Orchard | A | **not a paragraph end** |
| 2 | 33 | 0 | wall | drifted | **not a paragraph end** |
| 3 | 59 | 0 | A | paper | **not a paragraph end** |
| 4 | 86 | 0 | grey | and | **not a paragraph end** |
| 5 | 112 | 0 | birds | settled | **not a paragraph end** |
| 6 | 141 | 0 | hurried | at | **not a paragraph end** |
| 7 | 171 | 0 | evening | bell | **not a paragraph end** |
| 8 | 197 | 0 | changed. | The | **not a paragraph end** |
| 9 | 225 | 0 | and | gold. | **not a paragraph end** |
| 10 | 251 | 0 | settled | for | **not a paragraph end** |
| 11 | 281 | 0 | all. | A | **not a paragraph end** |
| 12 | 311 | 0 | wall | drifted | **not a paragraph end** |
| 13 | 337 | 0 | A | paper | **not a paragraph end** |
| 14 | 364 | 0 | grey | and | **not a paragraph end** |
| 15 | 390 | 0 | birds | settled | **not a paragraph end** |
| 16 | 419 | 0 | hurried | at | **not a paragraph end** |
| 17 | 449 | 0 | evening | bell | **not a paragraph end** |
| 18 | 475 | 0 | changed. | The | **not a paragraph end** |
| 19 | 503 | 0 | and | gold. | **not a paragraph end** |
| 20 | 529 | 0 | settled | for | **not a paragraph end** |
| 21 | 559 | 0 | all. | A | **not a paragraph end** |
| 22 | 589 | 0 | wall | drifted | **not a paragraph end** |
| 23 | 615 | 0 | A | paper | **not a paragraph end** |
| 24 | 642 | 0 | grey | and | **not a paragraph end** |
| 25 | 668 | 0 | birds | settled | **not a paragraph end** |
| 26 | 697 | 0 | hurried | at | **not a paragraph end** |
| 27 | 727 | 0 | evening | bell | **not a paragraph end** |
| 28 | 753 | 0 | changed. | The | **not a paragraph end** |
| 29 | 781 | 0 | and | gold. | **not a paragraph end** |
| 30 | 807 | 0 | settled | for | **not a paragraph end** |
| 31 | 837 | 0 | all. | Chapter | section end |

#### focus, Meditations, contents jump to INTRODUCTION

| # | Word index | Section | Word | Next word | Verdict |
|---|---|---|---|---|---|
| 1 | 0 | 1 | The | Project | **not a paragraph end** |
| 2 | 383 | 2 | was | married | **not a paragraph end** |
| 3 | 421 | 2 | conducted | with | **not a paragraph end** |
| 4 | 887 | 2 | tribes, | and | **not a paragraph end** |
| 5 | 1101 | 2 | had | won | **not a paragraph end** |
| 6 | 1165 | 2 | news, | immediately | **not a paragraph end** |
| 7 | 1327 | 2 | success; | but | **not a paragraph end** |
| 8 | 1657 | 2 | weak, | to | **not a paragraph end** |
| 9 | 1828 | 2 | even | to | **not a paragraph end** |
| 10 | 1978 | 2 | upshot | the | **not a paragraph end** |
| 11 | 1986 | 2 | stubborn | endurance, | **not a paragraph end** |
| 12 | 2130 | 2 | called | the | **not a paragraph end** |
| 13 | 2193 | 2 | put | it, | **not a paragraph end** |
| 14 | 2305 | 2 | true | from | **not a paragraph end** |
| 15 | 2634 | 2 | no | gradations | **not a paragraph end** |
| 16 | 2832 | 2 | special | mention. | **not a paragraph end** |
| 17 | 3001 | 2 | worldwide | brotherhood, | **not a paragraph end** |
| 18 | 3528 | 2 | wrongs; | but | **not a paragraph end** |
| 19 | 3984 | 2 | unspotted | by | **not a paragraph end** |
| 20 | 4116 | 2 | plain | from | **not a paragraph end** |
| 21 | 4461 | 2 | contentment | with | **not a paragraph end** |
| 22 | 4681 | 2 | all | who | **not a paragraph end** |
| 23 | 4843 | 2 | is | strange | **not a paragraph end** |
| 24 | 4905 | 2 | part | concerned | **not a paragraph end** |
| 25 | 5105 | 2 | and | good, | **not a paragraph end** |
| 26 | 5188 | 2 | ambition | or | **not a paragraph end** |
| 27 | 5289 | 2 | accomplished. | But | **not a paragraph end** |

#### focus, g0, opened at the start (section 0)

| # | Word index | Section | Word | Next word | Verdict |
|---|---|---|---|---|---|
| 1 | 3 | 0 | Orchard | A | block end |
| 2 | 30 | 0 | began. | The | block end |
| 3 | 58 | 0 | changed. | A | block end |
| 4 | 88 | 0 | gold. | The | block end |
| 5 | 116 | 0 | night. | A | block end |
| 6 | 143 | 0 | all. | The | block end |
| 7 | 169 | 0 | began. | An | block end |
| 8 | 197 | 0 | changed. | The | block end |
| 9 | 226 | 0 | gold. | A | block end |
| 10 | 254 | 0 | night. | The | block end |
| 11 | 281 | 0 | all. | A | block end |
| 12 | 308 | 0 | began. | The | block end |
| 13 | 336 | 0 | changed. | A | block end |
| 14 | 366 | 0 | gold. | The | block end |
| 15 | 394 | 0 | night. | A | block end |
| 16 | 421 | 0 | all. | The | block end |
| 17 | 447 | 0 | began. | An | block end |
| 18 | 475 | 0 | changed. | The | block end |
| 19 | 504 | 0 | gold. | A | block end |
| 20 | 532 | 0 | night. | The | block end |
| 21 | 559 | 0 | all. | A | block end |
| 22 | 586 | 0 | began. | The | block end |
| 23 | 614 | 0 | changed. | A | block end |
| 24 | 644 | 0 | gold. | The | block end |
| 25 | 672 | 0 | night. | A | block end |
| 26 | 699 | 0 | all. | The | block end |
| 27 | 725 | 0 | began. | An | block end |
| 28 | 753 | 0 | changed. | The | block end |
| 29 | 782 | 0 | gold. | A | block end |
| 30 | 810 | 0 | night. | The | block end |
| 31 | 837 | 0 | all. | Chapter | block end |

#### focus, g0, contents jump to Chapter Two (section 1)

| # | Word index | Section | Word | Next word | Verdict |
|---|---|---|---|---|---|
| 1 | 3 | 0 | Orchard | A | **not a paragraph end** |
| 2 | 33 | 0 | wall | drifted | **not a paragraph end** |
| 3 | 59 | 0 | A | paper | **not a paragraph end** |
| 4 | 86 | 0 | grey | and | **not a paragraph end** |
| 5 | 112 | 0 | birds | settled | **not a paragraph end** |
| 6 | 141 | 0 | hurried | at | **not a paragraph end** |
| 7 | 171 | 0 | evening | bell | **not a paragraph end** |
| 8 | 197 | 0 | changed. | The | **not a paragraph end** |
| 9 | 225 | 0 | and | gold. | **not a paragraph end** |
| 10 | 251 | 0 | settled | for | **not a paragraph end** |
| 11 | 281 | 0 | all. | A | **not a paragraph end** |
| 12 | 311 | 0 | wall | drifted | **not a paragraph end** |
| 13 | 337 | 0 | A | paper | **not a paragraph end** |
| 14 | 364 | 0 | grey | and | **not a paragraph end** |
| 15 | 390 | 0 | birds | settled | **not a paragraph end** |
| 16 | 419 | 0 | hurried | at | **not a paragraph end** |
| 17 | 449 | 0 | evening | bell | **not a paragraph end** |
| 18 | 475 | 0 | changed. | The | **not a paragraph end** |
| 19 | 503 | 0 | and | gold. | **not a paragraph end** |
| 20 | 529 | 0 | settled | for | **not a paragraph end** |
| 21 | 559 | 0 | all. | A | **not a paragraph end** |
| 22 | 589 | 0 | wall | drifted | **not a paragraph end** |
| 23 | 615 | 0 | A | paper | **not a paragraph end** |
| 24 | 642 | 0 | grey | and | **not a paragraph end** |
| 25 | 668 | 0 | birds | settled | **not a paragraph end** |
| 26 | 697 | 0 | hurried | at | **not a paragraph end** |
| 27 | 727 | 0 | evening | bell | **not a paragraph end** |
| 28 | 753 | 0 | changed. | The | **not a paragraph end** |
| 29 | 781 | 0 | and | gold. | **not a paragraph end** |
| 30 | 807 | 0 | settled | for | **not a paragraph end** |
| 31 | 837 | 0 | all. | Chapter | section end |
