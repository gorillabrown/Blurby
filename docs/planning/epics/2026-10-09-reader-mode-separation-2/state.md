---
epic: reader-mode-separation-2
last_updated: 2026-10-08 23:55 (host clock)
updated_by: session 1
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
phase:        P2 — Wave A / G0 admission (P1 exit gate passed S1: I, B0, guards, A1-R PASS)
next_action:  integrate census (background worker) → design + run A3 (≤ 35 calls); heard audio → owner gate
blockers:     none yet (heard-audio owner gate expected at A3)
session:      1 of ~14 budgeted
dod:          D1 unmet | D2 unmet | D3 unmet | D4 unmet | D5 unmet | D6 unmet | D7 unmet | D8 unmet | D9 unmet
```

## Next actions — max 5, near horizon only

1. [x] Bootstrap: I = `92dda255`, pushed (S1)
2. [x] Packet files + `verified.md`/`done.md` registered in `E/paths.json` → `epicPacketPaths`
3. [x] B0 rebuilt and validated → `admission/baseline-build-rebuild.json` (byte-identical to the original 21 files)
4. [x] Harness guards (A7) → W path + exact-set B0 check; dry check with negative controls; lessons re-read
5. [x] A1-R PASS 7/8 (`admission/isolation.json`, 5f0608b6); A2 PASS 10/20 (`admission/flow-reproduction.json`, 2529a921)
6. [ ] Integrate the Wave A census (`dependencies.json`, `ownership.json`, `census/`): review, register paths, commit
7. [ ] A3 (≤ 35): fix the non-EPUB fixture (converted import), seed the Kokoro model into the test profile (OBS-A1R-1), build the matrix runner, run EPUB + non-EPUB matrix; heard audio → BLOCKER(USER) checklist

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
| Run worktree | `C:\Projects\Blurby\.worktrees\reader-mode-separation-2`; relinked by `git worktree repair` | S1 |
| Run branch | `eb/reader-mode-separation-2` on origin (lowercase). Locally the loose ref lives under `.git/refs/heads/EB/` (Windows case), so push with `git push origin HEAD:refs/heads/eb/reader-mode-separation-2` | S1 |
| **I** | `92dda255bfad4395600a4371f0406f0f55c92899` (merge of origin/main `aafbb1c9`) | S1, pushed |
| **B0** | `C:\Projects\Blurby-artifacts\rms2-baseline-build\` (21 files, byte-identical to the original manifest); source checkout retained at `C:\Projects\Blurby-artifacts\rms2-b0-checkout` (detached worktree @ `1e5485c6`) | `admission/baseline-build-rebuild.json`, S1 |
| S, F | not yet | — |
| Production inputs in W | Equal to `1e5485c6` (src tree `0c790075` at I); Electron main runs from W during G0 | S1 |
| KF-1 (known flake) | `tests/qwenStreaming.test.js`: load-dependent unhandled rejection (`stream-timeout`, `main/qwen-streaming-engine.js`) after the test ends → `npm test` exit 1 with 0 failed tests. 1 of 3 full B0 runs; 0 of 3 isolated. Watch at D6 | S1 |
| B0 skipped count (D6 bound) | 133 tests / 1 file | `baseline-build-rebuild.json` |
| `policy.git` | `push`, networkOperations `allow`, template `eb/{item-id}`; on `main` since 56c97e44 | registry, 2026-10-09 |
| Git gotcha | The repo root has a directory `main/` (Electron main process), so a bare `main` in git is ambiguous. Always write `refs/heads/main` / `refs/remotes/origin/main` | `git ls-files`, 2026-10-09 |
| Test noise | `npm test` rewrites tracked `tests/perf-baseline-results.json`; never stage it, and never run the suite in the primary checkout | `tests/perf-baseline.test.ts:385`, 2026-10-09 |
| Toolchain | node v24.14.0, npm 11.9.0; `gh` logged in (account gorillabrown) | commands, 2026-10-09 |
| G0 automated baseline (historical) | 2026-09-23 on `1e5485c6`: 210 files / 3,058 passed / 133 skipped. To be re-run on B0 | `baseline.json` |
| Old baseline archive | `%TEMP%\blurby-separation2-baseline-build-20260923T212830157Z`: 0 of 21 files left. `admission/baseline-build.json` preserved, unchanged | 2026-10-09 |
| Harness guards | Updated to `C:/Projects/Blurby/.worktrees/reader-mode-separation-2`; the launcher checks the served build against `baseline-build-rebuild.json` as an exact set; pinned-source checks kept | dry check + negative controls, S1 |
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
| 3 | S1 | Push the run branch with the explicit refspec `HEAD:refs/heads/eb/reader-mode-separation-2` | Local loose ref enumerates as `EB/…` (case-insensitive FS); the named push fails | Grant: pushing the run branch |
| 4 | S1 | Launch Q2/A5 answered yes | Owner set `/goal` and said "proceed without my approval overnight" | Owner message, S1 |
| 5 | S1 | B0 validation PASS despite run-1 `npm test` exit 1 | Exit 1 came from KF-1 (0 failed tests); runs 2–3 exit 0 with identical counts; artifacts byte-identical; no identity, input or behavior difference, so the rebuild-policy trigger ("failed validation") is explained, not met | Charter grants (rebuild B0); escalation trigger evaluated |
| 6 | S1 | A1-R runs as one driver script `admission/a1r-run.ps1` (test-only, registered) | Keeps preview restart, Hidden launch with redirects, capture, graceful close, preview stop and hash checks inside the 8-call budget | Grant: test-only harness under `E/` |
| 7 | S1 | A1-R PASS with OBS-A1R-1 (Kokoro warm-up load error 13) classified as neither isolation nor write-path | Path inside the profile; downloaded model byte-identical to the installed one (SHA-256 `04cf570c…`); live profile unchanged | Amendment 2026-10-08 A1 criteria, evaluated mechanically |
| 8 | S1 | A2 PASS on the EPUB; the legacy inline text fixture is a fixture gap, not a Flow defect | B0 renders every readable doc through foliate ("all docs should be EPUB since EPUB-2B"); inline record → re-import notice | Amendment 2026-09-23 A2 criteria |
| 9 | S1 | A3's non-EPUB rows use a non-EPUB source converted through the app's import path; the launcher seeds the installed Kokoro model into the fresh profile | The only readable non-EPUB route on B0; avoids the fresh-profile concurrent-download race (OBS-A1R-1 recurred in A2) | Grant: test-only harness under `E/` |

## Evidence

- B0: `admission/baseline-build-rebuild.json` (21/21 identical; typecheck/build 0; tests 0 on 2 of 3 runs, KF-1 on run 1)
- A1-R: `admission/isolation.json` (PASS, 7/8). A2: `admission/flow-reproduction.json` (PASS, 10/20)
- Text-file SHA-256 values in those records are over the as-written (CRLF) bytes; git stores LF. Use `git hash-object` / blob ids for canonical comparison
