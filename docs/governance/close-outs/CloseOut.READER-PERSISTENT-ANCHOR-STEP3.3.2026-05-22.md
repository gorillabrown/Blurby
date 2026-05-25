---
sprint: READER-PERSISTENT-ANCHOR-STEP3.3
date: 2026-05-22
runtime: implementation closeout + manual QA gate
tokens: n/a
status: manual-qa-failed
---

# Phase Close-Out: READER-PERSISTENT-ANCHOR-STEP3.3

## Sprint Brief

**Goal:** Repair the remaining Narrate exact-start failure where clicking a word could start audio from an earlier sentence and ensure the first cold-start audio chunk ends cleanly.
**Result:** Commits `881b01d` and `48c23ac` fixed real race/ramp issues, but manual QA failed S12/S13 because the click resolver and TTS pipeline use different word-index spaces.
**Learned:** A numeric word index cannot safely cross from Foliate click/highlight space into TTS chunk space unless both sides share tokenization or an explicit translation layer.
**Recommend:** Keep `READER-ISO-1A` blocked and run Step 3.4 / `NARRATE-CURSOR-SYNC-3` to unify or translate the word-index space before Narrate exact-start is accepted.
**Bottom line:** Step 3.3 is useful but manual-QA-red; the remaining failure is now pinned to the tokenizer/index boundary.

**By the numbers:** Two commits, 4 source files changed, 2 test files updated, 31 insertions, 10 deletions, two rounds of 2,794 tests passing, and TypeScript clean.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Pipeline trace | Diagnostic coverage | Trace click-to-audio-start ownership | 12+ files across 6 subsystems traced; no deterministic index-mapping break found | Pass | Improved understanding | Discovery |
| 2 | Active click double resync | Runtime ownership | One owner restarts Narrate on active click | `onWordClick` could call `narration.resyncToCursor` twice during active Narrate | Found | New | Critical |
| 3 | Resync ownership fix | Active retarget path | Delegate resync to one path | `skipNarrationResync` added so `retargetActiveModeToWord` owns the resync | Code pass, QA pending | Improved | Critical |
| 4 | DEV diagnostics | Manual QA observability | Log actual start word at pipeline entry | Added `[narrate] speakNextChunkKokoro` and `[pipeline] produceChunk` start-word logs | Pass | Improved | Pass |
| 5 | Cold-start sentence boundary | First audio chunk naturalness | Cold-start chunk ends at sentence boundary when nearby | Chunk searches forward from target end to sentence-ending punctuation within 25 words | Code pass, QA pending | Improved | Pass |
| 6 | Parallel ramp overlap | Chunk dispatch continuity | Chunk 1 starts after resolved chunk 0 end | Parallel ramp now uses `openingRampPlan[0].endIdx`, not raw `firstSize` | Pass | Fixed latent bug | Critical |
| 7 | Automated verification | Test/typecheck gates | Green after each fix cycle | 2x 2,794 tests pass; TypeScript clean | Pass | Maintained | Pass |
| 8 | Effort calibration | Investigation vs implementation | Effort estimate matches diagnostic burden | Task #1 traced 12+ files and Task #6 exposed a latent ramp-overlap bug | Discovery | Reinforces SRL-062 | Discovery |
| 9 | Manual QA gate | SRL-053 live audio QA | S12/S13 pass by ear | FAILED: clicking `Medicare` resolved visual index `3370 = Medicare`, but TTS index `3370 = Many` | Fail | Root cause pinned | Critical |
| 10 | Merge readiness | Branch governance | Safe to merge | Not ready until manual QA proves exact start | Fail | Unchanged | Critical |
| 11 | Regression spot checks | Preserve Step 3.2/3.3 wins | S8, S1, S4, and S18 remain green | S8 single Flow cursor, S1 Page Jump Back, S4 Focus overlay, and S18 reopen all held | Pass | Maintained | Pass |

## Implementation Evidence

Step 3.3 added these branch commits:

| Commit | Description |
|---|---|
| `881b01d` | Eliminate double `resyncToCursor` on word click and add Narrate start diagnostics |
| `48c23ac` | Snap cold-start chunks forward to sentence boundary for clean first audio |

Reported verification:

| Check | Result |
|---|---|
| Full test suite after `881b01d` | 2,794 passing |
| Full test suite after `48c23ac` | 2,794 passing |
| TypeScript | `tsc` clean |
| Changed files | 4 source files + 2 test files |
| Manual QA report | `docs/studies/reviews/Reader_Persistent_Anchor_Step3.3_Manual_QA_2026-05-22.md` |
| Merge state | Not merged; manual QA gate failed |

## Interpretation

The Step 3.3 static trace did not find a deterministic mapping break from click to anchor to cursor-driven start to Kokoro chunk production. The subsequent manual QA diagnostics did find the missing boundary: the click resolver and TTS pipeline agree on the same numeric index but disagree on the word that index names.

The first concrete bug is still important: active word clicks triggered two full Narrate resync paths. `commitSharedWordAnchor` could resync the narration, then `retargetActiveModeToWord` could resync it again. That means one click could create two rapid pipeline stop/start cycles, which is a plausible race source for the "audio starts behind selection" behavior. Step 3.3 gives active retargeting a single resync owner.

The second concrete bug came from the cold-start chunk repair. Snapping the first chunk forward to a sentence boundary is a better audio UX, but it exposed a pre-existing assumption in the parallel ramp dispatch: chunk 1 was computed from the raw `firstSize` target instead of the plan's resolved `endIdx`. Once chunk 0 could extend to a sentence boundary, raw-size math caused overlap. Using `openingRampPlan[0].endIdx` makes the ramp respect the actual chunk plan.

The added DEV diagnostics did their job. They turned the S12/S13 audio failure from a subjective timing report into a machine-verifiable index-space mismatch:

```text
[TTS-7L] onWordClick: resolved globalWordIndex: 3370 word: "Medicare."
[narrate] cursor-driven - words: 173727 start: 3370 speed: 1 engine: kokoro
[narrate] speakNextChunkKokoro: startIdx=3370, word="Many", prev="standards."
[pipeline] produceChunk: startIdx=3370, endIdx=3384, firstWord="Many",
           text="Many of the residents are above age sixty five and have acce..."
```

The same index, `3370`, means `Medicare` to `onWordClick` but `Many` to `speakNextChunkKokoro` and `produceChunk`. That explains the full symptom chain: audio starts at the sentence beginning, the visual cursor sits ahead near the clicked word, and cursor/audio drift widens as the mismatched index spaces continue to advance.

The likely mechanism is tokenization divergence. The TTS chunk normalized `sixty-five` to `sixty five`, which suggests the TTS word array splits punctuation or hyphenated terms differently from the Foliate/click word index. Step 3.3 fixed the resync race and chunk-end planning, but the next repair has to address the index-space boundary directly.

## Proposed Dispositions

| Item | Disposition | Rationale |
|---|---|---|
| Commit `881b01d` | Accept as code-complete | It fixes a real double-resync race and adds targeted diagnostics. |
| Commit `48c23ac` | Accept as code-complete | It improves cold-start audio naturalness and fixes ramp overlap caused by resolved chunk boundaries. |
| Pipeline trace | Accept with correction | It narrowed the problem, and manual QA later identified the index-space boundary as the remaining deterministic mismatch. |
| Double resync bug | Accept as real but not sufficient | Double stop/start cycles were worth fixing, but S12/S13 still fail after the race was removed. |
| Cold-start sentence snapping | Accept, QA pending | First chunks should now end at natural sentence boundaries. |
| Ramp-overlap fix | Accept | Downstream dispatch now uses resolved plan boundaries. |
| DEV diagnostics | Accept | They make the next QA pass diagnostic, not just pass/fail. |
| Automated verification | Accept | Full suite and TypeScript are green after both fix cycles. |
| Manual QA gate | Failed / Fix Now | S12/S13 fail because the clicked visual index resolves to a different TTS word. |
| Merge to `main` | Defer | SRL-053 gate remains open. |
| `READER-ISO-1A` | Defer | Adapter extraction waits for exact-start proof or explicit acceptance. |
| Step 3.4 / `NARRATE-CURSOR-SYNC-3` | Add as active next repair | The fix must unify tokenization or translate visual click indexes into TTS word-array indexes. |

## Governance Updates

- `ROADMAP.md` should record Step 3.3 as manual-QA-failed and add Step 3.4 / `NARRATE-CURSOR-SYNC-3` as the active repair gate.
- `docs/governance/sprint-queue.xlsx` should keep `READER-PERSISTENT-ANCHOR-STEP3-REPAIR` at Seq 1 but describe the active gate as Step 3.4 word-index/tokenization repair.
- `SpecRetro.Lessons_Learned.md` should append SRL-067.
- `READER-ISO-1A` remains blocked until S12/S13 pass by ear or are explicitly accepted.

## Next Work Direction

Run Step 3.4 / `NARRATE-CURSOR-SYNC-3` on `hotfix/reader-persistent-anchor`. The repair should make the click resolver and TTS pipeline share one word-index space, or explicitly translate the Foliate/click index into the TTS word-array index before computing the chunk start.

The acceptance test is crisp: clicking `Medicare` must make `onWordClick`, `speakNextChunkKokoro`, and `produceChunk` agree that the start word is `Medicare`, and heard audio must begin there. A generalized test should cover hyphenated or normalized text such as `sixty-five` so tokenizer drift cannot reappear.

```text
[TTS-7L] onWordClick: resolved globalWordIndex=N word: "Medicare."
[narrate] speakNextChunkKokoro: startIdx=N, word="Medicare.", prev="to", totalWords=...
[pipeline] produceChunk: startIdx=N, endIdx=..., firstWord="Medicare.", text="Medicare..."
```

After the fix, regression spot-check S8, S1, S4, and S18 again. Keep S5 as the accepted partial unless separately reopened.

## Gates

| Gate | Result |
|---|---|
| Automated verification | Pass. |
| Manual QA | Failed: S12/S13 blocked by click/TTS index-space mismatch. |
| Merge | Blocked. |
| Adapter isolation | Blocked behind Step 3.4 word-index repair and audio QA. |
| Release | Not applicable. |

## Evidence

- Commit `881b01d`
- Commit `48c23ac`
- `docs/governance/close-outs/CloseOut.READER-PERSISTENT-ANCHOR-STEP3.2.2026-05-22.md`
- `docs/studies/reviews/Reader_Persistent_Anchor_Step3.2_Manual_QA_2026-05-22.md`
- `docs/studies/reviews/Reader_Persistent_Anchor_Step3.3_Manual_QA_2026-05-22.md`
