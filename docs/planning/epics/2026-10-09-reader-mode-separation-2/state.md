---
epic: reader-mode-separation-2
last_updated: 2026-10-09 06:00
updated_by: session 0 (scaffold, amended pre-launch)
---

# State — single source of current truth

<!-- Rewrite freely; keep under ~80 lines. History belongs in journal.md; the route in
     plan.md; the contract in charter.md. Never end a work burst with this file stale. -->

## RESUME PROTOCOL — no memory of this epic? Do this first, in order

0. **Authoritative copy.** The packet you must read and write lives at
   `C:\Projects\Blurby\.worktrees\reader-mode-separation-2\docs\planning\epics\2026-10-09-reader-mode-separation-2`.
   If you are reading any other copy (the primary checkout's is a frozen launch snapshot),
   and that path exists with a journal entry S1 or later, switch to it now. If it does not
   exist yet, run the bootstrap in your kickoff prompt first, then switch.
1. Read charter.md (the contract), then plan.md (the route), then all of this file, then
   the **last** entry of journal.md.
2. Distrust, then verify: these files are MEMORY; the repo/system is REALITY. Run the
   cheapest check that confirms "Where we are" below (usually the current phase's
   exit-gate command). On conflict: believe reality, fix this file, journal the correction.
3. **Stop signals and finalization:**
   - `done.md` exists here → the epic is finished. Do no work; re-verify its claims and report.
   - `verified.md` exists but `done.md` does not → **resume finalization** (launch.md →
     *Completion and finalization*) at the first stage not marked done in the Finalization
     block below. Check reality first: `git fetch origin`, then if
     `git show refs/remotes/origin/main:docs/planning/epics/2026-10-09-reader-mode-separation-2/done.md`
     succeeds, F3 already published; go to F4. Between F1 and F4, progress and blockers live in the
     untracked `finalization-log.md` here (read it first if present), never in this file.
4. If `last_updated` above is older than the newest journal entry, trust the journal and
   repair this file before working.
5. Append a session-start entry to journal.md, then continue from "Next actions".

## Where we are

```
phase:        P1 — Bootstrap, rebuild B0, prepare and run A1-R
next_action:  bootstrap per the kickoff prompt (verify main has the 2026-10-09 amendment; repair worktree)
blockers:     none
session:      0 of ~14 budgeted
dod:          D1 unmet | D2 unmet | D3 unmet | D4 unmet | D5 unmet | D6 unmet | D7 unmet | D8 unmet | D9 unmet
```

## Next actions — max 5, near horizon only

1. [ ] Bootstrap (kickoff prompt): charter A1 check, `git worktree repair`, journal every uncommitted path (A4), merge `refs/remotes/origin/main` → record **I**, push the run branch, switch to the authoritative packet
2. [ ] Register this packet's files and `verified.md` in `E/paths.json`
3. [ ] Rebuild **B0** under the rebuild policy → `admission/baseline-build-rebuild.json`
4. [ ] Update the harness guards (A7) to the current worktree and B0; commit as test-only; re-read `lessons --open`
5. [ ] Run A1-R (≤ 8 parent tool calls)

## Finalization — stages (launch.md); mark each with date + evidence

```
F1 verified.md committed + pushed:   no
F2 integration merge tested:          no   (attempt #: 0)
F3 published to origin/main:          no
F4 run branch fast-forwarded:         no
F5 done.md present here:              no
```

## Working set — verified facts this epic relies on

| Fact | Value | Verified how / when |
|------|-------|---------------------|
| Repository | `C:\Projects\Blurby` (moved from `C:\Users\estra\Projects\Blurby`; CLAUDE.md's "Local-first" line still names the old path) | `git worktree list`, 2026-10-09 |
| Run worktree | `C:\Projects\Blurby\.worktrees\reader-mode-separation-2`, **link broken** (gitdir → old path); repaired at bootstrap | `git -C … status` fatal, 2026-10-09 |
| Run branch | `eb/reader-mode-separation-2` @ `74883154`, 4 commits after base `1e5485c6`; no application source changed; not yet on origin | `git rev-list`, `git ls-remote`, 2026-10-09 |
| Identities | B0, I, S, F per charter: none recorded yet | — |
| `policy.git` | `push`, networkOperations `allow`, template `eb/{item-id}`; on `main` since 56c97e44 | registry, 2026-10-09 |
| Git gotcha | The repo root has a directory `main/` (Electron main process), so a bare `main` in git is ambiguous. Always write `refs/heads/main` / `refs/remotes/origin/main` | `git ls-files`, 2026-10-09 |
| Test noise | `npm test` rewrites tracked `tests/perf-baseline-results.json`; never stage it, and never run the suite in the primary checkout | `tests/perf-baseline.test.ts:385`, 2026-10-09 |
| Toolchain | node v24.14.0, npm 11.9.0; `gh` logged in (account gorillabrown) | commands, 2026-10-09 |
| G0 automated baseline (historical) | 2026-09-23 on `1e5485c6`: 210 files / 3,058 passed / 133 skipped. To be re-run on B0 | `baseline.json` |
| Old baseline archive | `%TEMP%\blurby-separation2-baseline-build-20260923T212830157Z`: **0 of 21 files left** (temp cleanup). The original manifest `admission/baseline-build.json` is preserved, unchanged | `Get-ChildItem`, 2026-10-09 |
| B0 target location | `C:\Projects\Blurby-artifacts\rms2-baseline-build\` (outside every repo and `%TEMP%`) | owner, 2026-10-09 |
| Harness guards (stale) | `admission/isolated-launch.cjs:6` and `admission/capture.mjs:14` hardcode `C:/Users/estra/Projects/Blurby/.worktrees/reader-mode-separation-2` | `Select-String`, 2026-10-09 |
| Failed A1 profile (preserve) | `C:\Users\estra\AppData\Local\Temp\blurby-reader-mode-separation-2-a1-20260923214002764` | `isolation.json` |
| Live profile (never write) | `C:\Users\estra\AppData\Roaming\blurby\blurby-data\{library,settings,sync-queue}.json` | `isolation.json` |
| Test document | Meditations EPUB SHA-256 `8be2ab1e…6c2beb` = `resources/sample-meditations.epub` | Issue `-2`, 2026-09-23 |
| Renderer start order | Unpackaged Electron needs Vite running first, or the window is blank | Issue `-2` |
| A1 failure facts | `executeJavaScript` returned `window` (not cloneable; fixed in test-only `30b72291`); EPIPE at `main/tts-engine.js:17` `console.error` when the stdout/stderr pipe closed (hypothesis) | Issue `-2` |
| Monday item | 13119306772, Queued, Seq 1 | connector readback, 2026-10-09T03:39Z |

## Blockers

- (none)

## Decision log — append; never silently re-litigate

| # | Date | Decision | Why | Charter authority |
|---|------|----------|-----|-------------------|
| 1 | 2026-10-09 | Run on the existing branch `eb/reader-mode-separation-2`; bring the spec in by merging `origin/main` (`--no-ff`), not by rebasing | Preserves the 2026-09-23 evidence commits | Owner, at scaffold |
| 2 | 2026-10-09 | Pre-launch amendment: authoritative packet in the run worktree; staged finalization; pre-G0 no `src/`; no implementation-wave action ceiling; B0 rebuild policy; identities B0/I/S/F | Adversarial review of the packet (8 findings) | Owner, ROADMAP amendment 2026-10-09 |

## Evidence

- (none yet)
