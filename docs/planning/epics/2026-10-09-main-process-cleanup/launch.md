# Launch — Main-process cleanup

## Walk-away preflight — completed BEFORE the user left

| Check | How | Result |
|-------|-----|--------|
| Paths in the goal exist (absolute) | edit sites on `refs/remotes/origin/main` | PASS (`withRetry` at line 15 in both cloud files; sidecar files and `main/legacy-parsers.js` present), scaffold 2026-10-09 |
| Canonical build/test/check commands run | `npm test`, `npm run build` | 3,342 passed / 133 skipped on the RMS-2 tree (different code); baseline on `origin/main` is P1's first task. KF-1 flake known (charter A3) |
| Credentials live | `gh auth status` | PASS (gorillabrown), 2026-10-09 |
| Remotes/services reachable | `origin`; monday board 18432450217 | PASS |
| Runtime can act unattended | permission mode covers npm, git push, monday connector | **Q1 / A5**: owner confirms |
| Repository detected | remote `origin`, default `main` (write refs in full), primary checkout dirty (never touched); `policy.git` push/allow | PASS |
| Network operations settled | fetch; push item branches, packet branch and `main` (Rule 5b, per item) | Granted (owner, 2026-10-09) |
| Launch-blocking questions answered | below | Q1 open (default A5) |

Readiness: **Specification** PASS (three Full Specs, U9 exit 0 each) · **Prerequisites** PASS (none) · **Repository** PASS · **External register** PASS (all Queued; write-status supported) · **Execution environment** GAP → A5 (unattended permission mode).

### Launch-blocking questions — answers recorded here

- **Q1 (default: charter A5).** Is the permission mode set so npm, git push and the monday connector run without prompts?
  **Answer:** _(pending. Unanswered: proceed; a stall shows up as a journal gap.)_

## Kickoff / resume prompt

```
You are executing the epic EPIC-MAIN-PROCESS-CLEANUP (items CLOUD-RETRY-SHARED-1,
TTS-SIDECAR-SHARED-1, CLEANUP-LEGACY-PARSERS-1). Its authoritative packet is
C:\Projects\Blurby\.worktrees\epic-main-process-cleanup\docs\planning\epics\2026-10-09-main-process-cleanup
(call it PACKET). You may have no memory of prior sessions; the run may be partially complete.

BOOTSTRAP — only if PACKET\state.md does not exist:
  git -C C:\Projects\Blurby fetch origin --prune
  git -C C:\Projects\Blurby worktree add C:\Projects\Blurby\.worktrees\epic-main-process-cleanup -b eb/epic-main-process-cleanup refs/remotes/origin/main
      (branch already exists → do not recreate; add the worktree on the existing branch and journal it)
  git -C C:\Projects\Blurby\.worktrees\epic-main-process-cleanup push -u origin eb/epic-main-process-cleanup
Then read PACKET\state.md and follow its RESUME PROTOCOL exactly before anything else.

The finish line is charter.md's Definition of Done (C1–C2, S1–S2, L1–L2, DINT) and the
completion protocol in PACKET\launch.md. The specs are ROADMAP.md § CLOUD-RETRY-SHARED-1,
§ TTS-SIDECAR-SHARED-1, § CLEANUP-LEGACY-PARSERS-1; they govern. Never touch charter.md.
On an escalation trigger, record a BLOCKER(USER) in PACKET\state.md, continue on any unblocked
item (merges stay in order 1 → 2 → 3), and stop cleanly only when every front is blocked.
Keep durable files distilled. Before ending any work burst, update PACKET\state.md, append
to PACKET\journal.md, and checkpoint per GIT WORK.

GIT WORK — policy push, network allowed. Repository C:\Projects\Blurby, remote origin.
Always write refs in full (refs/heads/…, refs/remotes/origin/…): a main/ directory exists.
The primary checkout C:\Projects\Blurby is dirty with unrelated work: never stage, restore,
clean, test or merge there. Never touch eb/reader-mode-separation-2 or its worktree.

Start an item (once per item, in order):
  git -C C:\Projects\Blurby fetch origin --prune
  git -C C:\Projects\Blurby worktree add C:\Projects\Blurby\.worktrees\<slug> -b eb/<slug> refs/remotes/origin/main
     (<slug> = cloud-retry-shared-1 | tts-sidecar-shared-1 | cleanup-legacy-parsers-1;
      branch exists → resume it, never recreate)
  Monday Queued → In Flight for the item (mutation-plan → connector → readback → mutation-confirm)
Checkpoint on an item branch:
  git add -- <exact paths from the item's spec staging plan>   # never -A or .; never tests/perf-baseline-results.json
  git diff --cached --name-only                                 # must equal the intended set
  git commit -m "EPIC-MAIN-PROCESS-CLEANUP-S<n>: <ITEM-ID>: <what>"
  git push origin eb/<slug>
Integrate an item (only after its C1/S1/L1 rows pass; attempt k = 1, 2, 3):
  git -C C:\Projects\Blurby fetch origin --prune
  git -C C:\Projects\Blurby worktree add C:\Projects\Blurby\.worktrees\mpc-integ-<slug>-k -b eb/mpc-integ-<slug>-k refs/remotes/origin/main
  (in it) git merge --no-ff refs/heads/eb/<slug> -m "Merge eb/<slug>: <item title> (<ITEM-ID>)"   # conflict → BLOCKER(USER)
  (in it) npm ci; npm run typecheck; npm test; npm run build                 # all exit 0 (KF-1 rule in charter)
  (in it) git push origin HEAD:refs/heads/main                               # rejected (main moved) → k+1; after 3 → BLOCKER(USER)
  git ls-remote origin refs/heads/main                                      # must equal that HEAD; record it as the item's merge SHA
Packet checkpoint (in C:\Projects\Blurby\.worktrees\epic-main-process-cleanup):
  git add -- docs/planning/epics/2026-10-09-main-process-cleanup/plan.md docs/planning/epics/2026-10-09-main-process-cleanup/state.md docs/planning/epics/2026-10-09-main-process-cleanup/journal.md
  git commit -m "EPIC-MAIN-PROCESS-CLEANUP-S<n>: packet"; git push origin eb/epic-main-process-cleanup
Never: force-push, rebase, reset --hard, stash, clean, delete a lock file or a worktree.

Run under the virtuoso skill when available; sprint identifier EPIC-MAIN-PROCESS-CLEANUP-S<n>
(n = next session number in PACKET\journal.md).
```

## Goal line — for `/goal`

```
The Electron main process has one shared cloud withRetry and one shared Python sidecar adapter, and no main/legacy-parsers.js, with behavior unchanged and each item merged to main — done only when every Definition-of-Done row in C:\Projects\Blurby\.worktrees\epic-main-process-cleanup\docs\planning\epics\2026-10-09-main-process-cleanup\charter.md passes with fresh evidence and that packet's done.md is published on origin/main; the only other clean stop is every front blocked on a BLOCKER(USER) recorded in that packet's state.md.
```

## Completion protocol — the only way this epic ends as "complete"

1. After L2, in one session: create a fresh worktree at `refs/remotes/origin/main` (`.worktrees/mpc-dint-k`) and run every DINT command. Re-confirm C2, S2 and L2 with `git merge-base --is-ancestor` against `refs/remotes/origin/main`. Paste distilled outputs into PACKET state.md → Evidence. Any failure → not done: journal it and keep working (or BLOCKER).
2. All pass → in the packet worktree:
   - write `done.md` (date, DINT SHA, each item's merge SHA, evidence pointers, caveats, follow-ups: TTS-ENGINE-SHARED-1 specification, extractContent coverage gap);
   - set charter.md `status: complete`;
   - add the final journal entry.

   Commit exactly those files plus state.md and push the packet branch.
3. Publish the packet: a fresh integration worktree from `refs/remotes/origin/main`, `git merge --no-ff refs/heads/eb/epic-main-process-cleanup`. Verify `git diff --name-only refs/remotes/origin/main HEAD` lists only files under `docs/planning/epics/2026-10-09-main-process-cleanup/`. Then `git push origin HEAD:refs/heads/main` (rejected → retry from a fresh fetch, at most 3 times, then BLOCKER).
4. **Stop signal:** `done.md` present on `refs/remotes/origin/main`. A `done.md` that exists only on the packet branch means step 3 is unfinished: resume step 3, do not stop.
5. Report, then stop. The owner runs `/pointer-closeout EPIC-MAIN-PROCESS-CLEANUP`. That one crossing retires all three items (terminal records, monday Completed) and records the lessons.

## Monitoring — for the user

- **Glance:** PACKET\state.md → "Where we are" (phase, DoD, blockers).
- **Catch-up:** the last two PACKET\journal.md entries.
- **Watch `main`:** expect three `Merge eb/<item>` commits, then the packet merge.
- **Intervene when:** a BLOCKER(USER) waits; no journal movement across two sessions; `done.md` on `origin/main` (then run `/pointer-closeout EPIC-MAIN-PROCESS-CLEANUP`).
- **To answer:** fill the `Answer:` slot in PACKET\state.md → Blockers.
- **To change course:** amend PACKET\charter.md, commit it on the packet branch, and journal it.
