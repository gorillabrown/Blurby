---
epic: reader-mode-separation-2
last_updated: 2026-10-09 04:30
updated_by: session 0 (scaffold)
---

# State — single source of current truth

<!-- Rewrite freely; keep under ~80 lines. History belongs in journal.md; the route in
     plan.md; the contract in charter.md. Never end a work burst with this file stale. -->

## RESUME PROTOCOL — no memory of this epic? Do this first, in order

1. Read charter.md (the contract), then plan.md (the route), then all of this file, then
   the **last** entry of journal.md.
2. Distrust, then verify: these files are MEMORY; the repo/system is REALITY. Run the
   cheapest check that confirms the "Where we are" block below (usually the current
   phase's exit-gate command). On conflict: believe reality, fix this file, note the
   correction in journal.md.
3. If `done.md` exists in this directory, do not start work — re-verify its claims
   against the charter DoD and report.
4. If `last_updated` above is older than the newest journal entry, trust the journal and
   repair this file before working.
5. Append a session-start entry to journal.md, then continue from "Next actions".

## Where we are

```
phase:        P1 — Reconcile the run, verify assumptions, recover admission (A1-R)
next_action:  confirm GOV-HYGIENE landed on main (charter A1), then repair the run worktree link
blockers:     none (A1 is checked first; if unmet -> BLOCKER(USER))
session:      0 of ~14 budgeted
dod:          D1 unmet | D2 unmet | D3 unmet | D4 unmet | D5 unmet | D6 unmet | D7 unmet | D8 unmet | D9 unmet
```

## Next actions — max 5, near horizon only

1. [ ] Verify charter A1: `main` carries the 2026-10-08 amendment and `policy.git.policy` = push
2. [ ] `git worktree repair C:\Projects\Blurby\.worktrees\reader-mode-separation-2`; then `git -C <wt> status --porcelain` and journal every uncommitted path (A4)
3. [ ] Merge `main` into `eb/reader-mode-separation-2` with `--no-ff`; push the run branch
4. [ ] Re-verify the archived baseline build against `admission/baseline-build.json` (A2); run `lessons --open` (A7)
5. [ ] Run A1-R (≤ 8 parent tool calls) per the ROADMAP 2026-10-08 amendment

## Working set — verified facts this epic relies on

| Fact | Value | Verified how / when |
|------|-------|---------------------|
| Repository | `C:\Projects\Blurby` (moved from `C:\Users\estra\Projects\Blurby`; CLAUDE.md still names the old path) | `git worktree list`, 2026-10-09 |
| Run worktree | `C:\Projects\Blurby\.worktrees\reader-mode-separation-2`, **link broken** (gitdir → old path); needs `git worktree repair` | `git -C … status` fatal, 2026-10-09 |
| Run branch | `eb/reader-mode-separation-2` @ `74883154`, 4 commits after base `1e5485c6`; no application source changed | `git rev-list --count`, 2026-10-09 |
| Remote | `origin`; default `main` (`refs/remotes/origin/main`); run branch **not yet on origin** | `git ls-remote`, 2026-10-09 |
| Network | fetch + push run branch granted; merge/push `main` only after `done.md` | owner, 2026-10-09 |
| Branch created | yes (2026-09-23); session 1 repairs, merges `main`, and pushes it | scaffold |
| `policy.git` | `push`, networkOperations `allow`, branchNameTemplate `eb/{item-id}`. On `main` since 56c97e44 (pushed); `epics` role registered at fdfb658a | docs worktree registry read, 2026-10-09 |
| Lessons | `policy.lessons.idPrefix` = `LL`; canonical index appended (`6c8c747f`); `lessons --open` = 92 live / 8 closed; former duplicate LL-092 (REFACTOR-1B) is indexed as **LL-128** | Issue.GOV-HYGIENE-2026-10-09 execution record, 2026-10-09 |
| Toolchain | node v24.14.0, npm 11.9.0; `gh` logged in (account gorillabrown) | commands, 2026-10-09 |
| G0 automated baseline (pinned base) | typecheck/test/build exit 0; 210 files / 3,058 passed / 133 skipped | `baseline.json`, 2026-09-23 (re-run in P1) |
| Archived baseline build | `C:\Users\estra\AppData\Local\Temp\blurby-separation2-baseline-build-20260923T212830157Z`, exists; 21 files recorded | `Test-Path`, 2026-10-09; hashes HEARSAY until P1 |
| Failed A1 profile (preserve) | `C:\Users\estra\AppData\Local\Temp\blurby-reader-mode-separation-2-a1-20260923214002764` | `isolation.json` |
| Live profile (never write) | `C:\Users\estra\AppData\Roaming\blurby\blurby-data\{library,settings,sync-queue}.json` | `isolation.json` |
| Test document | Meditations EPUB SHA-256 `8be2ab1e…6c2beb` = `resources/sample-meditations.epub` | Issue `-2`, 2026-09-23 |
| Renderer start order | unpackaged Electron needs Vite running first, or the window is blank | Issue `-2` |
| A1 failure facts | `executeJavaScript` returned `window` (not cloneable; fixed in test-only `30b72291`); EPIPE at `main/tts-engine.js:17` `console.error` when stdout/stderr pipe closed (hypothesis) | Issue `-2` |
| Git gotcha | The repo root has a directory `main/` (Electron main process), so a bare `main` in git is ambiguous. Always write `refs/heads/main` / `refs/remotes/origin/main` | GOV-EPICS report + `git ls-files`, 2026-10-09 |
| Monday item | 13119306772, Queued, Seq 1 | connector readback, 2026-10-09T03:39Z |

## Blockers

- (none)

## Decision log — append; never silently re-litigate

| # | Date | Decision | Why | Charter authority |
|---|------|----------|-----|-------------------|
| 1 | 2026-10-09 | Run on the existing branch `eb/reader-mode-separation-2`; bring the spec in by merging `main` (`--no-ff`), not by rebasing | Preserves the 2026-09-23 evidence commits; owner chose "GOV block first" | Owner, at scaffold |

## Evidence

- (none yet)
