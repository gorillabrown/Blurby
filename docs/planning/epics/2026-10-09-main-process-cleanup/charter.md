---
epic: main-process-cleanup
id: EPIC-MAIN-PROCESS-CLEANUP
items: [CLOUD-RETRY-SHARED-1, TTS-SIDECAR-SHARED-1, CLEANUP-LEGACY-PARSERS-1]
origin: roadmap — CLOUD-RETRY-SHARED-1, TTS-SIDECAR-SHARED-1, CLEANUP-LEGACY-PARSERS-1
created: 2026-10-09
status: active
---

# Epic Charter — Main-process cleanup (cloud retry, sidecar adapter, legacy parsers)

<!-- FROZEN after launch. Only the user amends this file; the executor treats it as the
     contract. If reality proves the contract wrong, that is a BLOCKER(USER), not an edit. -->

## Outcome

The Electron main process carries one cloud `withRetry` (in `main/cloud-retry.js`) and one Python sidecar adapter (in `main/python-sidecar-adapter.js`) instead of duplicated copies, and no dead `main/legacy-parsers.js`. Behavior is unchanged: every existing test passes unmodified, and the characterization suites pin the shared behavior. Each item is merged to `main` and pushed as soon as it passes (Rule 5b).

The three specifications are `ROADMAP.md` § CLOUD-RETRY-SHARED-1, § TTS-SIDECAR-SHARED-1 and § CLEANUP-LEGACY-PARSERS-1 (inline Full Specs, reviewed 2026-10-08). The charter does not restate them; the specs govern.

| # | Item | Lane | Runs after | Because |
|---|------|------|------------|---------|
| 1 | Share cloud retry handling with provider token refresh (CLOUD-RETRY-SHARED-1) | Platform & Maintenance | — | first in register sequence (6) |
| 2 | Share the MOSS/Pocket sidecar adapter (TTS-SIDECAR-SHARED-1) | TTS / Narration Engine | CLOUD-RETRY-SHARED-1 | register sequence (7) only. `combine` reported a shared file, `tests/perf-baseline-results.json`, but every spec names it only as "never stage". The items are file-disjoint, so this ordering is convenience, not dependency |
| 3 | Remove the unused legacy parser module (CLEANUP-LEGACY-PARSERS-1) | Library & Content | TTS-SIDECAR-SHARED-1 | register sequence (9) only; same note |

## Definition of Done — all rows must pass

Each item row is verified on that item's branch before its merge (fresh, in the claiming session). **DINT** is verified on `origin/main` after the last merge. The specs write `git diff main …` with a bare `main`; this repo has a `main/` directory, so always use `refs/remotes/origin/main` (a ref correction, not a criterion change).

| # | Condition | Verify by | Expected evidence |
|---|-----------|-----------|-------------------|
| C1 | CLOUD-RETRY-SHARED-1 — *Done when* 1–6 of its spec | the spec's six commands, with `main` written as `refs/remotes/origin/main` at the item's branch point | 7 new tests pass; both existing cloud test files byte-unchanged; `status === 429` count 0/0/1; one `forceRefresh: true` per provider; `npm test` exit 0; diff = exactly the 4 staged paths |
| C2 | CLOUD-RETRY-SHARED-1 merged | `git merge-base --is-ancestor <C1 commit> refs/remotes/origin/main` | exit 0, after a `--no-ff` merge pushed from a clean integration worktree |
| S1 | TTS-SIDECAR-SHARED-1 — *Done when* 1–7 of its spec | the spec's seven commands (Task 1 commit, then Task 2 commit) | 11 characterization tests pass on unmodified code (Task 1) and unchanged after extraction (Task 2); IPC/package suites pass; helper counts 0/0/3; export check exits 0; `npm test` exit 0; diff = the 4 paths across 2 commits |
| S2 | TTS-SIDECAR-SHARED-1 merged | `git merge-base --is-ancestor <Task 2 commit> refs/remotes/origin/main` | exit 0 |
| L1 | CLEANUP-LEGACY-PARSERS-1 — *Done when* 1–6 of its spec | the spec's six commands (case-sensitive `git grep`) | file absent; no `legacy-parsers` reference in the named paths; parser suites, `npm test` and `npm run build` exit 0; diff = the 3 staged paths |
| L2 | CLEANUP-LEGACY-PARSERS-1 merged | `git merge-base --is-ancestor <L1 commit> refs/remotes/origin/main` | exit 0 |
| DINT | All three hold together on the published tree | In a fresh worktree at `refs/remotes/origin/main` (after L2): `npm ci`, `npm run typecheck`, `npm test`, `npm run build`; then each item's targeted test command again: `npm test -- tests/cloudRetry.test.js tests/cloudGoogle.test.js tests/cloudOnedrive.test.js tests/pythonSidecarAdapter.test.js tests/mossNanoEngine.test.js tests/pocketTtsEngine.test.js tests/mossNanoIpc.test.js tests/pocketTtsIpc.test.js tests/packageReleaseTruth.test.js tests/epub-fidelity.test.js tests/epub-converter.test.js tests/epub-2b-pipeline.test.js tests/epubWordExtractor.test.js` | all exit 0, on one SHA, recorded in state.md → Evidence |

Rules: a row is verified with fresh output in the claiming session and pasted (distilled) into state.md → Evidence. Rows may be tightened by the user, never loosened by the executor. A vacuous pass, where a check passes because its surface was deleted, is recorded as unreachable, never as clean. `npm test` must exit 0. If it exits non-zero only through the known flake KF-1 (`tests/qwenStreaming.test.js` unhandled `stream-timeout`, 0 failed tests), re-run at most twice. If it still fails, that is a BLOCKER(USER), not a pass.

## Constraints — hard limits

- **Git, from `policy.git` (`push`, networkOperations `allow`; Rule 5b).**
  - **Packet.** The packet's authoritative copy lives on branch `eb/epic-main-process-cleanup` in the worktree `C:\Projects\Blurby\.worktrees\epic-main-process-cleanup`, created in session 1 from `refs/remotes/origin/main`.
  - **Items.** Each item works on its spec's branch (`eb/cloud-retry-shared-1`, `eb/tts-sidecar-shared-1`, `eb/cleanup-legacy-parsers-1`). Cut it from the then-current `refs/remotes/origin/main` in its own worktree, `C:\Projects\Blurby\.worktrees\<branch name without eb/>`.
  - **Staging.** Stage exact paths only (each spec's staging plan), never `git add .` or `-A`, and never `tests/perf-baseline-results.json`.
  - **Merging.** Merge each item to `main` with `--no-ff` from a clean integration worktree (launch.md GIT WORK), then push. Never use the primary checkout `C:\Projects\Blurby`, which is dirty with unrelated work: never stage, test, merge or restore there.
  - **Never** force-push, rebase, reset, stash or clean. A merge conflict or branch divergence is a BLOCKER(USER).
  - Always write refs in full: `refs/heads/…`, `refs/remotes/origin/…` (a `main/` directory exists).
- **Lane D only.** No file under `src/`, `preload.js` or the shared-core freeze set. No file the READER-MODE-SEPARATION-2 epic owns (its run is paused at an owner gate on `eb/reader-mode-separation-2`; never touch that branch or worktree). Each item's spec lists its own forbidden files; obey them.
- **Never activate MOSS or Pocket**, never change IPC, Kokoro or packaging.
- On Windows, the sidecar test fakes must have **no `pid`** (TTS-SIDECAR spec), or a real `taskkill` runs.
- Item order 1 → 2 → 3. Within TTS-SIDECAR, Task 1 is committed before Task 2 starts (standing rule 37 / SRL-089).
- At most two focused correction attempts per failing gate; then BLOCKER(USER).
- No evidence or archives in `%TEMP%`: anything kept goes in the packet or `C:\Projects\Blurby-artifacts\epic-main-process-cleanup\` (lesson drafted at the 2026-10-09 phase close-out, two prior occurrences).
- Budget: ~3 sessions.

## Non-goals — explicitly out of scope

- TTS-ENGINE-SHARED-1 (still a stub; specified after the sidecar item merges), CLEANUP-MODE-BARREL-1, and anything in READER-MODE-SEPARATION-2
- Changing retry behavior, wrapping the unwrapped cloud calls, adding jitter or logging
- Adding `extractContent` test coverage or removing npm dependencies
- `/pointer-closeout`: the owner runs it after `done.md`; the run only moves items to In Flight

## Autonomy grants — the executor decides alone (log each call in state.md → Decision log)

- Test helper names and internal structure within each spec's prescribed design
- Up to two correction attempts per failing gate
- Creating, pushing and merging (`--no-ff`) the item branches and the packet branch exactly as launch.md defines
- Re-cutting an item branch from a newer `origin/main` if `main` moved before that item started (never after it has commits; then the integration step handles it)
- The Monday transition Queued → In Flight for each item when it starts, through the provider handshake. Call `mutation-plan` only to execute a mutation (LL-130); confirm every plan

## Escalation triggers — STOP and surface to the user

- Any action that is destructive, irreversible or outward-facing beyond the grants
- A row unachievable as written, or a spec contradicting this charter
- CLEANUP-LEGACY-PARSERS-1's re-census finds any non-doc reference (spec failure handling)
- An existing test needs editing to pass (forbidden by every spec)
- A TTS-SIDECAR Task 1 test cannot pass against unmodified code **and** the current behavior looks wrong (record it; never fix behavior in this run)
- A merge conflict; `origin/main` moved and an integration re-test fails; branch divergence
- KF-1 persisting after two re-runs, or any other `npm test` failure after two corrections
- Budget exhausted with rows unmet

When triggered: write a BLOCKER(USER) in the packet's state.md with the exact question; continue any unblocked item (items are file-disjoint, so a blocked item does not block the next one's work, but merges stay in order 1 → 2 → 3); stop cleanly when every front is blocked.

## Assumptions — gaps accepted at launch

| Assumption | Risk if wrong | Guard |
|------------|---------------|-------|
| A1. The three specs and their line references hold on `origin/main` (verified at scaffold: `withRetry` at line 15 in both cloud files; no commits since `cd384b78` touch any edit site) | Wrong edit sites | Each item re-greps its sites before editing (standing rule 36) |
| A2. READER-MODE-SEPARATION-2 may merge to `main` during this run | An integration needs a re-test | The integration step re-tests on the newest `origin/main`; its files are disjoint from these (verified at scaffold) |
| A3. KF-1 flakes `npm test` occasionally | False red | The bounded re-run rule above |
| A4. Fresh worktrees can `npm ci` (network, disk) | Integration blocked | Session 1 baselines `npm ci` + `npm test` in the packet worktree; failure → BLOCKER(USER) |
| A5. The permission mode allows npm, git push and the monday connector unattended | Stall at a prompt | Launch Q1; a stall shows as a journal gap |

## Lessons applied — the project's own history, read before the run

| Lesson | Bears on | Applied as |
|--------|----------|------------|
| LL-095 (force refresh on 401) | C1 | the CLOUD spec's *Done when* 4 and new test 4 (one refresh per 401) |
| LL-112 (extract shared engine code only after both paths are proven and pinned) | S1 | TTS-SIDECAR Task 1 characterization suite committed before extraction |
| LL-088 / SRL-089 (no parallel writers to one file) | Item order, Task 1→2 | Constraint: strict order; one implementer per item |
| LL-130 (mutation-plan opens a recovery record) | Monday In Flight transitions | Grant: plan only to execute, confirm each |
| Standing rule 36 (SRL-086/087, verify state at the moment of consequence) | A1 | Re-grep edit sites and re-census legacy references before editing |
| Drafted 2026-10-09 (not yet recorded): never keep evidence in `%TEMP%` | Evidence storage | Constraint above |
| LL-129, LL-031 | — | Considered; do not apply (no doc transform; no stale-async logic) |
