---
epic: narrate-rebuild
last_updated: 2026-10-12 21:00
updated_by: session 0 (scaffold)
---

# State — single source of current truth

<!-- Rewrite freely; keep under ~80 lines. History belongs in journal.md; the route in
     plan.md; the contract in charter.md. Never end a work burst with this file stale. -->

## RESUME PROTOCOL — no memory of this epic? Do this first, in order

1. Read charter.md (the contract), then plan.md (the route), then all of this file, then
   the **last** entry of journal.md. Read ROADMAP.md § NARRATE-REBUILD-1 once per phase.
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
phase:        P1 — Producer and harness (not opened)
next_action:  open P1: create branch eb/narrate-rebuild-1-p1 per launch.md GIT WORK
blockers:     none
session:      0 of ~14 budgeted
dod:          D1..D13 unmet
```

## Next actions — max 5, near horizon only

1. [ ] Open P1 (branch, worktree, base trailer on the first commit).
2. [ ] Baseline `npm test` / `npm run typecheck` in the P1 worktree; record counts here.
3. [ ] Re-hash the pinned model against the OutsideAudit.10 record (A1).
4. [ ] Copy the model to the artifacts folder and expose the duration tensor (A2).

## Working set — verified facts this epic relies on

| Fact | Value | Verified how / when |
|------|-------|---------------------|
| Repository | `C:\Projects\Blurby`, remote `origin` (github.com/gorillabrown/Blurby), default `main` | `git remote -v`, scaffold 2026-10-12 |
| Phase branches | `eb/narrate-rebuild-1-p<n>` from `origin/main` at phase open; worktree `C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p<n>` | charter Constraints |
| Base at scaffold | `main` @ the packet merge recorded in journal S0 (parent `4254609b`) | scaffold |
| Network | push policy, fetch and push granted for the whole run (`policy.git`: push, networkOperations allow) | registry, scaffold |
| Branch created | not yet — session 1 creates `eb/narrate-rebuild-1-p1` | — |
| Pinned model | `%APPDATA%\Blurby\models\onnx-community\Kokoro-82M-v1.0-ONNX\onnx\model_q4.onnx`, 305,215,966 bytes, outputs only `waveform` — read only | scaffold 2026-10-12 (size); hash: A1 |
| Duration-exposure script | `docs/studies/audit/OutsideAudit.10.2026-10-11/remediation/F2-producer-probe/f2-producer__expose_dur.cjs` — `node <script> <in.onnx> <out.onnx> <tensorName> <elemType 1\|7>`, pure Node | scaffold |
| Artifacts folder | `C:\Projects\Blurby-artifacts\narrate-rebuild-1\` (models\, audio\) — outside repo and profile | owner 2026-10-12 |
| Kokoro facts | 600 samples per duration frame; tokenizer wraps as `[0,…,0]`; kokoro-js truncates at 512 tokens (T2 caps chunks at ~400) | OutsideAudit.10 (HEARSAY until P1) |
| Runtime | Node v24.14.0, npm 11.9.0, kokoro-js 1.2.1 and onnxruntime-node in `node_modules`; `python` (not `python3`, which is the Store alias); no Python onnx module needed | scaffold 2026-10-12 |
| Baseline (main 4254609b) | `npm run typecheck` exit 0. Tracked suite at the removal close-out: 1,955 passed / 1 skipped / 0 failed (134 files). The primary checkout shows 4 extra failing files (moss*, kokoroPairBaseline) — untracked, locally excluded leftovers; measure the baseline in the phase worktree only | scaffold 2026-10-12 |
| Old fixtures | `git show 612d03f5bdadf861a875d76c6260fd8d3a7520aa:tests/fixtures/narration/<file>` | NARRATE-REMOVE-1 close-out |
| Gotchas from the removal | call `ttsCache.init` before any cache use; nothing at startup starts Kokoro; leftover `"narrate"` literals and `audio-truth` exist — census before relying on absence | NARRATE-REMOVE-1 close-out |

## Blockers

- (none)

## Decision log — append; never silently re-litigate

| # | Date | Decision | Why | Charter authority |
|---|------|----------|-----|-------------------|
| 1 | 2026-10-12 | Model copy and audio in `C:\Projects\Blurby-artifacts\narrate-rebuild-1\` | Keeps the owner profile untouched and audio out of the repo | Owner (epic answers) |
| 2 | 2026-10-12 | Merge each phase to `main` at its gate | Small, reviewable landings; later phases build on merged work | Owner (epic answers) |
| 3 | 2026-10-12 | Run as a local session with auto-accept edits | Owner-machine gates (LL-147); no approval stalls | Owner (epic answers) |

## Evidence

- (none yet)
