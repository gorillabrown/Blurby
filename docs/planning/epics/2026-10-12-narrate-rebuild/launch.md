# Launch — Rebuild Narrate with the cursor attached to the playing word

## Walk-away preflight — completed BEFORE the user left

| Check | How | Result |
|-------|-----|--------|
| Paths in the goal exist (absolute) | `Test-Path` on the repo, the pinned model, the expose script, kokoro-js | PASS — model 305,215,966 bytes; script and kokoro-js 1.2.1 present |
| Canonical build/test/check commands run | `npm run typecheck`; `npm test` on `main` 4254609b | typecheck exit 0. Primary checkout's suite: 1,962 passed / 45 failed, all 45 in 4 untracked, locally excluded files (moss*, kokoroPairBaseline). Tracked suite was 0 failed at the removal close-out → assumption: baseline is measured in the phase worktree (state.md Working set) |
| Credentials live | `gh auth status` | PASS — logged in (gorillabrown) |
| Remotes/services in the DoD reachable | `git fetch origin` | PASS — github.com/gorillabrown/Blurby |
| Runtime can act unattended | local Claude Code session, auto-accept edits (owner 2026-10-12) | PASS — owner gates G1/G2 stop the run by design |
| Repository detected | remote, default branch, worktrees, dirty paths; `policy.git` read | PASS — remote origin, default main, policy push; primary checkout dirty with unrelated files (left alone) |
| Network operations settled | `policy.git.networkOperations: allow` | granted for the whole run |
| Launch-blocking questions answered | Q&A list below | PASS |

### Launch-blocking questions — answers recorded here

- **Q1 (hard blocker).** Where do the durations-exposed model copy and generated audio live?
  **Answer:** `C:\Projects\Blurby-artifacts\narrate-rebuild-1\` (owner, 2026-10-12).
- **Q2 (hard blocker).** Merge each phase, or one merge at the end?
  **Answer:** merge each phase at its gate (owner, 2026-10-12).
- **Q3 (hard blocker).** Session type?
  **Answer:** local session, auto-accept edits (owner, 2026-10-12).

## Kickoff / resume prompt

Paste into any session — first or fiftieth; it self-orients either way.

```
You are executing the epic at C:\Projects\Blurby\docs\planning\epics\2026-10-12-narrate-rebuild.
You may have no memory of prior sessions and the run may be partially complete.
Read state.md and follow its RESUME PROTOCOL exactly before doing anything else.
(Packet files live on main; read them from the current phase worktree once one exists.)

The finish line is charter.md's Definition of Done — every row verified with fresh
evidence — and nothing else. Keep working until that holds or a charter escalation
trigger fires. Plan your own path within plan.md's phases; replan phases if reality
demands it (log it), but never touch charter.md.

Do not wait on the user. If an escalation trigger fires, record a BLOCKER(USER) in
state.md with the exact question, continue on any unblocked front, and stop cleanly
only when every front is blocked. Gates G1 and G2 always stop.

Keep durable files distilled: conclusions and evidence pointers, never raw logs. Push
noisy exploration into subagents. Never modify %APPDATA%\Blurby. Never write the monday
register. Never use the primary checkout C:\Projects\Blurby for runs or gates.

Before ending any work burst: update state.md, append a journal.md entry, leave the
working tree at a checkpoint as GIT WORK below defines it. Disk handoff-ready, always.

GIT WORK — PowerShell 7, before the first edit of every session. From policy.git (push, network allowed).
Repository C:\Projects\Blurby | remote origin | default branch main
Phase branch eb/narrate-rebuild-1-p<n> | worktree C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p<n>
Read-only git runs lock-free: $env:GIT_OPTIONAL_LOCKS=0; git --no-optional-locks ...
Write refs in full (refs/heads/..., refs/remotes/origin/...): a main/ directory exists.

Opening a phase (state.md says its branch is not created yet; the previous phase is merged):
  git -C C:\Projects\Blurby fetch origin --prune
  git -C C:\Projects\Blurby worktree add -b eb/narrate-rebuild-1-p<n> C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p<n> refs/remotes/origin/main
  git -C <worktree> rev-parse HEAD   # the phase base; its first commit's message ends with
                                     # the trailer line: NARRATE-REBUILD-1-P<n>-Base: <that sha>
  record "P<n> branch created, session <s>, base <sha>" in state.md
Every later session (verify; never create the branch again):
  git -C <worktree> branch --show-current   # must print eb/narrate-rebuild-1-p<n>; else STOP, BLOCKER(USER)
  git -C <worktree> log -1 --format=%H      # compare with the Git line of the last journal entry
  git -C <worktree> status --porcelain      # and its uncommitted paths; believe the repo, journal any difference
  git -C <worktree> fetch origin --prune
  git -C <worktree> rev-list --left-right --count eb/narrate-rebuild-1-p<n>...refs/remotes/origin/eb/narrate-rebuild-1-p<n>
                                     # both sides > 0 -> STOP, BLOCKER(USER); never rebase
  the phase base comes from the first commit's trailer, never from git merge-base (LL-144)
Every checkpoint:
  git -C <worktree> add -- <exact paths>    # never `git add .` or -A; never tests/perf-baseline-results.json
  git -C <worktree> diff --cached --name-only   # must list exactly those paths
  git -C <worktree> commit -m "NARRATE-REBUILD-1-S<s>: <what this burst did>"
  git -C <worktree> push origin refs/heads/eb/narrate-rebuild-1-p<n>:refs/heads/eb/narrate-rebuild-1-p<n>
  journal Git line: eb/narrate-rebuild-1-p<n> @ <sha>; uncommitted: <paths or none>
Phase gate passed — publish (one --no-ff merge per phase):
  git -C C:\Projects\Blurby fetch origin --prune
  git -C C:\Projects\Blurby worktree add --detach C:\Projects\Blurby\.worktrees\narrate-rebuild-1-merge-p<n> refs/remotes/origin/main
  git -C C:\Projects\Blurby\.worktrees\narrate-rebuild-1-merge-p<n> merge --no-ff eb/narrate-rebuild-1-p<n> -m "Merge eb/narrate-rebuild-1-p<n>: <phase name>"
                                     # conflict -> git merge --abort, STOP, BLOCKER(USER)
  git -C C:\Projects\Blurby\.worktrees\narrate-rebuild-1-merge-p<n> push origin HEAD:refs/heads/main
                                     # rejected (main moved) -> STOP, BLOCKER(USER); never force
  git -C C:\Projects\Blurby fetch origin
  git -C C:\Projects\Blurby merge-base --is-ancestor <merge sha> refs/remotes/origin/main   # exit 0 or STOP
  record the merge sha in state.md Evidence and plan.md Gate log (never in a file the merge itself lands, LL-148)
  do not touch the primary checkout's branch or files
Completion only — in the P6 worktree, after P6's code merge, once done.md is written:
  git -C <worktree> add -- docs/planning/epics/2026-10-12-narrate-rebuild/done.md docs/planning/epics/2026-10-12-narrate-rebuild/charter.md docs/planning/epics/2026-10-12-narrate-rebuild/state.md docs/planning/epics/2026-10-12-narrate-rebuild/journal.md docs/planning/epics/2026-10-12-narrate-rebuild/plan.md
  git -C <worktree> diff --cached --name-only   # must list exactly those paths
  git -C <worktree> commit -m "NARRATE-REBUILD-1: completion record"
  git -C <worktree> diff --name-only refs/remotes/origin/main...HEAD -- . ":(exclude)docs/planning/epics/2026-10-12-narrate-rebuild"
                                     # must print nothing; any path -> STOP, BLOCKER(USER)
  publish it with the "Phase gate passed" lines, merge message "Merge eb/narrate-rebuild-1-p6: completion record"
  git -C <merge worktree> diff --name-only HEAD^1 HEAD -- . ":(exclude)docs/planning/epics/2026-10-12-narrate-rebuild"
                                     # before the push: must print nothing; any path -> STOP
Never: force-push, rebase, reset, stash, clean, delete a lock file, or commit to main directly.

Run this session under the virtuoso skill when it is available: this packet is your
dispatch spec, and your sprint identifier is NARRATE-REBUILD-1-S<n>, where n is the next
session number in journal.md.
```

## Goal line — for `/goal`

```
Rebuild Narrate as a fourth independent reading mode whose cursor is the word at the current playback sample from an exact, proven Kokoro word table, with no estimated timing and Page/Focus/Flow unchanged — done only when every Definition-of-Done row in C:\Projects\Blurby\docs\planning\epics\2026-10-12-narrate-rebuild\charter.md passes with fresh evidence in one session and C:\Projects\Blurby\docs\planning\epics\2026-10-12-narrate-rebuild\done.md is written; the only other clean stop is every front blocked on a BLOCKER(USER) recorded in state.md.
```

## Completion protocol — the only way this epic ends as "complete"

1. In one session, re-run **every** charter DoD row fresh; paste full outputs into
   state.md → Evidence.
2. Any row fails ⇒ not done: journal it, keep working.
3. All rows pass ⇒ write `done.md` in this directory — completion date, the DoD table
   with per-row evidence pointers, caveats and loose ends, recommended follow-ups — and
   set charter.md frontmatter `status: complete`.
4. Write the final journal entry, then carry the record to `main` as one docs-only commit
   after P6's code merge, never folded into it, merged with `--no-ff` and checked before
   and after the merge to touch only this directory (GIT WORK → Completion only).
   `/pointer-closeout` checks that done.md is on `main` before it crosses.
5. Stop. **`done.md` existing is the stop signal** for any loop or scheduler driving
   sessions. Never create it under any other circumstances.
6. Close the epic through `/pointer-closeout NARRATE-REBUILD-1`, with journal.md and done.md
   as its evidence; that ceremony records the lessons and closes the register item.

## Monitoring — for the user

- **Glance (10 seconds):** state.md → "Where we are" block: phase, next action,
  blockers, DoD status.
- **Catch-up (2 minutes):** last two journal.md entries.
- **Intervene when:** a BLOCKER(USER) is waiting in state.md (G1 and G2 always raise one),
  or the journal shows no movement across two consecutive sessions, or `done.md` exists.
- **To answer a blocker:** write your answer inline in its `Answer:` slot in state.md on
  the current phase branch — the next session adopts it via the resume protocol.
- **To change course:** amend charter.md yourself (you are the only one who may), then
  add a journal entry noting the amendment so the next session re-anchors.
