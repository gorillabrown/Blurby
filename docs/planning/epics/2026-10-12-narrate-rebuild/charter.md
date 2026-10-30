---
epic: narrate-rebuild
id: NARRATE-REBUILD-1
item: NARRATE-REBUILD-1
origin: roadmap — NARRATE-REBUILD-1 (held plan 2026-10-11-narrate-rebuild, absorbed 2026-10-11)
created: 2026-10-12
status: complete   # active | complete | aborted — set complete only per launch.md Completion protocol
---

# Epic Charter — Rebuild Narrate with the cursor attached to the playing word

<!-- Owner amendment 2026-10-13 (Decision #19): row D6 replaced with the owner-authored text. -->
<!-- Owner amendment 2026-10-14 (Decision #22): row D6 made hardware-tiered (owner decision; budget calibrated by Blurby.Brain). -->
<!-- Amendment 2026-10-15 (Decision #23, Blurby.Brain tier-1 rulings for P6b, applied by the planner per Decision #9's rule): DoD preamble, D2, D3, D5 and D7 amended; rows D14 and D15 added; one Lessons row added. D6 is not re-run in P6b. -->
<!-- FROZEN after launch. Only the owner amends this file; the executor treats it as the
     contract. If reality proves the contract wrong, that is a BLOCKER(USER), not an edit. -->

## Outcome

Blurby has a new Narrate reading mode, built from scratch as a fourth independent runtime, whose cursor is the word at the current playback sample. Every word boundary comes from an exact, engine-native word table whose identity is proven against the audio actually played; nothing is estimated, stretched or guessed, and when exact timing is missing narration pauses rather than guess. Page, Focus and Flow are unchanged.

**The specification is ROADMAP.md § NARRATE-REBUILD-1** (Phase 0 gates P0-1 to P0-5, the Verdict, Core, Core acceptance with the Latency budget, Then, the charter inputs, owner rulings R2–R11 and the charter choices T1–T7). Where this charter is shorter, that entry governs; where they conflict, this charter's DoD and owner decisions govern.

## Definition of Done — all rows must pass

Every command runs in PowerShell 7 (`pwsh`) from the run's worktree root and passes only on its exact exit code; any other code, any stderr text, or a command that did not run fails the row (standing rule 44). Every check script the run writes is first shown to record a failure (LL-151). Every `scripts/narrate-rebuild/` script runs under the app's own Electron as Node, through `pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 <script> [args]`, so it numbers book words exactly as the app does (Electron 41's ICU 77.1). Under plain Node it refuses with exit 3, which fails the row.

| # | Condition | Verify by | Expected evidence |
|---|-----------|-----------|-------------------|
| D1 | **Phase 0 verdict** recorded in three separate parts — (i) construction (P0-1, P0-2, P0-4 laws), (ii) acoustic error and uncertainty at independently associated anchors (P0-3), (iii) unresolved interiors — with P0-5 latency beside them, each failure's classification (repaired: export, adapter, units, mapping, harness or reference; or engine limit), and the owner's decisions at gate G1 | Read `docs/studies/narrate-rebuild-1/phase0/VERDICT.md`; re-run the harness's summary command it names | P0-1..P0-5 each PASS on both voices (P0-5 on Bella) or a recorded bake-off route; G1 decisions quoted with date |
| D2 | **Frame F2:** clicking "ancient" mid-paragraph in *Meditations* and pressing Play makes "ancient" the first word heard; the reading crosses from the Introduction into "HIS FIRST BOOK" with no stall and the highlight follows | Owner-observed on a production build (standing rule 45, LL-152) plus one traced 1.00x session on the P6b build. The session opens at app word 2970 ("ancient", Introduction) and crosses app word 5480 ("HIS FIRST BOOK") with at least 2 minutes of reading past it: `p5-latency-e2e.mjs --only session --rates 1.0 --minutes 21 --position 2970` exits 0 and `d2-crossing-check.cjs <trace> 2970 ancient 5480 HIS` exits 0. The checker compares both words by text in the app's numbering; its controls are `--break` on the same trace (exit 1) and the S5 trace `phase5/d2-ancient-crossing.json` with `2963 ancient 5480 HIS` (exit 1, numbering) | Owner pass recorded in state.md → Evidence (G2, 2026-10-14). The checker's PASS output shows the first voiced and first committed word is 2970 "ancient"; scheduled units and commits follow the text order with no gap, repeat, drop or stop before 5480; and `pastBoundaryS` ≥ 120. The trace is committed as `docs/studies/narrate-rebuild-1/phase6/d2-ancient-crossing.p6b.json` |
| D3 | **Recorded output:** every highlight change lands within one display frame of its table boundary on the playback clock, for a table that passed P0-3 | The in-app log pairs each highlight commit (frame timestamp) with the playback sample via `AudioContext.getOutputTimestamp()`; the run's check script over a ≥5-minute session at 1.00x and 2.00x exits 0. The sessions run on the P6b build in a quiet window: P6b changes chunk plans, so evidence from earlier builds does not count for completion | Script output: 0 commits outside one measured refresh interval; clock-mapping uncertainty ≤10 ms (else inconclusive, not a pass) |
| D4 | **No estimated timing exists:** a structural test proves no estimated-timing path; negative controls through the full path — a missing table, a native-labelled table that mismatches its words or audio, a fabricated weight-shaped table — each fail closed (F4) and none is trusted, recorded, exported or cached as native | `npx vitest run <the run's structural and negative-control suites>` exits 0 (named in plan.md at P3's gate) | All named tests pass; each control was first seen failing on a deliberately broken path |
| D5 | **Core acceptance:** one sample clock and one table lookup drive cursor, handoff and resume; a speed change finishes the word in progress and starts the new speed at the next word (R7) with coalescing and a stated stale-job bound; silence holds the last spoken word (R6); no overlapping voiced samples, no dropped or repeated word across mid-word click, pause/resume, adjacent and extreme speed changes, section and chapter crossings | Named tests in plan.md (P3/P5 gates) exit 0, plus the D3 log of the P6b-build sessions analysed for overlap, drop and repeat | 0 overlaps, 0 drops, 0 repeats; R6/R7 assertions pass |
| D6 | **Latency budget, hardware-tiered (Decision #22):** request → first voiced sample (T6 threshold, playback clock), for Play, resume, word click and speed change. **Reference class** (the owner's 12-core Snapdragon, or 8+ physical cores): ≤ 2 s warm and ≤ 8 s cold. **Mainstream class** (4 physical cores / 8 threads, e.g. the quiet machine's i7-1185G7): ≤ 2.5 s warm and ≤ 8 s cold. **Amended 2026-10-25:** Cold click on mainstream hardware is the first click in a fresh process made while playing, as soon as the playing section's words are on screen, timed from its own request against the 8,000 ms cold budget (`clickLatencyMs`; owner ruling (B), 2026-10-25, NARRATE-HARNESS-COLDCLICK-1 outcome R4). Cold click on the reference class keeps its click-before-first-voice trial | The run's latency script, trials per T7 (warm 20 per request type at 1.00x and 2.00x, requests 2 s apart; cold 5 per type from a fresh process). A trial counts only when foreign CPU (host busy minus Blurby's own process tree) averages ≤ 25 % over the trial; a trial above the ceiling is reported and replaced by another cycle, never counted and never silently dropped (cap: 40 cycles per type, then stop and ask the owner for a quiet window). Decision #13's "ordinary desktop" is replaced by this definition. Each run records its physical core count (`window.log`), which sets its class | Every counting trial below its class's total; worst case reported, never a mean; every trial's CPU split (host / Blurby / foreign) recorded; over-ceiling trials listed separately. **Completion pass:** the reference-class (Snapdragon) full run meets the reference row, and the mainstream evidence (quiet laptop, `512a0b19`: worst click 2,065, speed 2,215, resume 2,334, play 1,184 ms) is recorded as meeting the mainstream warm row |
| D7 | **Failure states:** F4 (missing, mismatched or non-native table → pause on the last exactly-timed word, short notice, diagnostic logged, chunk never played) and F5 (voice loading state shown; speech within 8 s of Play from cold; never silent hang) | Named tests (P4 gate) exit 0, including `tests/narrate/narrate.mode.test.ts` "an F4 pause mid-session shows F4's notice, not Voice loading" (its control: with `ModeRuntime.ts`'s failure branch of `getNotice` removed, it fails), plus owner-observed F5 on a production build | Tests pass; owner pass recorded |
| D8 | **Frame F6:** switching from Narrate to Flow, Page or Focus stops narration cleanly and opens at the playing word; Page, Focus and Flow behave as before and import no Narrate code | `npx vitest run tests/readerModeBoundaries.test.ts tests/readerModeOwnership.test.ts tests/readerModeIsolation.test.ts tests/readerModes/` exits 0; `git diff --exit-code <phase base> -- docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/page.baseline.json docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/focus.baseline.json docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/flow.baseline.json` exits 0 | Suites pass; baselines byte-identical; NARRATE-REMOVE-1's absence assertions rewritten (not deleted) per ROADMAP Done-when 7 |
| D9 | **Saved mode survives:** a saved `readingMode`/`lastReadingMode` of the rebuilt mode survives startup load, cloud apply and the `save-settings` IPC (if the mode id is `"narrate"`, the three `normalizeReaderModes` runtime calls are retired and their tests rewritten; migration v13 and its tests stay) | The rewritten `tests/settingsNarrateNormalization.test.js` and `tests/settingsMigrationV13.test.js` exit 0 | Pass, with the rewrite named in the phase close-out |
| D10 | **Old pipeline not reused:** the old audio cache is never played or read for timing (R10); `patches/kokoro-js+1.2.1.patch`'s timing code is removed or replaced and its `_alignWordsToTimestamps`/`computeWordTimestamps` are never called | `git grep -n -l -P '_alignWordsToTimestamps|computeWordTimestamps' -- src main scripts patches` prints nothing (exit 1) — on the scaffold base it finds `patches/kokoro-js+1.2.1.patch` (exit 0), which proves the gate can fail; tests prove the new path never calls `ttsCache` read for playback | Exit 1 / tests pass |
| D11 | **Project gates:** `npm test`, `npm run typecheck` and `npm run build` exit 0 on the owner's machine, in the run's worktree (LL-147, LL-149) | The three commands | Exit 0 each; full-suite counts recorded |
| D12 | **Owner listening sign-off** (LL-140): the owner listens to a passage at 1.00x and at one speed of their choice and signs off that the highlight sits on the word being spoken | Gate G2, recorded verbatim in state.md → Evidence | Owner's sign-off text and date |
| D13 | **Published per phase:** every phase merged to `main` through exactly one `--no-ff` merge of its trailer-validated commit chain, pushed, and the register item closed only by `/pointer-closeout` | `git log --merges --first-parent origin/main` names one merge per phase; each phase's first commit carries `NARRATE-REBUILD-1-P<n>-Base: <sha>` equal to its parent | One merge per phase; trailers valid |
| D14 | **Reconciliation gate (P6b):** every chunk the engine plans for the gate corpus reconciles through the producer's real text side, with no failure closed. Without the P6b fix the same sweep fails. A passing table changes only where its old version held a wrong split unit: a split-word unit with cost above 0 that the new table replaces. On the owner's library, only token-cap chunks, or a residual ruled on by Blurby Brain, still fail closed | Through `app-node.ps1`: `reconcile-sweep.mjs --check-tokenizer` exits 0; `--gate` exits 0; `--gate --control` exits 1; `--gate --from 2970 --to 6700` exits 0; `--changed` exits 0 and `--changed --break` exits 1; `--owner <scratchpad owner-epub-copy>` exits 0 (copies only, books hashed, counts only). `npx vitest run tests/narrate/narrate.reconcile.test.js tests/narrate/narrate.chunkPlan.test.ts tests/narrate/narrate.fixtures.test.js` exits 0, each reconcile and chunk-plan case first seen failing on base `2b78f1ca` for the reason its title names | Outputs in `docs/studies/narrate-rebuild-1/phase6/`: gate 0 fail-closed chunks; control ≥ 1; the changed-table list, each entry naming the wrong split unit it replaced (word, groups, cost); owner counts with every remaining failure class E (token cap, NARRATE-TOKEN-CAP-1) or a residual ruled on by Blurby Brain (today one chunk, NARRATE-RECONCILE-RESIDUAL-1). Any other failure goes back to Blurby Brain and leaves the row open |
| D15 | **Checker runtime (P6b):** every epic checker runs under the app's Electron ICU and refuses plain Node | `npx vitest run tests/narrate/narrate.appIcu.test.js` exits 0. The suite runs under plain Node and spawns `reconcile-sweep.mjs`, `d2-crossing-check.cjs`, `p5-recorded-output-check.mjs` and `p0-summary.mjs`, each exiting 3 with `refused: plain Node`. `git grep -L -e app-icu-guard -e assertAppIcu -- ':(glob)scripts/narrate-rebuild/*.mjs' ':(glob)scripts/narrate-rebuild/*.cjs'` prints nothing (exit 1); dry-run 2026-10-15 on base `2b78f1ca`: it lists the 10 unguarded scripts, exit 0 | Test pass; the four refusals; the grep's empty output; `p5-latency-e2e.mjs`'s position comment names THE SECOND BOOK as app word 9431 |

Rules: the session claiming completion re-runs **every** row fresh and pastes the outputs into state.md → Evidence. Any row unverified ⇒ the epic is not done. Rows may be tightened by the owner, never loosened by the executor. A row met vacuously (its surface deleted) is recorded as unreachable, never as a pass.

## Constraints — hard limits

- **Git, from `policy.git` (push; network operations allowed):** each phase P<n> works on its own branch `eb/narrate-rebuild-1-p<n>`, cut from `origin/main` when the phase opens, in the worktree `C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p<n>`. Its first commit's message ends with the trailer `NARRATE-REBUILD-1-P<n>-Base: <base sha>`; the phase's resume base comes from that trailer, never from `git merge-base` against `origin/main` (LL-144). Stage exact paths only, never `git add .` or `-A`. Commit at every checkpoint (subject `NARRATE-REBUILD-1-S<n>: …`) and push the phase branch. At a passed phase gate, merge the phase branch into `main` with `--no-ff` in a detached merge worktree, push, then verify the merge sha is an ancestor of `origin/main`; "already published" means that complete chain on `origin/main` through exactly one `--no-ff` merge, never an empty branch. Never force-push, rebase, reset, stash or clean. Divergence is a BLOCKER(USER). The recipe is launch.md's GIT WORK.
- **Never use the primary checkout** (`C:\Projects\Blurby`) for runs or gates: it holds unrelated local files, including locally excluded tests that fail (`tests/moss*.test.js`, `tests/kokoroPairBaseline.test.js`). Leave them untouched (CLAUDE.md Rule 10).
- **Never modify `%APPDATA%\Blurby`** (the owner's live profile). The pinned model there is read and hash-checked only. The durations-exposed model copy, generated audio and any profile copies live under `C:\Projects\Blurby-artifacts\narrate-rebuild-1\` (owner decision 2026-10-12). Audio never enters the repository.
- **Repository evidence:** harness scripts under `scripts/narrate-rebuild/`, the Phase 0 corpus under `tests/fixtures/narrate-rebuild/` (copied from `git show 612d03f5bdadf861a875d76c6260fd8d3a7520aa:tests/fixtures/narration/<file>`), redacted numeric outputs and the verdict under `docs/studies/narrate-rebuild-1/`. No script or evidence file is named `*.test.*` unless it is a real suite test (LL-146).
- **Isolation:** the rebuilt mode is a fourth independent runtime under `src/reader/modes/<id>/`; no sibling-runtime imports, no shared mutable mode store; Page, Focus and Flow change only at registration and in the bottom bar (A5).
- **Settings durability:** no state whose on-disk durability is required may be written before SETTINGS-WRITE-DURABLE-1 has merged to `main`; until then no acceptance criterion treats `ctx.saveSettings()` as completed persistence (OutsideAudit.10 F7).
- **Register:** the run never writes the monday register; status moves belong to the ceremonies (LL-153).
- **Machine:** all gates run locally on the owner's machine (LL-147); latency trials never run while `npm test` or `npm run build` runs.
- **Budget:** Phase 0 (P1–P2) stops after about 2 working days without a verdict and reports its evidence and the exact blocker (owner charter choice, 2026-10-12). The whole run is expected to take roughly 1–2 weeks of sessions; at 3 weeks without D-row movement, stop and report.

## Non-goals — explicitly out of scope (day one)

- Pronunciation overrides, narration profiles, audio export, media keys, named pauses and footnote modes, voice preview, a voice picker (A6), next-book continuation.
- MOSS-Nano, Pocket and Qwen; per-device output-delay calibration (R5).
- Any change to Page, Focus or Flow behaviour, their G4 baselines, or the four buffer items queued behind this epic.
- Playing or reading the old `userData/tts-cache` (R10).

## Autonomy grants — the executor decides alone (log each call in state.md → Decision log)

- Harness and module structure, file names within the paths above, test structure and naming.
- The repair of any export, adapter, units, mapping, harness or reference failure, and rerunning Phase 0 (R2).
- The mapping policy text required by P0-2, within its stated rules (no proportional split).
- Ordering of work within a phase; refactors under ~50 lines inside the new runtime that enable testing.
- Dev-dependency additions needed by the harness, if no existing dependency serves.
- Merging a phase to `main` once its gate passes (owner decision 2026-10-12), within the Git constraint.
- Running buffer items' files: never — the run touches none of them.

## Escalation triggers — STOP and surface to the owner

- **Gate G1 (always stops):** the Phase 0 verdict is written. The owner decides: continue on Kokoro or start the bake-off; the merged-word display (split, where coverage is complete, or one unit — and, for unit, approves the change to F2, F3, R7 and D3's wording); the rebuilt mode's id (`"narrate"` or another).
- **Gate G2 (always stops):** the owner listening sign-off (D12), and the owner-observed rows (D2, D7 F5).
- A failure under a verified P0-1/P0-2 contract with precision and thread settings already tried (bake-off route).
- P0-3 stays inconclusive after the reference has been repaired twice.
- Any harness or in-app latency trial at or above its budget total after one repair attempt (a visible fail, never waived).
- SETTINGS-WRITE-DURABLE-1 has not merged when P3 needs to write durable state.
- Any need to modify `%APPDATA%\Blurby`, a Page/Focus/Flow runtime, a G4 baseline, or a file outside this epic's paths.
- A DoD row that appears unachievable as written; reality contradicting this charter or an assumption's guard failing; the budget in Constraints exhausted.

When triggered: write a BLOCKER(USER) in state.md with the exact question and what it unblocks, advance any unblocked front; if every front is blocked, append a final journal entry and stop cleanly.

## Assumptions — gaps accepted at launch

| Assumption | Risk if wrong | Guard |
|------------|---------------|-------|
| A1 The pinned `model_q4.onnx` (305,215,966 bytes at `%APPDATA%\Blurby\models\onnx-community\Kokoro-82M-v1.0-ONNX\onnx\`) is the one OutsideAudit.10 hashed (`04cf570c…`) | Phase 0 measures a different artefact | P1's first act re-hashes it against `docs/studies/audit/OutsideAudit.10.2026-10-11/remediation/d4-evidence/units/model-hashes.txt`; a mismatch is a BLOCKER(USER) |
| A2 The duration tensor can be exposed by the OutsideAudit.10 graph-edit approach (`remediation/F2-producer-probe/f2-producer__expose_dur.cjs`) on the pinned copy | P0-1 cannot start | P1 gate: the edited copy lists `durations` beside `waveform`; else repair (R2) |
| A3 `kokoro-js` 1.2.1 with `onnxruntime-node` runs offline in plain Node on this machine | No harness | P1's first harness run; failure is a harness repair, not an engine verdict |
| A4 Production-build smoke is feasible for owner gates (dev mode is slow, BUG-189) | Owner rows can't be judged | Owner rows use `npm run build` and the built app; if that fails, BLOCKER(USER) |
| A5 SETTINGS-WRITE-DURABLE-1 lands before P3 needs durable state | P3 stalls | Escalation trigger above; P1–P2 do not need it |

## Lessons applied — the project's own history, read before the run

| Lesson | Bears on | Applied as |
|--------|----------|------------|
| LL-142 — a timing label is a declaration, not evidence | D1, D4, Core provenance | Provenance recorded from the model's actual output; the producer proven by executing it against the hashed artefact |
| Standing rule 44 (LL-143) — dry-run every gate; name the shell; exact exit codes | Every D row | DoD preamble; every no-match gate shown to find hits on its base |
| LL-151 — prove a gate recorder can record a failure | D3, D4, D6 scripts | Every check script first run against a deliberate failure |
| Standing rule 43 (LL-138) — positive controls | D4, D5 | Negative controls and failing-first tests |
| LL-144 — resume base from the first commit's trailer | D13, Git constraint | Per-phase base trailer |
| LL-140 — hear the baseline before automating parity | D12 | Owner listening sign-off (G2) |
| Standing rule 45 (LL-141), LL-152 — owner-observed route; production-build smoke | D2, D7, D12 | Owner rows on a production build |
| LL-147 — owner-machine gates need a local session | All gates | Local sessions only |
| LL-149 — Done-when restates typecheck and build | D11 | Explicit row |
| LL-146 — evidence named like tests is a test | Constraints | Harness and evidence never named `*.test.*` |
| LL-148 — no file names the merge that lands it | D13 | Merge shas recorded after merges, in state.md and the close-out |
| LL-153 — the executor never writes the register | Constraints | Register writes stay with `/pointer-closeout` |
| LL-121 — normalize at the ingress, never alias in a runtime hook | D9 | Retire or keep `normalizeReaderModes` per G1's mode-id decision |
| LL-139, LL-150 — import census; deleted stylesheets' selectors | P4, D8 | Census before moving or deleting anything; selector census for any deleted CSS |
| Standing rule 38 — measure before perceptual rewrites (superseded for this item by "no fixed lag") | D3 | No hand-tuned lag constant; the cursor is the playback clock's sample |
| (staging, 2026-10-15) The word segmenter's ICU differs between plain Node and the app's Electron; a checker under plain Node numbers book words differently (S5's D2 started 7 words before "ancient") | D2, D14, D15 | Every checker runs under the app's Electron and refuses plain Node; D2 is checked by text |
