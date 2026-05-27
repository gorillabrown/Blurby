---
sprint: READER-PERSISTENT-ANCHOR-STEP3.4
date: 2026-05-23
runtime: implementation closeout
tokens: n/a
status: code-complete-manual-qa-pending
---

# Phase Close-Out: READER-PERSISTENT-ANCHOR-STEP3.4

## Sprint Brief

**Goal:** Repair the Narrate exact-start failure by making visual click indexes and TTS chunk indexes resolve to the same canonical word.
**Result:** Commit `2142d4a` implemented locked Approach B: `wrapWordsInSpans` now content-aligns rendered DOM spans to canonical extractor words, with canonical words passed through the Foliate stamping paths and 17 new tests.
**Learned:** The durable fix was not tokenizer unification; it was stamping the rendered surface from the canonical TTS word array so click index equals TTS index by construction.
**Recommend:** Treat Step 3.4 as code-complete but keep the gate closed until S12/S13 pass in manual audio QA with DevTools diagnostics.
**Bottom line:** This is the right structural repair, but it is not merge-ready until Evan confirms heard audio starts at the clicked word.

**By the numbers:** One commit, 4 source files changed, 1 test file added, 17 new tests, 2,811 tests reported passing, TypeScript clean, and `git diff --check` clean.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Approach B implementation | Canonical index ownership | Click index is stamped from canonical TTS words | `wrapWordsInSpans` content-aligns DOM spans to canonical extractor words | Code pass, QA pending | Structural fix | Critical |
| 2 | Canonical word propagation | Full rendering path | Foliate wrapping receives canonical words everywhere it stamps spans | `ReaderContainer` to `FoliatePageView` and `useNarrationCaching` re-stamp paths updated | Code pass, QA pending | Improved | Critical |
| 3 | Tokenizer divergence handling | Drift resistance | Stitching, punctuation-gap, block-selection, and footnote mismatches do not silently shift indexes | Content alignment stamps true canonical index and handles skip/realign cases | Code pass, QA pending | Improved | Critical |
| 4 | Test coverage | Regression protection | Cover alignment, divergence, skip/realign, and edge cases | 17 tests added in `tests/foliateContentAlign.test.ts` | Pass | Improved | Pass |
| 5 | Automated verification | Test/typecheck/diff gates | Green | 2,811 tests pass, TypeScript clean, diff check clean | Pass | Maintained | Pass |
| 6 | Manual audio QA | SRL-053 / SRL-067 gate | S12/S13 pass by ear and diagnostics | Not rerun yet | Pending | Unchanged | Critical |
| 7 | Merge readiness | Branch governance | Safe to merge | Not ready until manual audio QA passes or miss is explicitly accepted | Fail | Unchanged | Critical |

## Implementation Evidence

Step 3.4 added this branch commit:

| Commit | Description |
|---|---|
| `2142d4a` | Content-align word wrapping to canonical extractor index space |

Changed files:

| File | Role |
|---|---|
| `src/utils/foliateWordWrapping.ts` | Implements canonical content-alignment stamping in `wrapWordsInSpans`. |
| `src/components/FoliatePageView.tsx` | Passes canonical section words into Foliate wrapping. |
| `src/components/ReaderContainer.tsx` | Ensures the post-extraction canonical words path feeds the wrapping surface. |
| `src/hooks/useNarrationCaching.ts` | Updates re-stamp behavior to use canonical words. |
| `tests/foliateContentAlign.test.ts` | Adds 17 alignment/divergence/realign/edge-case tests. |

Reported verification:

| Check | Result |
|---|---|
| Full test suite | 2,811 passing |
| TypeScript | `tsc` clean |
| Diff hygiene | `git diff --check` clean |
| Merge state | Not merged; manual QA gate pending |

## Interpretation

Step 3.4 follows the right directive. Step 3.3 proved that raw numeric indexes were crossing a subsystem boundary unsafely: the visual click path and the TTS scheduling path used independently built word arrays. Approach B fixes that class of error at the boundary that matters. Instead of trying to force the renderer tokenizer and main-process extractor to emit identical sequences from different DOM/XHTML views, Foliate DOM spans are stamped from the canonical extractor words by content alignment.

That design is stronger than tokenizer parity as a product repair. If the renderer sees a slightly different shape of the book than the extractor, positional parity can still drift. Content alignment can absorb known and future tokenizer differences as long as the canonical word can be located in the rendered text, and it can warn/recover when it cannot.

The implementation is still gated by live audio behavior. Automated tests can prove the index invariant and surface stamping, but S12/S13 require the final user-facing behavior: click a mid-sentence word, start Narrate, verify the DevTools logs agree on the start word, and confirm by ear that audio begins at that same word without cursor lead/drift.

## Dispositions

| Item | Disposition | Rationale |
|---|---|---|
| Commit `2142d4a` | Accept as code-complete | It implements the locked Approach B directive and avoids re-litigating tokenizer unification. |
| Approach B | Accept | Content alignment makes click index equal TTS index by construction. |
| Approach A | Keep rejected | Tokenizer unification remains brittle across Foliate DOM and raw XHTML views. |
| Automated verification | Accept | Reported full-suite, typecheck, and diff gates are green. |
| Manual QA gate | Pending | Heard-audio confirmation is still required for S12/S13. |
| Merge to `main` | Defer | SRL-053 and SRL-067 require manual QA before merge or advancement. |
| `READER-ISO-1A` | Defer | Adapter isolation must wait for the runtime behavior to pass or be explicitly accepted. |

## Governance Updates

- `ROADMAP.md` should record Step 3.4 as code-complete at `2142d4a`, with manual audio QA pending.
- `docs/governance/sprint-queue.xlsx` should keep `READER-PERSISTENT-ANCHOR-STEP3-REPAIR` at Seq 1 but retitle the active gate as Step 3.4 manual QA after content-alignment repair.
- `SpecRetro.Lessons_Learned.md` should append SRL-068.
- `READER-ISO-1A` remains blocked until S12/S13 pass by ear or are explicitly accepted.

## Next Work Direction

Rerun the Step 3.4 manual audio QA on `hotfix/reader-persistent-anchor` at `2142d4a` with DevTools open. Click a mid/end-of-sentence word such as `Medicare`, start Narrate, and confirm:

```text
[TTS-7L] onWordClick ... word: "Medicare."
[narrate] speakNextChunkKokoro ... word="Medicare."
[pipeline] produceChunk ... firstWord="Medicare."
```

Then confirm by ear that audio begins at the clicked word and that the cursor does not lead or drift. Re-confirm S8, S1, S4, and S18 after S12/S13.

## Gates

| Gate | Result |
|---|---|
| Automated verification | Pass, per CLI report. |
| Manual QA | Pending. |
| Merge | Blocked. |
| Adapter isolation | Blocked behind Step 3.4 audio QA. |
| Release | Not applicable. |

## Evidence

- Commit `2142d4a`
- `docs/governance/close-outs/CloseOut.READER-PERSISTENT-ANCHOR-STEP3.3.2026-05-22.md`
- `docs/studies/reviews/Reader_Persistent_Anchor_Step3.3_Manual_QA_2026-05-22.md`
