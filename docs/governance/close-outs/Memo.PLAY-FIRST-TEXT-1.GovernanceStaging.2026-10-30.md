# PLAY-FIRST-TEXT-1 — Governance staging memo (2026-10-30)

**State:** built and held on `eb/play-first-text-1`. Auto-merge is off (the spec opts out of Rule 5b). No merge without Blurby.Roadmap's go, after Blurby.Brain1 confirms the package. Package-verified (x64, RodneySr); the arm64 launch happens at merge.

## Base and launch gate (Done-when 0–1)

- **Base:** `<BA2-TIP>` = `e8e6de06` (`eb/band-align-2`, with R7a and R8). `<BUG235-FIX>` = `20b3d5f8` is its ancestor, and R8's `flowBandEnabled` is in `src/types.ts`.
- **Narrate branch:** `git merge-tree` against `origin/eb/narrate-pause-cancel-1` exits 0.
- **Host:** `hostname` prints `RodneySr`; the spec's literal is `RODNEYSR`. It is the same host, accepted by Brain1.
- **bq-main:** at `36ac7466`, with its stash unchanged (`bq-stash-before.txt`).
- **M0 `a68bc161`:** merges `origin/main` `07e8e19b`. The only conflict was `docs/governance/BUG_REPORT.md`, the BUG-235 status line, resolved to main's line (F-merge, accepted by Brain1).
- **After M0:** `npm ci`, build and the base x64 package all exit 0. The base collected set has 195 files.

## Base live (Done-when 2, standing rule 55)

All three runs use the base x64 package and `pft-probe.mjs`, with the checker under Brain1's word ruling below.

| Mode | Verdict | Detail |
|---|---|---|
| Flow | FAIL, `no-cursor` | Waited 10 s. This is the opposite verdict, so the gate holds. |
| Focus | FAIL, `no-cursor` | Waited 10 s. Recorded, not gated. The spec's code trace had predicted PASS. |
| Narrate | PASS | First cursor at 1.68 s on section 1, word 0, "The". Narrate is already correct on the base. Its change is the shared-contract guard (`pendingFirstText`), verified by unit rows (n7), (n8), (nc4) and (nc5). |

## Rulings during the run (Blurby.Brain1, 2026-10-30)

- **The live word.** On the bundled *Meditations*, section 1's first stamped word is "The" ("The Project Gutenberg eBook of Meditations…"), not "MEDITATIONS".
  - `check-pft.cjs`'s word condition is now: the cursor's word equals `text.firstWords[0]` and is "The", read from the document (LL-161).
  - Every other condition is unchanged. The spec's verbatim checker is kept as `tools\check-pft.spec-verbatim.cjs`.
- **Focus "reading on" (Focus only).** Focus's in-page span marks only the start word during word-by-word play. That is expected behaviour.
  - At the later read, the Focus word display (`.rm-focus-word-display`) text must differ from the start word, and Pause must be shown.
  - The view API's reading word index is not exposed to the page, so it was not read. This is recorded as allowed.
- **Spec-count correction.** The `getDisplayedSectionIndex` count is 23, not 17. The spec's own R1–R3 code, after Q2, calls it 3 times per runtime. No wrappers were added.
- **Test strengthening accepted.**
  - (n2), (n3), (n7) and (n8) assert that `goToSection` runs before the first producer request.
  - The `next()`-not-called precondition is asserted only on the 7/8 rows.

## Red (C1 `a39fac59`, standing rule 43)

- Vitest exits 1, and the node check exits 0.
  - `failed`: exactly (f1)–(f9), (o1)–(o9) and (n1)–(n9), all by assertion.
  - `ctlMissing`: `[]`.
  - `loadErr`: `false`.
- `npm run typecheck` at C1 exits 0.
- Output: `red.json` and `red-summary.txt` in `C:\Projects\Blurby-artifacts\play-first-text-1`.

## The change (C2 `c57a7b4f`)

- **Flow and Focus views and surfaces:** gain `getDisplayedSectionIndex`. Focus's surface also gains `waitForSectionReady`.
- **Each runtime (Flow, Focus, Narrate):**
  - gains its own private `startAtFirstText`, plus `firstTextToken` and `firstTextReentry`;
  - gains the Q2 option (a) flag `pendingFirstText`, which is set on the empty-words path when there is no section map and acted on once in `adoptDocument`;
  - clears the flag on Pause, stop, navigation and a new Play.
- **Narrate only:** it holds `sectionNavInFlight` and traces `play-first-text` during the move.
- **Checks:**
  - no added import, timer or shared module;
  - no file outside the spec's fence was touched;
  - Narrate's `engine/`, `FoliateView.tsx` and `surface.ts` are unchanged.

## Done-when 4

- **Q2 gate:** exits 0, with 18 passed. (f7), (o7) and (n7) each show exactly one completed start and one `goToSection(1)`, so there is no double start.
- **No-timers grep:** empty. **No-import grep:** empty.
- **`pendingFirstText` count:** 12 per runtime.
- **Targeted files:** 42/42.
- **Pinned suites, unedited:** 52 files and 429 tests.
- **`getDisplayedSectionIndex`:** 23 lines (amended).
- **`private startAtFirstText`:** 1 per runtime.
- **Typecheck:** 0.

## Gates (Done-when 5, final source commit `c57a7b4f`)

- `npm test`: 198 files, 2,641 passed, 1 skipped, 0 failed.
- `npm run typecheck`: 0.
- `npm run build`: 0.
- **Collected set:** exactly three `=>` lines (`narrate.playFirstText.test.ts`, `flowPlayFirstText.test.ts`, `focusPlayFirstText.test.ts`) and no `<=` line.

## Live L1–L3 (Done-when 7, packaged x64 `out-x64`)

Each run used a fresh scratch profile and passed the preflight. In every run, `before` had the cover on screen with 0 stamped words and no cursor, and the live hashes were unchanged.

| Row | Verdict | First cursor | Later read |
|---|---|---|---|
| L1 Flow | PASS | 60 ms, section 1, "The", #0 | #14 |
| L2 Focus, run 1 | FAIL, `not-reading-on` | 66 ms, section 1, "The", #0 | in-page span #0 |
| L2 Focus diagnostic | — | — | Pause shown from 62 ms; word display "anywhere" at 3.07 s |
| L2 Focus, re-run under the ruling | PASS | 63 ms, section 1, "The", #0 | word display "anywhere", Pause shown |
| L3 Narrate | PASS | 341 ms, section 1, "The", #0 | #6 |

Narrate used models root `narrate-quit-linger-1\models`. The L2 re-run used `after-focus-2.json`.

## Package verification (standing rule 53, temporary placement)

- **(a)** `--dir` x64 and arm64 both exit 0. `app.asar` is `06DF120943749774FDF8BA4C8E19A1C3A02D7942C21B99E927D8255B99485636` on both. The pair check prints `0` (544 files).
- **(b)** The asar contains `BLURBY_USER_DATA_DIR`: True. The 25 s x64 scratch launch (`rule53-x64-25s`) passes:
  - `userData` proved;
  - error.log none written, 0 flagged stdio lines, no crash dump, exit 0;
  - live `library.json` and `settings.json` unchanged.
- **(c)** No `main/` change. The asar's `dist\` equals the built `dist\`: 21 files, 0 differences.
- **(d)** L1–L3 ran on this package.
- **(e)** Sent to Blurby.Brain1: the package path `C:\Projects\Blurby-artifacts\play-first-text-1\out-x64`, the commit and the logs.
- **Pending:** the arm64 25 s launch on Rodney, at merge time.

## Owner check for release gate (2) (standing rule 45)

- **(o-pft)** On *Meditations*, open the book at its cover.
  - In Flow, press Play. Reading starts at once on the first page of text, "The Project Gutenberg eBook of Meditations…", with the cursor on "The".
  - Do the same in Focus and in Narrate. Narrate's voice says "The" first.
  - On a page with no words and no text after it, Play does nothing.
- **The recorded asymmetry (owner ruling Q3).** A paused Focus or Narrate session resumes at the paused word. Flow has no resume, so a paused Flow session whose view now shows a section with no words takes the skip.

## Lessons

- **Applied:**
  - standing rules 36, 41–55;
  - LL-030, LL-031/169, LL-066, LL-070, LL-071/081, LL-073/108, LL-109, LL-120, LL-125, LL-142, LL-143, LL-152, LL-161, LL-165, LL-170.
- **New candidates:**
  - **A live gate's literal word must be read from the sample before it is written into a spec.** "MEDITATIONS" was assumed; section 1 opens with the Gutenberg header. Apply LL-143 to a gate's expected text as well as its counts.
  - **A cursor check must match each mode's display.** Focus shows its reading word in the word display, not on the page span, so "the cursor index grows" cannot see Focus progress.
  - **A grep count in a spec must be re-derived whenever the spec's code changes.** The Q2 addition tripled the call sites, but the count stayed at 17.

## Docs

- BUG-236 is now RESOLVED in source (PLAY-FIRST-TEXT-1) and held on `eb/play-first-text-1` until its merge.
- No register writes and no ROADMAP.md edits (standing rule 46).
