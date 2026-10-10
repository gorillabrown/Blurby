---
sprint: EPIC-MAIN-PROCESS-CLEANUP
items: [CLOUD-RETRY-SHARED-1, TTS-SIDECAR-SHARED-1, CLEANUP-LEGACY-PARSERS-1]
date: 2026-10-10
runtime: one session (S1–S1c), about 1 hour by the journal clock; budget ~3 sessions
status: all-pass
---

# Pointer Close-Out: EPIC-MAIN-PROCESS-CLEANUP

Origin: epic packet — `docs/planning/epics/2026-10-09-main-process-cleanup` (EPIC-MAIN-PROCESS-CLEANUP: CLOUD-RETRY-SHARED-1, TTS-SIDECAR-SHARED-1, CLEANUP-LEGACY-PARSERS-1).

## Sprint Brief

**Goal:** Remove the main process's duplicated cloud-retry and Python-sidecar code and its dead legacy parser module, without changing behavior.
**Result:**
- **Cloud retry:** one `withRetry` in `main/cloud-retry.js`, with thin provider wrappers (merge `dd3db29c`).
- **Sidecar adapter:** one `main/python-sidecar-adapter.js`; `main/moss-nano-sidecar.js` and `main/pocket-tts-sidecar.js` went from about 400 lines each to about 30 (merge `7a462bf7`).
- **Legacy parsers:** `main/legacy-parsers.js` deleted and two doc lines corrected (merge `b95dbb55`).

The packet was published at `aafed6c4`.
**Learned:** LL-131 — a dead-code census matches references, not identifiers. LL-132 — child-process test fakes must exit asynchronously. LL-133 — epic completion steps must not contradict "never touch charter.md". LL-134 — unattended-epic session budgets are overestimated.
**Recommend:** Run a roadmap review next. No queued item now has a full specification, and TTS-ENGINE-SHARED-1 is unblocked and needs one.
**Bottom line:** The duplication and the dead code are gone. Behavior is pinned by 30 new tests, and no existing test was edited.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Integrated tree (DINT) on `b95dbb55`, fresh worktree | `npm ci` / typecheck / `npm test` / build exit codes | 0/0/0/0 | 0/0/0/0 (raw log `C:\Projects\Blurby-artifacts\epic-main-process-cleanup\dint-1.log`) | Pass | — | — |
| 2 | Full suite population | passed / skipped / failed | no failures, no new skips | 3,088 / 133 / 0 (212 files pass, 1 skipped) | Pass | +30 passed vs baseline 3,058; skips unchanged at 133 | — |
| 3 | Combined targeted item suites (13 files) | tests | all pass | 162 / 162 | Pass | — | — |
| 4 | C1: duplicated retry literal | `status === 429` in google / onedrive / cloud-retry | 0 / 0 / 1 | 0 / 0 / 1 (re-checked on `origin/main` at close-out) | Pass | — | — |
| 5 | S1: duplicated sidecar helpers | `writeCommand`/`handleStdout`/`settlePending` in moss / pocket / shared | 0 / 0 / 3 | 0 / 0 / 3 (re-checked) | Pass | — | — |
| 6 | L1: legacy module and references | file present; case-sensitive `legacy-parsers` in code/config/governing docs | absent; none | absent; none (re-checked) | Pass | — | — |
| 7 | Existing tests untouched | diff on `tests/cloudGoogle`, `cloudOnedrive`, `mossNanoEngine`, `pocketTtsEngine` | empty | empty since `ef1d233b` | Pass | — | — |
| 8 | Scope | `git diff --name-only ef1d233b aafed6c4` | the 11 spec-staged paths + packet files | exactly 11 + 4 packet files | Pass | — | — |
| 9 | Merge order and ancestry | first-parent merges; item commits in `origin/main` | 1 → 2 → 3 | `dd3db29c` → `7a462bf7` → `b95dbb55` → `aafed6c4`; `f3abb524`, `65cb5774`, `18f453fa`, `91e48416` all ancestors | Pass | — | — |
| 10 | Legacy re-census stop rule (Decision #7) | non-doc hits | 0, else stop | 2 data files containing the item's own ID; executor proceeded | Deviation, owner-ratified | — | Low |
| 11 | Pocket fake fidelity (Decision #6) | start-timeout reason with the existing sync-exit fake | `sidecar-start-timeout` | `sidecar-exited` under the sync fake (test artefact; production unaffected) | Finding | — | Low |
| 12 | KF-1 flake (`tests/qwenStreaming.test.js`) | occurrences | — | 0 in every run | Pass | — | — |
| 13 | Register custody | Monday In Flight transitions confirmed; recovery outstanding | 3 confirmed; 0 outstanding | 3; 0 | Pass | — | — |

**Populations:** passed: 3,088 tests (212 files). Skipped: 133 tests (1 file), the same as the baseline, and not described as passed. Failed: none. Excluded under authority: none. Unchanged: every pre-existing test file.

## Interpretation

The three items were file-disjoint and ran in the register sequence, each merged as soon as its rows passed (Rule 5b). Decision #6 is the characterization-first approach (LL-112) paying off: writing the new suite against unmodified code exposed that the existing Pocket fake exits synchronously on `kill()`, which no real process does. Decision #7 is a spec defect, not an execution defect. The census pattern `legacy-parsers` also matches the item's own identifier `cleanup-legacy-parsers-1` inside register and report data that the 2026-10-08 governance work introduced after the census was written.

## Proposed Dispositions

- Findings 1–9, 12 and 13: accepted.
- Finding 10 (Decision #7): **ratified by the owner 2026-10-10.** No require, import, path or build reference exists (verified on `origin/main`). LL-131 corrects the pattern for future specifications.
- Finding 11 (Decision #6): accepted as a test-harness finding. The TTS-ENGINE-SHARED-1 stub now carries "use an async-exit fake (LL-132)".

## Mid-Dispatch Decisions

Recorded in the packet's state.md → Decision log (no issue files were raised; no `Issue.<ITEM-ID>.*` exists for these items):

- **#6 (2026-10-09), sidecar Task 1 fake.** Decision: `kill()` emits `exit` on a microtask. Rationale: a real ChildProcess exits asynchronously; the synchronous fake yields `sidecar-exited` on start timeout (verified, 2 failures). Authority: grant, test-helper structure.
- **#7 (2026-10-09), legacy re-census.** Decision: the hits in `Virtuoso/work-register.snapshot.json` (3) and `Virtuoso/reports/planning-cockpit.html` (1) were classed as doc references and the item proceeded. Rationale: they match only the item's ID and description; no code, test or build reference. **Owner ruling 2026-10-10: ratified.**
- **Charter status.** The packet's launch.md completion step asked to set `status: complete`, while the kickoff said never touch charter.md. The run left the charter unedited. **Owner ruling 2026-10-10:** set it to `complete` as an owner edit in this close-out commit.

## Lessons

- **New:** LL-131 — A dead-code census must match references, not identifiers
- **New:** LL-132 — Child-process test fakes must emit exit asynchronously after kill()
- **New:** LL-133 — Epic completion steps that edit charter.md must be carved out of the kickoff's prohibition
- **New:** LL-134 — Session budgets for unattended epics are overestimated
- **Applied:** LL-095 — held: exactly one `forceRefresh: true` per provider wrapper; new test asserts one refresh per 401.
- **Applied:** LL-112 — held: the characterization suite (20 cases) ran green on unmodified code before extraction and caught the fake-fidelity defect (Decision #6).
- **Applied:** LL-088 — held: one implementer per item, strict order, sidecar Task 1 committed before Task 2.
- **Applied:** LL-130 — held: three Monday transitions, each planned to execute and confirmed; zero outstanding recovery.
- **Considered, not applicable:** LL-129, LL-031 (no doc transform, no stale-async logic).

## Files Created

- **Removed (temporary):** none. The guard flagged `docs/planning/epics/2026-10-09-main-process-cleanup/done.md` as temporary, a false positive: it is the epic's required completion record and stays.
- **Committed:** 15 paths across the run (11 spec-staged, 4 packet files), all on `origin/main`.
- **Ignored:** none.
- **Left for a decision:** the three Monday recovery receipts (`Virtuoso/.recovery/20261010T0337…`, `…0341…`, `…0345…`), all closed, were moved from the packet worktree into the primary checkout's `Virtuoso/.recovery/`, where the project keeps its other receipts (untracked by convention). The run's worktrees (`cloud-retry-shared-1`, `tts-sidecar-shared-1`, `cleanup-legacy-parsers-1`, `mpc-integ-*-1`, `mpc-dint-1`, `mpc-publish-1`, `epic-main-process-cleanup`, `epic-mpc-scaffold`) and `eb/mpc-*` branches are left for housekeeping (maintenance, never automatic).
- **Guard:** `created-files --base ef1d233b` exit 1, naming exactly the false positive and the three receipts above.

## Governance Updates

- `LESSONS_LEARNED.md`: LL-131 to LL-134 appended.
- `ROADMAP.md`: three Completed Work Summary rows. The three full specs are collapsed to a pointer to `git show aafed6c4:ROADMAP.md` (no archive role is registered). Stage 4 intro and queue header updated; the TTS-ENGINE-SHARED-1 stub marked prerequisite-met with the LL-132 note.
- `CLAUDE.md`: queue bullets updated.
- `docs/governance/TECHNICAL_REFERENCE.md`: cloud retry and the sidecar adapter named as shared modules.
- `docs/governance/terminal-ledger.jsonl`: three records, in charter order.
- `docs/governance/bug-reports/Issue.CLEANUP-BACKLOG.2026-09-23.md`: status update appended (three of five items closed).
- Epic charter: `status: complete` (owner edit, by instruction).

## Roadmap & Queue Movement

- **Retired:** CLOUD-RETRY-SHARED-1, TTS-SIDECAR-SHARED-1, CLEANUP-LEGACY-PARSERS-1 → Completed (Monday), Seq 6/7/9 cleared.
- **Elevated:** TTS-ENGINE-SHARED-1 (Seq 8) Blocked → Queued as a stub, its prerequisite now met; it needs a specification. The head of the belt stays READER-MODE-SEPARATION-2 (Seq 1, In Flight, epic run paused at its owner gate OS-1).

## Next Work Pointer

Run `/roadmap-review`. No queued item carries a full specification, which is the CLAUDE.md Rule 5a stop signal; TTS-ENGINE-SHARED-1 is ready to specify (characterization first, LL-112; async-exit fake, LL-132). READER-MODE-SEPARATION-2 continues independently after the owner's OS-1 session.

## Gates

No audit or release gate is triggered by this close-out: it is the 2nd and 3rd main-process item since the last audit, and no phase boundary is crossed.

## Git Hand-Off

- [x] Persisted per `policy.git` (push): branch `eb/closeout-epic-main-process-cleanup`, merged to `main` with `--no-ff` from a clean worktree and pushed (no git-handoff needed).
