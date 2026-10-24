# FLOW-PARA-PAUSE-INDEX-1 — after pause measurement (Done-when 4), 2026-10-23

This uses the same recipe, probe, sweep.mjs and routes as the base (LL-152). Base: `FLOW-PARA-PAUSE-INDEX-1.base.2026-10-23.md`.

- **Build:** `13e93a81`, the fix commit, built the same way:
  - a clean `git archive` copy (`src-13e93a81`) with `npm ci`;
  - `npm run build`;
  - `npx electron-builder --win dir --x64` into `eb-out-13e93a81`.
  - All three exited 0. `resources/app.asar` sha256 `abf3af7c…8fb4`.
- **Profile:** fresh and empty (`profile-after`). `Session.profilePreflight` passed on both launches before any input (LL-165). `liveUnchanged: true`, with the same live hashes as the base run.
- **Probe:** `para-pause-probe.mjs`, byte-identical to the base run's (sha256 `9c72c21a…4454`). It reads the running engine's set (LL-166). Raw output: `after.json` and `after.log`.

## Verdict

**Every pause is a paragraph end, in both modes and both books: 0 MID out of 216.**
- In each loaded section, the number of pauses equals the number of paragraphs (blocks): Meditations section 2 has 27 of 27, g0 section 0 has 31 of 31, and g0 section 1 has 31 of 31. Every one of them is a block end.
- The other pauses are the ends of sections that are not loaded. They are always paragraph ends, and they come from the book's section starts:
  - Meditations: 17, from 186 "GLOSSARY" to 80492 "eBooks.", the book's last word;
  - g0: 1 (1675 "gold." or 837 "all.").
- A section that loads later adds its paragraph starts on re-extraction (`onWordsReextracted` → `setParagraphBreaks`; tests p5 and p6).

## Before / after

| Mode | Route | Base: pauses (MID) | After: pauses (MID) | Base: in loaded section, on a paragraph end / paragraphs | After: in loaded section, on a paragraph end / paragraphs |
|---|---|---|---|---|---|
| Flow | Meditations INTRODUCTION (contents jump) | 27 (27) | 44 (0) | 0 / 27 | 27 / 27 |
| Flow | g0 section 0 (open at start) | 31 (0) | 32 (0) | 31 / 31 | 31 / 31 |
| Flow | g0 section 1 (contents jump) | 31 (30) | 32 (0) | 0 / 31 | 31 / 31 |
| Focus | Meditations INTRODUCTION (contents jump) | 27 (27) | 44 (0) | 0 / 27 | 27 / 27 |
| Focus | g0 section 0 (open at start) | 31 (0) | 32 (0) | 31 / 31 | 31 / 31 |
| Focus | g0 section 1 (contents jump) | 31 (30) | 32 (0) | 0 / 31 | 31 / 31 |

The g0 section 0 base row is right only because the slice index and the book index coincide there (see the base file).

| Mode | Route | Loaded sections | Paragraphs (blocks) in the loaded section | Pauses in it | Of those on a paragraph end | All pauses | Block end | Section end | MID |
|---|---|---|---|---|---|---|---|---|---|
| flow | Meditations, contents jump to INTRODUCTION | 2 | 27 | 27 | 27 | 44 | 27 | 17 | 0 |
| flow | g0, opened at the start (section 0) | 0 | 31 | 31 | 31 | 32 | 31 | 1 | 0 |
| flow | g0, contents jump to Chapter Two (section 1) | 1 | 31 | 31 | 31 | 32 | 31 | 1 | 0 |
| focus | Meditations, contents jump to INTRODUCTION | 2 | 27 | 27 | 27 | 44 | 27 | 17 | 0 |
| focus | g0, opened at the start (section 0) | 0 | 31 | 31 | 31 | 32 | 31 | 1 | 0 |
| focus | g0, contents jump to Chapter Two (section 1) | 1 | 31 | 31 | 31 | 32 | 31 | 1 | 0 |

## Every pause

#### flow, Meditations, contents jump to INTRODUCTION

| # | Word index | Section | Word | Next word | Verdict |
|---|---|---|---|---|---|
| 1 | 186 | 1 | GLOSSARY | INTRODUCTION | section end |
| 2 | 187 | 2 | INTRODUCTION | MARCUS | block end |
| 3 | 571 | 2 | aloof. | In | block end |
| 4 | 609 | 2 | him. | Antoninus | block end |
| 5 | 1075 | 2 | wars. | The | block end |
| 6 | 1289 | 2 | presence. | On | block end |
| 7 | 1353 | 2 | Pannonia. | The | block end |
| 8 | 1515 | 2 | suspicion. | As | block end |
| 9 | 1845 | 2 | he. | To | block end |
| 10 | 2016 | 2 | sect. | Zeno, | block end |
| 11 | 2168 | 2 | said, | But | block end |
| 12 | 2176 | 2 | Porch.' | The | block end |
| 13 | 2320 | 2 | life. | The | block end |
| 14 | 2383 | 2 | principle. | The | block end |
| 15 | 2495 | 2 | man. | In | block end |
| 16 | 2824 | 2 | place. | Two | block end |
| 17 | 3022 | 2 | God. | Such | block end |
| 18 | 3191 | 2 | life. | It | block end |
| 19 | 3718 | 2 | shadow. | But | block end |
| 20 | 4174 | 2 | antidote.' | One | block end |
| 21 | 4306 | 2 | evil. | If | block end |
| 22 | 4651 | 2 | revered. | But | block end |
| 23 | 4871 | 2 | opposition. | Profound | block end |
| 24 | 5033 | 2 | late. | He | block end |
| 25 | 5095 | 2 | actions.' | By | block end |
| 26 | 5295 | 2 | designs. | Truly | block end |
| 27 | 5378 | 2 | place. | The | block end |
| 28 | 5479 | 2 | period. | HIS | block end |
| 29 | 9430 | 3 | gods. | THE | section end |
| 30 | 11651 | 4 | Carnuntum. | THE | section end |
| 31 | 14978 | 5 | portion. | THE | section end |
| 32 | 20388 | 6 | ostentation. | THE | section end |
| 33 | 25787 | 7 | actions. | THE | section end |
| 34 | 31358 | 8 | buried! | THE | section end |
| 35 | 37347 | 9 | tranquillity. | THE | section end |
| 36 | 43244 | 10 | other. | THE | section end |
| 37 | 48587 | 11 | more. | THE | section end |
| 38 | 54817 | 12 | coachman. | THE | section end |
| 39 | 59296 | 13 | you?' | THE | section end |
| 40 | 63018 | 14 | thee. | APPENDIX | section end |
| 41 | 69099 | 15 | style. | NOTES | section end |
| 42 | 70317 | 16 | 105. | GLOSSARY | section end |
| 43 | 77488 | 17 | other | END | section end |
| 44 | 80492 | 18 | eBooks. | — | section end |

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
| 32 | 1675 | 1 | gold. | — | section end |

#### flow, g0, contents jump to Chapter Two (section 1)

| # | Word index | Section | Word | Next word | Verdict |
|---|---|---|---|---|---|
| 1 | 837 | 0 | all. | Chapter | section end |
| 2 | 841 | 1 | River | The | block end |
| 3 | 871 | 1 | night. | A | block end |
| 4 | 897 | 1 | all. | The | block end |
| 5 | 924 | 1 | began. | An | block end |
| 6 | 950 | 1 | changed. | The | block end |
| 7 | 979 | 1 | gold. | A | block end |
| 8 | 1009 | 1 | night. | The | block end |
| 9 | 1035 | 1 | all. | A | block end |
| 10 | 1063 | 1 | began. | The | block end |
| 11 | 1089 | 1 | changed. | A | block end |
| 12 | 1119 | 1 | gold. | The | block end |
| 13 | 1149 | 1 | night. | A | block end |
| 14 | 1175 | 1 | all. | The | block end |
| 15 | 1202 | 1 | began. | An | block end |
| 16 | 1228 | 1 | changed. | The | block end |
| 17 | 1257 | 1 | gold. | A | block end |
| 18 | 1287 | 1 | night. | The | block end |
| 19 | 1313 | 1 | all. | A | block end |
| 20 | 1341 | 1 | began. | The | block end |
| 21 | 1367 | 1 | changed. | A | block end |
| 22 | 1397 | 1 | gold. | The | block end |
| 23 | 1427 | 1 | night. | A | block end |
| 24 | 1453 | 1 | all. | The | block end |
| 25 | 1480 | 1 | began. | An | block end |
| 26 | 1506 | 1 | changed. | The | block end |
| 27 | 1535 | 1 | gold. | A | block end |
| 28 | 1565 | 1 | night. | The | block end |
| 29 | 1591 | 1 | all. | A | block end |
| 30 | 1619 | 1 | began. | The | block end |
| 31 | 1645 | 1 | changed. | A | block end |
| 32 | 1675 | 1 | gold. | — | block end |

#### focus, Meditations, contents jump to INTRODUCTION

| # | Word index | Section | Word | Next word | Verdict |
|---|---|---|---|---|---|
| 1 | 186 | 1 | GLOSSARY | INTRODUCTION | section end |
| 2 | 187 | 2 | INTRODUCTION | MARCUS | block end |
| 3 | 571 | 2 | aloof. | In | block end |
| 4 | 609 | 2 | him. | Antoninus | block end |
| 5 | 1075 | 2 | wars. | The | block end |
| 6 | 1289 | 2 | presence. | On | block end |
| 7 | 1353 | 2 | Pannonia. | The | block end |
| 8 | 1515 | 2 | suspicion. | As | block end |
| 9 | 1845 | 2 | he. | To | block end |
| 10 | 2016 | 2 | sect. | Zeno, | block end |
| 11 | 2168 | 2 | said, | But | block end |
| 12 | 2176 | 2 | Porch.' | The | block end |
| 13 | 2320 | 2 | life. | The | block end |
| 14 | 2383 | 2 | principle. | The | block end |
| 15 | 2495 | 2 | man. | In | block end |
| 16 | 2824 | 2 | place. | Two | block end |
| 17 | 3022 | 2 | God. | Such | block end |
| 18 | 3191 | 2 | life. | It | block end |
| 19 | 3718 | 2 | shadow. | But | block end |
| 20 | 4174 | 2 | antidote.' | One | block end |
| 21 | 4306 | 2 | evil. | If | block end |
| 22 | 4651 | 2 | revered. | But | block end |
| 23 | 4871 | 2 | opposition. | Profound | block end |
| 24 | 5033 | 2 | late. | He | block end |
| 25 | 5095 | 2 | actions.' | By | block end |
| 26 | 5295 | 2 | designs. | Truly | block end |
| 27 | 5378 | 2 | place. | The | block end |
| 28 | 5479 | 2 | period. | HIS | block end |
| 29 | 9430 | 3 | gods. | THE | section end |
| 30 | 11651 | 4 | Carnuntum. | THE | section end |
| 31 | 14978 | 5 | portion. | THE | section end |
| 32 | 20388 | 6 | ostentation. | THE | section end |
| 33 | 25787 | 7 | actions. | THE | section end |
| 34 | 31358 | 8 | buried! | THE | section end |
| 35 | 37347 | 9 | tranquillity. | THE | section end |
| 36 | 43244 | 10 | other. | THE | section end |
| 37 | 48587 | 11 | more. | THE | section end |
| 38 | 54817 | 12 | coachman. | THE | section end |
| 39 | 59296 | 13 | you?' | THE | section end |
| 40 | 63018 | 14 | thee. | APPENDIX | section end |
| 41 | 69099 | 15 | style. | NOTES | section end |
| 42 | 70317 | 16 | 105. | GLOSSARY | section end |
| 43 | 77488 | 17 | other | END | section end |
| 44 | 80492 | 18 | eBooks. | — | section end |

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
| 32 | 1675 | 1 | gold. | — | section end |

#### focus, g0, contents jump to Chapter Two (section 1)

| # | Word index | Section | Word | Next word | Verdict |
|---|---|---|---|---|---|
| 1 | 837 | 0 | all. | Chapter | section end |
| 2 | 841 | 1 | River | The | block end |
| 3 | 871 | 1 | night. | A | block end |
| 4 | 897 | 1 | all. | The | block end |
| 5 | 924 | 1 | began. | An | block end |
| 6 | 950 | 1 | changed. | The | block end |
| 7 | 979 | 1 | gold. | A | block end |
| 8 | 1009 | 1 | night. | The | block end |
| 9 | 1035 | 1 | all. | A | block end |
| 10 | 1063 | 1 | began. | The | block end |
| 11 | 1089 | 1 | changed. | A | block end |
| 12 | 1119 | 1 | gold. | The | block end |
| 13 | 1149 | 1 | night. | A | block end |
| 14 | 1175 | 1 | all. | The | block end |
| 15 | 1202 | 1 | began. | An | block end |
| 16 | 1228 | 1 | changed. | The | block end |
| 17 | 1257 | 1 | gold. | A | block end |
| 18 | 1287 | 1 | night. | The | block end |
| 19 | 1313 | 1 | all. | A | block end |
| 20 | 1341 | 1 | began. | The | block end |
| 21 | 1367 | 1 | changed. | A | block end |
| 22 | 1397 | 1 | gold. | The | block end |
| 23 | 1427 | 1 | night. | A | block end |
| 24 | 1453 | 1 | all. | The | block end |
| 25 | 1480 | 1 | began. | An | block end |
| 26 | 1506 | 1 | changed. | The | block end |
| 27 | 1535 | 1 | gold. | A | block end |
| 28 | 1565 | 1 | night. | The | block end |
| 29 | 1591 | 1 | all. | A | block end |
| 30 | 1619 | 1 | began. | The | block end |
| 31 | 1645 | 1 | changed. | A | block end |
| 32 | 1675 | 1 | gold. | — | block end |
