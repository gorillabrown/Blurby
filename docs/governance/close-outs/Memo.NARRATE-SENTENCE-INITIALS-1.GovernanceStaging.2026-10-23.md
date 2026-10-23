# Dispatch Close-Out Governance Staging — NARRATE-SENTENCE-INITIALS-1 (in progress)

**Run setup:**
- **Branch:** `eb/narrate-sentence-initials-1` from `refs/remotes/origin/eb/narrate-sentence-resume-1` @ `35716c5f`.
- **Worktree:** `C:\Projects\Blurby\.worktrees\narrate-sentence-initials-1`, set up with `npm ci`.
- **Register:** nothing was written (standing rule 46).

**History:**
- Parked 2026-10-23 at `68916c45` for the gate (2) installer interrupt.
- Resumed after `d205694d`, on Blurby.Roadmap's instruction, with light steps only. The owner sweep re-run, `npm test` and the build wait until blurby-f0 reports that its UI-SWEEP run is done.

## The change (`src/reader/modes/narrate/engine/chunkPlan.ts`, `isSentenceEnd`)

An uppercase single letter other than `I.` (`NAME_INITIAL`, `/^[A-HJ-Z]\.$/`) does not end a sentence when all three of these hold:
- the next word is capitalised (`NEW_SENTENCE`);
- the next word is not a common sentence opener (`SENTENCE_OPENER`: determiners, pronouns, conjunctions, some prepositions);
- the letter does not complete a known dotted abbreviation with the word before it (`ABBREVIATION` on `words[i-1] + words[i]`, which is "B." "C.", "A." "D." as Electron's ICU segments them).

**The opener list (`SENTENCE_OPENER`), in full:** the, a, an, this, that, these, those, it, its, he, she, they, we, you, i, his, her, their, our, my, but, and, or, so, then, there, here, in, on, at, if, when, as, after, before, for, with, what, who, how, why, no, not, yet.
- The match is case-insensitive, on the whole word (`\b`), after any opening quote or bracket.
- It is pinned by the test "a common sentence opener after the letter still starts a new sentence": The, He, It, But and Then each start a new sentence after "plan B.", and "Smith" joins.

### Deviations from the spec's literal rule (tier 1; accepted by Blurby.Roadmap 2026-10-23)

- **The opener exclusion.** The literal rule ("before any capitalised word") breaks two pinned tests whose expected behaviour is correct English: "in Section B. The next…" and "B. C. He" still end at the letter. With the exclusion, both pinned tests are unchanged (no Rule 50 update).
- **The dotted-abbreviation guard.** The bound diff (below) showed the literal rule also joined "250 B. C. Cyprus has been". The spec requires the dotted case to stay unchanged, so a red test was added first (it failed on `68916c45`), then the guard.

## Evidence

| # | State | Evidence |
|---|---|---|
| 1 | Done | **Red tests committed first** (`tests/narrate/narrate.chunkPlan.test.ts`). On the base `35716c5f`, "M. Annius Verus" (word 4 gives 3, expected 0) and "J. R. R. Tolkien wrote." fail. The `I.` and `x.` controls pass on the base and on the fix. The era test ("born 250 B. C. Cyprus", word 5 gives 4) was red on the first cut `68916c45` and is green now. |
| 2 | Done | Narrate suite: 20 files, 140 tests, all pass. |
| 3a | Done, on `68916c45`; **re-run owed on the final rule** | The owner sweep ran under the app's Electron (`app-node.ps1 … reconcile-sweep.mjs --owner <the 8-book corpus NARRATE-TOKEN-CAP-1 used>`). **Fix:** `OWNER: 3 fail-closed chunks of 11320 in 8 books; 0 class E, 3 ruled residual, 0 other`, exit 0. **Base:** `… of 11258 …; 0 class E, 3 ruled residual, 0 other`, exit 0. The re-run on the final rule waits for f0's report. |
| 3b | Done, final rule | **Chunk-bound diff** under the app's Electron. Each book is planned as the engine plans one epoch from word 0, with the base and the fixed `planChunks`. Totals: 11,258 chunks on the base, 11,318 on the fix; 864 bound positions differ. **Every diverged region (158) contains a word whose sentence-end verdict the fix flipped; 0 regions without one.** Table below. |
| 4 | Owed | `npm test`, `npm run typecheck`, `npm run build`, after f0's report. |
| 5 | Fence | `chunkPlan.ts`, the chunk-plan test, this memo, and the time log (to follow). |

### Changed bounds by book

Owner books are listed by hash only. Their text around each flip is kept in `C:\Projects\Blurby-artifacts\narrate-sentence-initials-1\changed-bounds-snippets.txt`, which is not committed.

| Book | Words | Chunks base → fix | Flipped words | of which Roman letters (I V X L C D M) | Diverged regions | Regions without a flip |
|---|---|---|---|---|---|---|
| c933bd96 | 1,875 | 88 → 89 | 9 | 2 | 5 | 0 |
| b6e457e6 | 55,882 | 2,594 → 2,593 | 8 | 0 | 4 | 0 |
| ef95fc39 (same text as b6e457e6) | 55,882 | 2,594 → 2,593 | 8 | 0 | 4 | 0 |
| dab1d9d7 | 16,718 | 780 → 798 | 87 | 29 | 37 | 0 |
| 58ed7188 (same text as dab1d9d7) | 16,718 | 780 → 798 | 87 | 29 | 37 | 0 |
| 3c6f42b3 (same text as dab1d9d7) | 16,718 | 780 → 798 | 87 | 29 | 37 | 0 |
| 844e92e6 | 1,111 | 52 → 52 | 0 | 0 | 0 | 0 |
| 9015cc65 (the bundled *Meditations*, public domain) | 80,493 | 3,590 → 3,597 | 65 | 47 | 34 | 0 |

### What the flips are

The text examples here come from the public-domain sample only.

- **Name initials** (the intended class):
  - "real name was M. Annius Verus" (word 203, the live check's case);
  - "associated with himself L. Ceionius Commodus";
  - "the house of P. Calvisius";
  - translators' names ("R. Graves", "G. H. Rendall", "J. Jackson");
  - "Professor Michael S. Hart".
- **Roman paragraph numbers**, 47 of 65 in *Meditations*, for example "affairs. X. Of Catulus" and "approve themselves. V. Do nothing".
  - Before the fix, the numeral stood as its own one-word sentence. Now it opens the paragraph it numbers, so a resume inside the paragraph starts at its number.
  - **This is the second expected class, "initials and paragraph numerals"** (Blurby.Roadmap, 2026-10-23): resuming at "X." is the paragraph's start, the right place.
  - Pinned by the test "a Roman paragraph numeral opens its paragraph": `sentenceStartAt` at "Of" returns "X.".
- **A few outline or reference letters**, which stay joined as harmless:
  - the licence's "1. A. By reading", "1. E. Unless";
  - "p. 486 A. XXV.";
  - "a tribe of S. Germany".

## Lessons

- **Applied:**
  - Standing rule 43: red first, with controls, including a red test for the regression the bound diff found.
  - LL-160: checkers run under the app's Electron.
  - LL-142.
  - LL-162: the whole owner corpus.
- **Candidate:** a chunk-bound diff with a "diverged region must hold a flipped verdict" check explains every moved bound mechanically. It found the "B. C." regression that the fail-closed counts could not show.
