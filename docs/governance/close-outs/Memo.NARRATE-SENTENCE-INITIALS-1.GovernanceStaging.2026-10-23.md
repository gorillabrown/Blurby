# Dispatch Close-Out Governance Staging — NARRATE-SENTENCE-INITIALS-1 (PARKED, in progress)

**Status:** parked 2026-10-23 for Blurby.Roadmap's priority interrupt (the gate (2) smoke installers). This is not a close-out. It records where the run stopped.

**Run setup:**
- **Branch:** `eb/narrate-sentence-initials-1` from `refs/remotes/origin/eb/narrate-sentence-resume-1` @ `35716c5f`.
- **Worktree:** `C:\Projects\Blurby\.worktrees\narrate-sentence-initials-1`, set up with `npm ci`.
- **Register:** nothing was written (standing rule 46).

## Done so far

| # | State | Evidence |
|---|---|---|
| 1 | Done | The red tests are committed first, in `tests/narrate/narrate.chunkPlan.test.ts`. On the base, "M. Annius Verus" (word 4 → 3, expected 0) and "J. R. R. Tolkien wrote." fail. The `I.` and `x.` controls pass. |
| 2 | Done | The change is in `src/reader/modes/narrate/engine/chunkPlan.ts`. Narrate suite: 20 files, 139 tests, all pass. |
| 3 | Half | Owner sweep under the app's Electron (`app-node.ps1 … reconcile-sweep.mjs --owner <the 8-book corpus NARRATE-TOKEN-CAP-1 used>`). **Fix:** `OWNER: 3 fail-closed chunks of 11320 in 8 books; 0 class E, 3 ruled residual, 0 other`, exit 0. **Base `35716c5f`:** `OWNER: 3 fail-closed chunks of 11258 in 8 books; 0 class E, 3 ruled residual, 0 other`, exit 0. The counts are no worse. **Still to do:** list the chunks whose bounds changed (+62 chunks overall). Plan each book with the base and the fixed `planChunks` and diff the bounds. Owner text stays out of this file (book hash, word index, the initial token). Snippets go in `C:\Projects\Blurby-artifacts\narrate-sentence-initials-1\` only. |
| 4 | Not run | `npm test`, `npm run typecheck`, `npm run build`. |
| 5 | Fence | `chunkPlan.ts`, the chunk-plan test, this memo. A time log will follow. |

## Deviation from the spec's literal rule (tier 1; decided, recorded here)

The spec's rule is that an uppercase single letter other than `I.`, before any capitalised word, does not end a sentence. That rule breaks two pinned tests whose expected behaviour is correct English:
- "in Section B. The next…" still ends at "B.";
- "B. C. He" still ends.

So the rule is narrowed. `NAME_INITIAL` (`/^[A-HJ-Z]\.$/`) does not end a sentence when the next word is capitalised **and** is not a common sentence opener: `SENTENCE_OPENER`, a short list of determiners, pronouns, conjunctions and prepositions.

- "M. Annius" and "R. Tolkien" join.
- "B. The" and "C. He" end.
- The pinned tests are unchanged (no Rule 50 update).
