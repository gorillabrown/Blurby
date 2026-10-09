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
     contract. If reality proves the contract wrong, that is a BLOCKER(USER), not an edit.
     Pre-launch amendment 2026-10-09 (owner-approved, after adversarial review) is folded in. -->

## Outcome

Page, Focus, Flow and Narrate each run on their own private state, lifecycle, timers, callbacks, rendering and styles behind matching public contracts. A thin router performs copy-only handoffs and rejects stale-owner work. The old shared reader behavior is unreachable in production. Every mode keeps its recorded baseline behavior, so changing one mode can no longer change another. With structural parity proven, Focus, Flow and Narrate also gain the owner-approved speed dialog.

The full specification is `ROADMAP.md` § READER-MODE-SEPARATION-2 (anchor `#reader-mode-separation-2`) with its four Mid-Dispatch Amendments: 2026-09-23 speed dialog, 2026-09-23 Wave A admission re-slice, 2026-10-08 A1 recovery with manual fallback, and 2026-10-09 pre-launch execution contract. This charter does not restate it. Where the two seem to differ, the specification governs and the difference is a BLOCKER(USER). The identity reading in *Named identities* below is the 2026-10-09 amendment's own wording, not a difference.

## Named identities (2026-10-09 amendment, item 3)

| Name | What it is | Recorded in |
|---|---|---|
| **B0** | The G0 baseline: rebuilt build of pinned `1e5485c6` (source tree `0c790075…`), at `C:\Projects\Blurby-artifacts\rms2-baseline-build\`. Immutable once recorded | `admission/baseline-build-rebuild.json`; the original `admission/baseline-build.json` stays unchanged |
| **I** | The integration base: the session-1 `--no-ff` merge of `origin/main` into the run branch | state.md → Working set; `verification.json` |
| **S** | The structural candidate: the commit where G1–G6 first pass before the speed dialog. Its evidence is preserved separately | `verification.json` → `structuralCandidate` |
| **F** | The final candidate: after the speed dialog. Every DoD row from D2 to D8 runs on F | `verification.json` → `candidate` |

## Definition of Done — all rows must pass

Paths are relative to the run worktree `C:\Projects\Blurby\.worktrees\reader-mode-separation-2`. The evidence directory `E` is `docs/planning/roadmap-reviews/reader-mode-separation-2`.

| # | Condition | Verify by | Expected evidence |
|---|-----------|-----------|-------------------|
| D1 | **G0 admission passed against B0.** B0 was rebuilt under the rebuild policy (production inputs and lockfile match `1e5485c6`; toolchain and dependency versions recorded). Fresh typecheck/test/build pass. The complete four-mode live matrix (EPUB and non-EPUB, 12 transitions, 4 same-mode cases, heard-audio observation) is recorded against B0 | `E/baseline.json` → `admission` = `PASS`; `E/admission/baseline-build-rebuild.json` lists hashes plus mismatches vs the original manifest; the live matrix is either `E/admission/isolation.json` PASS + `flow-reproduction.json` + matrix rows, or `E/live-baseline-manual.json` with every row filled; `E/ownership.json` and `E/dependencies.json` exist with exact paths | `admission: PASS`, observer named, zero pending rows; known defects carry their identifiers (cursor lead, 1.4x overlap); any hash mismatch listed and explained |
| D2 | **G1: dependency and ownership boundaries (on F)** | `npm test -- tests/readerModeBoundaries.test.ts tests/readerModeOwnership.test.ts` | exit 0. Tests "production mode graphs share only declared data and ports" and "every mutable resource has one active owner" pass |
| D3 | **G2: common contract in isolation, all four modes (on F)** | `npm test -- tests/readerModes/page.contract.test.ts tests/readerModes/focus.contract.test.ts tests/readerModes/flow.contract.test.ts tests/readerModes/narrate.contract.test.ts` | exit 0. Each file passes "select is paused and word zero is valid", "pause resume stop and destroy preserve their documented lifecycle" and "snapshots and start inputs do not leak mutable state" |
| D4 | **G3: routing and concurrency (on F)** | `npm test -- tests/readerModeIsolation.test.ts` | exit 0. 12 ordered pairs at words 7 and 0 plus a new generation; 4 same-mode no-ops; "rejected mode work cannot escape through a port" |
| D5 | **G4: per-mode behavior baseline (on F)** | `npm test -- tests/readerModes/page.behavior.test.tsx tests/readerModes/focus.behavior.test.tsx tests/readerModes/flow.behavior.test.tsx tests/readerModes/narrate.behavior.test.tsx` | exit 0, including the four named Narrate/Flow tests. `git diff <commit that first added each fixture> F -- <fixture files>` shows no rebaselining |
| D6 | **G5: build and regression (on F)** | `npm run typecheck`; `npm test`; `npm run build`; `git diff --check I F` | all exit 0. Skipped count ≤ B0's fresh G0 run; `git diff --name-only I F` ⊆ `E/paths.json` (which registers this packet's files and `verified.md`) |
| D7 | **G6: live UI and audio on a fresh build of F** | `node scripts/check_reader_mode_evidence.mjs --candidate <F> --evidence docs/planning/roadmap-reviews/reader-mode-separation-2` | exit 0. `live-qa.json` covers every G6 case on EPUB and non-EPUB vs B0, has zero stale effects, and records the owner's heard-audio observation (NOT VERIFIED blocks this row) |
| D8 | **Speed-dialog amendment (on F, after S)** | The speed tests the amendment's bounded task declares (`npm test -- <declared speed test paths>`), plus `live-qa.json` → `speedDialog` | exit 0. Exactly 89 Focus/Flow values (0.40x–4.80x, `x*250` WPM, 0.45x = 112.5); exactly 25 Narrate values (0.80x–2.00x); Page has no speed action; the dialog is keyboard-operable; the live observation is recorded |
| D9 | **Identities consistent and evidence complete** | `E/verification.json` names B0, I, S and F, and S's G1–G6 evidence is preserved. In the claiming session: `git rev-parse HEAD` = F; the D2–D8 outputs were produced on F; the B0 archive re-hashes to `baseline-build-rebuild.json` | One F, outputs pasted in state.md → Evidence; B0 re-hash clean |

Rules: the session claiming verification re-runs **every** row fresh and pastes the outputs into state.md → Evidence. Any row unverified ⇒ not verified. Rows may be tightened by the user, never loosened by the executor. A row met vacuously (a check that passes because its surface was deleted) is recorded as unreachable, never as clean.

## Constraints — hard limits

- **Authoritative packet.** After the session-1 bootstrap, the authoritative packet is `C:\Projects\Blurby\.worktrees\reader-mode-separation-2\docs\planning\epics\2026-10-09-reader-mode-separation-2`. Read and write `plan.md`, `state.md`, `journal.md`, `verified.md` and `done.md` only there. The primary checkout's copy is a frozen launch snapshot; never update it.
- **Git, from `policy.git` (`push`, networkOperations `allow`):** all work on the existing branch `eb/reader-mode-separation-2`, in its worktree. Base `1e5485c6`, evidence commits to `74883154`, then integration base **I**. Stage exact paths only (`E/paths.json` entries and this packet's files), never `git add .` or `-A`; never stage `tests/perf-baseline-results.json`, which `npm test` regenerates. Commit at every checkpoint and push the run branch to `origin`. **`main` changes only during finalization (launch.md stages F2–F4), in a clean integration worktree, never the dirty primary checkout.** Never force-push, rebase, reset, stash or clean. Divergence is a BLOCKER(USER). Write branch refs fully (`refs/heads/main`, `refs/remotes/origin/main`): the repo root has a `main/` directory.
- **Pre-G0 write scope:** before D1 passes, nothing under `src/` changes, including contract types and the port broker. Allowed: census, evidence, fixtures, and the test-only harness under `E/`. Contract/port types and `createReaderPorts.ts` start Wave B.
- **Waves run serially:** A → B (contract/ports, Page, Focus) → C (Flow) → D (Narrate) → E (remove shared behavior; record S) → speed amendment (→ F). A failed gate blocks its successors (standing rule 37 / SRL-089).
- **Budgets:** admission slices A1-R ≤ 8, A2 ≤ 20, A3 ≤ 35 parent tool calls. Exhausting one switches to the manual-G0 route (no continuation). Implementation waves have **no action ceiling** (2026-10-09 amendment). At most two focused correction attempts per gate failure.
- **This epic owns the shared-core freeze set for its duration:** `src/hooks/useNarration.ts`, `src/hooks/useFlowScrollSync.ts`, `src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`. It must not touch `main/cloud-*.js`, `main/*-sidecar.js`, `main/python-sidecar-adapter.js`, `main/cloud-retry.js` or `main/legacy-parsers.js`: parallel cleanup items own them.
- **Never write the live profile** `C:\Users\estra\AppData\Roaming\blurby\blurby-data\` (`library.json`, `settings.json`, `sync-queue.json`). Every app launch uses a fresh isolated profile; re-verify those three SHA-256 values after each launch.
- Never delete or reuse the failed A1 profile `C:\Users\estra\AppData\Local\Temp\blurby-reader-mode-separation-2-a1-20260923214002764`. Never modify `admission/baseline-build.json`.
- Never rebaseline a fixture, add a skip, or widen a fallback to make a gate pass.
- Budget: ~14 sessions. Deadline: `policy.roadmap.deadlines.mode-separation` (2026-11-30); read it from the policy.

## Non-goals — explicitly out of scope

- Narrate cursor lead, heard-word sync, reload catch-up, the 1.4x rate-overlap repair, and TTS latency or lag tuning (NARRATE-HEARD-CURSOR-1, NARRATE-APPLYRATECHANGE-COLLAPSE-1)
- Reducer or subscriber cleanup (NARRATE-SUBSCRIBER-CURSOR-1); Space-resumes-saved-mode (UX-POLISH-1); Page Space stays a no-op
- Consolidating the four mode implementations, or any shared behavior base (a later owner decision)
- Dormant engines, Chrome extension, content formats, storage-format migrations, new shortcuts
- Main-process cleanups (CLOUD-RETRY-SHARED-1, TTS-SIDECAR-SHARED-1, TTS-ENGINE-SHARED-1, CLEANUP-LEGACY-PARSERS-1)
- CLEANUP-MODE-BARREL-1 as its own item. If Wave E removes `src/modes/index.ts`, record that with evidence; do not do that item's structural-test work here.
- `/pointer-closeout` and the monday completion. Those are the owner's step after `done.md`.

## Autonomy grants — the executor decides alone (log each call in state.md → Decision log)

- Internal structure inside each mode's mirrored directory layout, and which helpers are copied per mode, within the Wave A census
- Names of test helpers and extra tests beyond the required names. Ordering of work within a wave
- Up to two focused correction attempts per gate failure
- Creating test-only harness, fixture and evidence files under `E/`, each registered as an exact path in `E/paths.json`. Updating the harness path guards and baseline manifest checks in `admission/isolated-launch.cjs` and `admission/capture.mjs` to the current worktree and B0, while preserving their pinned-source checks
- Rebuilding B0 under the rebuild policy, including a clean temporary checkout of `1e5485c6` for the build
- `git worktree repair`, fetching, pushing the run branch, and the finalization stages F2–F4 exactly as launch.md defines them
- The Monday transition Queued → In Flight once D1 passes, through the provider handshake (mutation-plan → connector → mutation-confirm). Call `mutation-plan` only to execute a mutation (LL-130)
- Writing `g0-manual-checklist.md` (and later G6 or speed-check checklists) when the manual route or an owner gate triggers

## Escalation triggers — STOP and surface to the user

- Any action that is destructive, irreversible, or outward-facing beyond the grants above
- A DoD row that appears unachievable as written, or an amendment that makes one unmeetable
- Reality contradicting this charter or the specification: pinned source or branch identity differs; a required edit falls outside the existing-site table and manifest
- **Owner gates (pause and keep working):** the manual G0 checklist; any heard-audio observation; G6 live QA; the speed-dialog live check. Write the BLOCKER(USER) with the exact checklist, then continue work not gated behind it. Before D1, that means census, evidence and the test-only harness only; never `src/`
- A1-R fails, any admission slice exhausts its budget, or A2/A3 stop on harness or automation failure → **switch to the manual route**: write `g0-manual-checklist.md`, then raise the owner-gate BLOCKER(USER). Never open another harness-repair slice
- **B0 rebuild:** a source or input identity difference vs `1e5485c6`, a failed validation, or an unexplained behavioral difference. A hash mismatch alone is not a trigger: list it and continue
- Another mode's trace changes during a wave and its shared cause cannot be located within the correction ceiling
- A stale-owner callback still writes after two correction attempts
- An existing interface cannot represent fractional WPM (speed amendment)
- The live-profile hashes change after a launch
- Git divergence on the run branch; a merge conflict at bootstrap or integration; `refs/heads/main` lacks the 2026-10-09 amendment at session 1
- The session budget is exhausted with DoD rows unmet

When triggered: write a BLOCKER(USER) in state.md with the exact question and what it unblocks, advance any unblocked front; if every front is blocked, append a final journal entry and stop cleanly.

## Assumptions — gaps accepted at launch

| Assumption | Risk if wrong | Guard |
|------------|---------------|-------|
| A1. `main` carries the 2026-10-09 amendment and `policy.git` = push | The run executes a stale spec | Bootstrap: `git show refs/heads/main:ROADMAP.md \| Select-String "Mid-Dispatch Amendment — 2026-10-09"` must hit; else BLOCKER(USER), no work |
| A2. B0 can be rebuilt from `1e5485c6` (the 2026-09-23 archive in `%TEMP%` lost all 21 files) | No baseline for G0/G6 | P1 rebuild under the policy; an identity difference or failed validation → escalation |
| A3. `git worktree repair` relinks the run worktree (its gitdir points to the old repo path `C:\Users\estra\Projects\Blurby`) | The run can't use its evidence-bearing worktree | Bootstrap step; on failure, BLOCKER(USER). Never delete the directory |
| A4. Uncommitted files in the run worktree are 2026-09-23 evidence (seen: `baseline-narrate-loopback.wav`, in no commit) | Evidence lost, or wrong files committed | Bootstrap lists them before any write. Register and commit a file only if Issue `-2` or `baseline.json` references it; otherwise leave it and journal it |
| A5. The host permission mode lets an unattended session run npm, electron, git push and the monday connector without prompts | The run stalls on an approval prompt | Launch Q2; a stall shows up as a journal gap |
| A6. The headphone loopback (Realtek USB2.0 Audio, 48 kHz WASAPI) is still the capture device | Captured output unusable | Heard-audio claims need the owner observation anyway (SRL-070); capture is supporting evidence |
| A7. The harness path guards (`isolated-launch.cjs:6`, `capture.mjs:14`) still name `C:/Users/estra/Projects/Blurby/...` | A1-R rejects its own worktree and burns its budget | P1 updates both guards (test-only) **before** A1-R starts; verify with a dry guard check |

## Lessons applied — the project's own history, read before the run

Read from `docs/governance/LESSONS_LEARNED.md` on 2026-10-09 (parseable since GOV-HYGIENE; `lessons --open` lists the live set). P1 re-reads it and journals any new bearing.

| Lesson | Bears on | Applied as |
|--------|----------|------------|
| LL-108 (exact-zero anchors) | D3/D5, handoffs at word 0 | G2/G3/G4 word-0 cases are DoD rows, not optional |
| LL-109 (stop() race in async strategies) | D4 stale-owner rejection | Constraint: invalidate before cancel; the trigger fires if a stale callback still writes after two corrections |
| LL-112 (isolate before sharing) | Non-goal "no shared behavior base" | Mirrored, independent implementations; consolidation out of scope |
| LL-120, LL-121, LL-125 (single ownership; Narrate stays audio-owned) | D2, Wave D | Ownership manifest at G0; Narrate never imports Flow's runtime |
| LL-124, LL-126, LL-127 + SRL-070 (heard-audio ground truth) | D1, D7 | Audio claims need the owner observation; scheduler signals never pass a gate; no lag tuning |
| LL-130 (mutation-plan opens a recovery record) | Monday In Flight transition | Grant: call `mutation-plan` only to execute; confirm every plan |
| SRL-053/055/058 (live screen QA per mode) | D1, D7 | G0 and G6 are owner gates, recorded per mode |
| SRL-089 / standing rule 37 (serialize dependent work) | Constraints | Waves strictly serial; the parallel cleanups are file-disjoint |
| LL-129 (census label variants before bulk doc transforms) | — | Considered; does not apply (the run rewrites no hand-written governance docs) |
| Candidate (unrecorded): brittle GUI automation of Electron admission | Escalation trigger | Manual route after one recovery attempt; record at close-out if it holds |
