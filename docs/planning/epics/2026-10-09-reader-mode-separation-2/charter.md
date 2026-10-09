---
epic: reader-mode-separation-2
id: READER-MODE-SEPARATION-2
item: READER-MODE-SEPARATION-2
origin: roadmap — READER-MODE-SEPARATION-2
created: 2026-10-09
status: active
---

# Epic Charter — Separate Page, Focus, Flow, and Narrate runtimes

<!-- FROZEN after launch. Only the user amends this file; the executor treats it as the
     contract. If reality proves the contract wrong, that is a BLOCKER(USER), not an edit. -->

## Outcome

Page, Focus, Flow and Narrate each run on their own private state, lifecycle, timers, callbacks, rendering and styles behind matching public contracts. A thin router performs copy-only handoffs and rejects stale-owner work. The old shared reader behavior is unreachable in production. Every mode keeps its recorded baseline behavior, so changing one mode can no longer change another. With structural parity proven, Focus, Flow and Narrate also gain the owner-approved speed dialog.

The full specification is `ROADMAP.md` § READER-MODE-SEPARATION-2 (anchor `#reader-mode-separation-2`), including its three Mid-Dispatch Amendments (2026-09-23 speed dialog, 2026-09-23 Wave A admission re-slice, 2026-10-08 A1 recovery with manual fallback). This charter does not restate it. Where the two seem to differ, the specification governs and the difference is a BLOCKER(USER).

## Definition of Done — all rows must pass

Paths are relative to the run worktree `C:\Projects\Blurby\.worktrees\reader-mode-separation-2`. D2–D8 run on **one candidate commit**, recorded as `candidate` in `docs/planning/roadmap-reviews/reader-mode-separation-2/verification.json`.

| # | Condition | Verify by | Expected evidence |
|---|-----------|-----------|-------------------|
| D1 | **G0 admission passed.** The automated baseline (typecheck/test/build on the pinned base) and the complete four-mode live matrix (EPUB and non-EPUB, 12 transitions, 4 same-mode cases, heard-audio observation) are recorded against the separate archived baseline build | Read `baseline.json` and confirm `admission` = `PASS`. The live matrix comes from either A1–A3 (`admission/isolation.json` PASS, `admission/flow-reproduction.json`, matrix rows) or the manual route (`live-baseline-manual.json`: every scenario row has a result, an observer and a build hash). `ownership.json` and `dependencies.json` exist with exact paths | `admission: PASS`, observer named, zero pending rows; known defects carry their identifiers (cursor lead, 1.4x overlap) |
| D2 | **G1: dependency and ownership boundaries** | `npm test -- tests/readerModeBoundaries.test.ts tests/readerModeOwnership.test.ts` | exit 0. Tests "production mode graphs share only declared data and ports" and "every mutable resource has one active owner" pass |
| D3 | **G2: common contract in isolation, all four modes** | `npm test -- tests/readerModes/page.contract.test.ts tests/readerModes/focus.contract.test.ts tests/readerModes/flow.contract.test.ts tests/readerModes/narrate.contract.test.ts` | exit 0. Each file passes "select is paused and word zero is valid", "pause resume stop and destroy preserve their documented lifecycle" and "snapshots and start inputs do not leak mutable state" |
| D4 | **G3: routing and concurrency** | `npm test -- tests/readerModeIsolation.test.ts` | exit 0. 12 ordered pairs at words 7 and 0 plus a new generation; 4 same-mode no-ops; "rejected mode work cannot escape through a port" |
| D5 | **G4: per-mode behavior baseline** | `npm test -- tests/readerModes/page.behavior.test.tsx tests/readerModes/focus.behavior.test.tsx tests/readerModes/flow.behavior.test.tsx tests/readerModes/narrate.behavior.test.tsx` | exit 0, including "Flow works when audio access throws", "Narrate delayed extraction preserves exact word and mode", "Narrate pause resume reuses the current audio session" and "Narrate start failure stays local". `git diff <G0 baseline commit> -- <the fixture files>` shows no rebaselining |
| D6 | **G5: build and regression** | `npm run typecheck`; `npm test`; `npm run build`; `git diff --check` | all exit 0. The skipped count is ≤ the G0 baseline's (133 on 2026-09-23); `git diff --name-only <base>..candidate` ⊆ the `paths.json` manifest |
| D7 | **G6: live UI and audio on the fresh candidate build** | `node scripts/check_reader_mode_evidence.mjs --candidate <candidate> --evidence docs/planning/roadmap-reviews/reader-mode-separation-2` | exit 0. `live-qa.json` covers every G6 case on EPUB and non-EPUB, has zero stale effects, and records the owner's heard-audio observation (NOT VERIFIED blocks this row) |
| D8 | **Speed-dialog amendment** (after D2–D7 parity) | The speed tests the amendment's bounded task declares (for example `npm test -- <declared speed test paths>`), plus the `live-qa.json` → `speedDialog` section | exit 0. Exactly 89 Focus/Flow values (0.40x–4.80x, `x*250` WPM, 0.45x = 112.5); exactly 25 Narrate values (0.80x–2.00x); Page has no speed action; the dialog is keyboard-operable; the live observation is recorded |
| D9 | **The parent is complete on one candidate.** D2–D8 pass on the same SHA, and no legacy shared runtime path remains | `verification.json` names one `candidate` SHA; the D2–D8 outputs above were all produced in the claiming session on that SHA (`git rev-parse HEAD` = candidate) | One SHA, all rows' outputs pasted in state.md → Evidence |

Rules: the session claiming completion re-runs **every** row fresh and pastes the outputs into state.md → Evidence. Any row unverified ⇒ the epic is not done. Rows may be tightened by the user, never loosened by the executor. A row met vacuously (a check that passes because its surface was deleted) is recorded as unreachable, never as clean.

## Constraints — hard limits

- **Git, from `policy.git` (`push`; networkOperations `allow`, registered by GOV-HYGIENE-2026-10-09):** all work on the existing branch `eb/reader-mode-separation-2`, in the worktree `C:\Projects\Blurby\.worktrees\reader-mode-separation-2`. Its base is `1e5485c6`, carrying evidence commits up to `74883154`, plus one `--no-ff` merge of `main` (after GOV-HYGIENE) made by session 1. Stage exact paths only, never `git add .` or `-A`. Commit at every checkpoint. Push the run branch to `origin` after each checkpoint (owner grant). **Merge to `main` and push `main` only once, after `done.md`** (Rule 5b at epic level; no half-separated reader on `main`). Never force-push, rebase, reset, stash or clean. Divergence is a BLOCKER(USER). The recipe is in launch.md → GIT WORK.
- **No application-source edit before D1 (G0) passes.** A1–A3 and the manual route add only test-only harness, fixture and evidence files registered in `paths.json`.
- **Waves run serially:** A → B (Page + Focus) → C (Flow) → D (Narrate) → E (remove shared behavior, final gates) → speed amendment. A failed gate blocks its successors. Never launch a dependent wave in parallel (standing rule 37 / SRL-089).
- **Action ceiling:** at most 40 tool-use actions per implementation wave slice; admission slices A1-R 8, A2 20, A3 35. At a ceiling: save evidence and stop the slice (see Autonomy grants for the re-slice allowance).
- **Correction ceiling:** at most two focused correction attempts per gate failure.
- **This epic owns the shared-core freeze set for its duration:** `src/hooks/useNarration.ts`, `src/hooks/useFlowScrollSync.ts`, `src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`. It must not touch `main/cloud-*.js`, `main/*-sidecar.js`, `main/python-sidecar-adapter.js`, `main/cloud-retry.js` or `main/legacy-parsers.js`: parallel cleanup items own them.
- **Never write the live profile** `C:\Users\estra\AppData\Roaming\blurby\blurby-data\` (`library.json`, `settings.json`, `sync-queue.json`). Every app launch uses a fresh isolated profile, and those three files' SHA-256 are re-verified after each launch.
- Never delete or reuse the failed A1 profile `C:\Users\estra\AppData\Local\Temp\blurby-reader-mode-separation-2-a1-20260923214002764`.
- Never rebaseline a fixture, add a skip, or widen a fallback to make a gate pass.
- Budget: ~14 sessions. Deadline: `policy.roadmap.deadlines.mode-separation` (2026-11-30); read it from the policy.

## Non-goals — explicitly out of scope

- Narrate cursor lead, heard-word sync, reload catch-up, the 1.4x rate-overlap repair, and TTS latency or lag tuning (NARRATE-HEARD-CURSOR-1, NARRATE-APPLYRATECHANGE-COLLAPSE-1)
- Reducer or subscriber cleanup (NARRATE-SUBSCRIBER-CURSOR-1); Space-resumes-saved-mode (UX-POLISH-1); Page Space stays a no-op
- Consolidating the four mode implementations, or any shared behavior base (a later owner decision)
- Dormant engines, Chrome extension, content formats, storage-format migrations, new shortcuts
- Main-process cleanups (CLOUD-RETRY-SHARED-1, TTS-SIDECAR-SHARED-1, TTS-ENGINE-SHARED-1, CLEANUP-LEGACY-PARSERS-1)
- CLEANUP-MODE-BARREL-1 as its own item. If Wave E removes `src/modes/index.ts`, record that with evidence; do not do that item's structural-test work here.

## Autonomy grants — the executor decides alone (log each call in state.md → Decision log)

- Internal structure inside each mode's mirrored directory layout, and which helpers are copied per mode, within the Wave A census
- Names of test helpers and extra tests beyond the required names. Ordering of work within a wave
- Up to two focused correction attempts per gate failure
- Creating test-only harness, fixture and evidence files, each registered as an exact path in `paths.json`
- **Re-slicing at an action ceiling:** when a wave slice hits its ceiling with its gate unmet, the executor may define one bounded continuation slice (≤ 40 actions, stated exit criterion, logged), at most twice per wave. A third ceiling on the same wave is a BLOCKER(USER)
- `git worktree repair`, fetching, and pushing the run branch
- Monday register transitions for this item through the provider handshake (mutation-plan → connector → mutation-confirm): Queued → In Flight once D1 passes
- Writing `g0-manual-checklist.md` (and later G6 checklists) when the manual route triggers

## Escalation triggers — STOP and surface to the user

- Any action that is destructive, irreversible, or outward-facing beyond the grants above, including merging or pushing `main` before `done.md`
- A DoD row that appears unachievable as written, or an amendment that makes one unmeetable
- Reality contradicting this charter or the specification (source/branch/base identity differs from what the spec pinned; a required edit falls outside the existing-site table and manifest)
- **Owner gates (pause and keep working):** the manual G0 checklist; any heard-audio observation; G6 live QA; the speed-dialog live check. Write the BLOCKER(USER) with the exact checklist, then continue any work not gated behind it (contract/port types, census, tests). Waves B–E never start before D1 passes
- A1-R fails, or A2/A3 stop on harness or automation failure → **switch to the manual route** (spec amendment 2026-10-08): write `g0-manual-checklist.md`, then raise the owner-gate BLOCKER(USER). Never open another harness-repair slice
- Another mode's trace changes during a wave and its shared cause cannot be located within the correction ceiling
- A stale-owner callback still writes after two correction attempts
- An existing interface cannot represent fractional WPM (speed amendment)
- The live-profile hashes change after a launch
- The archived baseline build is missing and a rebuild from `1e5485c6` does not reproduce its recorded hashes
- Git divergence on the run branch, or `main` lacks the 2026-10-08 amendment at session 1
- The session budget is exhausted with DoD rows unmet

When triggered: write a BLOCKER(USER) in state.md with the exact question and what it unblocks, advance any unblocked front; if every front is blocked, append a final journal entry and stop cleanly.

## Assumptions — gaps accepted at launch

| Assumption | Risk if wrong | Guard |
|------------|---------------|-------|
| A1. GOV-HYGIENE-2026-10-09 has run: `main` carries the 2026-10-08 spec amendments and `policy.git` = push | The run executes a stale spec, or git rules disagree | Session 1: `git log main --oneline --grep "roadmap-review 2026-10-08"` and `git show main:ROADMAP.md \| Select-String "Mid-Dispatch Amendment — 2026-10-08"` must both hit; else BLOCKER(USER), no work |
| A2. The archived baseline build at `C:\Users\estra\AppData\Local\Temp\blurby-separation2-baseline-build-20260923T212830157Z` survives (it sits in `%TEMP%`) | No independent baseline for G0/G6 comparison | P1: re-verify the 21 files against `admission/baseline-build.json` (SHA-256 and size). If it's missing, rebuild from `1e5485c6` in a scratch worktree and compare hashes; a mismatch is an escalation |
| A3. `git worktree repair` relinks the worktree (its gitdir still points to the repo's old path `C:\Users\estra\Projects\Blurby`) | The run cannot use its evidence-bearing worktree | P1 step 1; on failure, BLOCKER(USER). Never delete the directory |
| A4. Uncommitted files in the run worktree are evidence from 2026-09-23 (seen: `baseline-narrate-loopback.wav`, not in any commit) | Evidence lost, or the wrong files committed | P1: list them before any write. Register a file in `paths.json` and commit it only if Issue `-2` or `baseline.json` references it; otherwise leave it and journal it |
| A5. The host permission mode lets an unattended session run npm, electron, git push and the monday connector without prompts | The run stalls at hour two on an approval prompt | Launch preflight row; the owner confirms the mode before walking away. The first stalled prompt is journaled by the next session |
| A6. The headphone loopback (Realtek USB2.0 Audio, 48 kHz WASAPI) is still the capture device | Captured output unusable | Heard-audio claims always need the owner observation anyway (SRL-070); capture is supporting evidence only |
| A7. The lessons parser reads `LESSONS_LEARNED.md` after GOV-HYGIENE | Lessons applied silently | P1: `lessons --open` count > 0; re-read the live lessons against this charter and journal any new bearing |

## Lessons applied — the project's own history, read before the run

`lessons --open` returned 0 at scaffold (parser format gap). GOV-HYGIENE-2026-10-09 fixed it (92 live lessons, `6c8c747f`), after this table was drafted. P1 re-reads the live lessons (A7) and journals any new bearing. The lessons below were read directly from `docs/governance/LESSONS_LEARNED.md` and the standing rules.

| Lesson | Bears on | Applied as |
|--------|----------|------------|
| LL-108 (exact-zero anchors) | D3/D5, handoffs at word 0 | G2/G3/G4 word-0 cases are DoD rows, not optional |
| LL-109 (stop() race in async strategies) | D4 stale-owner rejection | Constraint: invalidate before cancel; the trigger fires if a stale callback still writes after two corrections |
| LL-112 (isolate before sharing) | Non-goal "no shared behavior base" | Mirrored, independent implementations; consolidation is out of scope |
| LL-120, LL-121, LL-125 (single ownership; Narrate stays audio-owned) | D2, Wave D | Ownership manifest required at G0; Narrate never imports Flow's runtime |
| LL-124, LL-126, LL-127 + SRL-070 (heard-audio ground truth; no instrumented signal sits on the heard word) | D1, D7 | Audio claims need the owner observation; scheduler signals never pass a gate; no lag tuning (non-goal) |
| SRL-053/055/058 (live screen QA per mode) | D1, D7 | G0 and G6 are owner gates, recorded per mode |
| SRL-089 / standing rule 37 (serialize dependent work) | Constraints | Waves strictly serial; the parallel cleanup items are file-disjoint |
| Candidate (unrecorded, 2026-10-08): brittle GUI automation of Electron admission | Escalation trigger | Manual route after one recovery attempt; record at close-out if it holds |
