# Launch — Blurby Business: a walled-off PDF viewer and editor

## Walk-away preflight — completed BEFORE the user left

Scaffolded on Rodney (ARM64, the coordination machine). The run executes on RodneySr (x64,
the quiet machine), which this machine cannot reach, so the RodneySr rows are charter
assumptions, and the first session checks them.

| Check | How | Result |
|-------|-----|--------|
| Specification — every DoD row verifiable | each row names a command or check with an exact exit code; Phase 1 rows are written and dry-run against the base in `phase1-specs.md` (rubric v1.2 PASS, 2026-10-30) | PASS |
| Prerequisites | register snapshot 2026-10-30T20:47:30Z: BLURBY-BUSINESS-1 Queued, `Path: epic`, Prerequisites cleared by Blurby.Roadmap. APP-TABS-1 is a merge-order dependency (In Flight); LIBRARY-COMPLETION-VISIBILITY-1 is a start gate (In Flight, exclusive window). Both are carried in charter Constraints. | PASS with start gate (charter Constraints; escalation trigger) |
| Paths in the goal exist (absolute) | `C:\Projects\bb-business` is created by the first session; the cited source files exist on `origin/main` @ `5d07b515` | charter assumption "RodneySr readiness" (first session) |
| Canonical build/test/check commands run | `npm test` / `npm run typecheck` / `npm run build`: last full run 2,452 passed / 0 failed on `36ac7466` (gate (1) run 4, RodneySr) | PASS (historical); the first session re-baselines |
| Credentials live | `origin` is the private GitHub repo; RodneySr pushed `eb/` branches on 2026-10-30 | charter assumption "RodneySr readiness" (the first session pushes the branch) |
| Remotes/services in the DoD reachable | `origin` only; no runtime service; npm registry for `npm ci` | PASS on Rodney; assumption on RodneySr |
| Runtime can act unattended | RodneySr session under Blurby.Brain's direction (memory: Brain1 directs RodneySr) | charter assumption "RodneySr readiness" — Brain confirms the mode before launch (Q2) |
| Repository detected | remote `origin`, default `main`, `policy.git` = push, worktree-aware; scaffold worktree `C:\Projects\Blurby-wt-bb-charter`; the Rodney main checkout has unrelated dirty paths (not touched) | PASS — remote origin, default main, policy push |
| Network operations settled | `policy.git.networkOperations: allow` | granted for the whole run |
| Launch-blocking questions answered | below | Q1 is a start gate the run checks itself; Q2 is pending Brain |

### Launch-blocking questions — answers recorded here

- **Q1 (hard blocker; the run checks it itself).** Is LIBRARY-COMPLETION-VISIBILITY-1's
  exclusive source/test window closed? If not, the first session raises BLOCKER(USER),
  does only non-editing discovery, and stops cleanly.
  **Answer:** _(pending — read from the register at the first session)_
- **Q2 (default: launch on RodneySr in a session Blurby.Brain directs, with permissions
  that cover git, npm, node, electron-builder and PowerShell without prompts).** Will
  Blurby.Brain launch and host the run on RodneySr in that mode?
  **Answer:** _(pending)_

## Kickoff / resume prompt

Paste into any session — first or fiftieth; it self-orients either way. It carries the
run's git work, so one paste carries both the git work and the epic's instructions.

```
You are executing the epic at C:\Projects\bb-business\docs\planning\epics\2026-10-30-blurby-business.
You may have no memory of prior sessions and the run may be partially complete.
Read state.md and follow its RESUME PROTOCOL exactly before doing anything else.

The finish line is charter.md's Definition of Done — every row verified with fresh
evidence — and nothing else. Keep working until that holds or a charter escalation
trigger fires. Plan your own path within plan.md's phases; replan phases if reality
demands it (log it), but never touch charter.md.

Do not wait on the user. If an escalation trigger fires, record a BLOCKER(USER) in
state.md with the exact question, continue on any unblocked front, and stop cleanly
only when every front is blocked. Technical questions go to Blurby.Brain (CLAUDE.md rule
11); design and functionality questions are the owner's and become BLOCKER(USER).

Keep durable files distilled: conclusions and evidence pointers, never raw logs. Push
noisy exploration into subagents when your runtime offers them.

Before ending any work burst: update state.md, append a journal.md entry, leave the
working tree at a checkpoint as GIT WORK below defines it. Disk handoff-ready, always.

GIT WORK — before the first edit of every session. Filled from policy.git at scaffold.
Repository C:\Projects\bb-business (worktree of C:\Projects\bq-main, RodneySr) | remote origin | default branch main
Run branch eb/blurby-business-1 from origin/main (scaffold base 5d07b515) | policy push | network granted
Shell: PowerShell 7. Read-only git runs lock-free: git --no-optional-locks ...
Never touch C:\Projects\bq-main's detached HEAD (36ac7466) or its stash@{0}.

First session (state.md's Working set says the branch is not created yet):
  git -C C:\Projects\bq-main --no-optional-locks status --porcelain   # report; touch nothing
  git -C C:\Projects\bq-main fetch origin --prune
  git -C C:\Projects\bq-main worktree add -b eb/blurby-business-1 C:\Projects\bb-business origin/main
  Set-Location C:\Projects\bb-business
  Test-Path docs\planning\epics\2026-10-30-blurby-business\charter.md   # False -> STOP, BLOCKER(USER)
  git merge-base --is-ancestor 5d07b515 HEAD   # non-zero -> STOP, BLOCKER(USER)
  git push -u origin HEAD:refs/heads/eb/blurby-business-1
  npm ci                            # then record "branch created, session 1" and the base sha in state.md
Every later session (verify the branch; never create it again):
  Set-Location C:\Projects\bb-business
  git branch --show-current         # must print eb/blurby-business-1; anything else -> STOP, BLOCKER(USER)
  git log -1 --format=%H            # compare with the Git line of the last journal entry,
  git status --porcelain            # and with its uncommitted paths. A mismatch: believe
                                    # the repo, journal the difference, then work
  git fetch origin --prune
  git rev-list --left-right --count eb/blurby-business-1...origin/eb/blurby-business-1
                                    # both sides > 0 is divergence -> STOP, BLOCKER(USER);
                                    # never rebase. Behind only: git merge --ff-only
  git rev-list --count <base sha from state.md>..origin/main   # the base moved: journal it
                                    # and keep working; never rebase or merge to catch up
Every checkpoint:
  git add -- <exact paths>          # never `git add .` or `-A`; unrelated paths stay out
  git commit -m "BLURBY-BUSINESS-1-S<n>: <what this burst did>"
  git push origin HEAD:refs/heads/eb/blurby-business-1
  record the Git line in the journal entry: eb/blurby-business-1 @ <sha>; uncommitted: <paths or none>
The run never merges into main: Blurby.Roadmap merges on its go after Blurby.Brain's
package confirmation, and the completion record rides on that merge.
Never: force-push, rebase, reset --hard, stash, clean, or delete a lock file.

Run this session under the virtuoso skill when it is available: this packet is your
dispatch spec, and your dispatch identifier is BLURBY-BUSINESS-1-S<n>, where n is the next session
number in journal.md. Before the first edit, title this session
BLURBY-BUSINESS-1-S<n> — [phase name], the name of the phase state.md names as current (the text
after `P1 — `, without the phase id), by the first means
the host offers: a session-title tool, else a title command printed for the user to run,
else that title as your first visible line. Then say whether Remote Control is on for this
session. When it is off, print the one step that turns it on (the host's switch or
command); call a Remote Control tool only when the user asked for it; never turn it off.
A host with no switch gets one line saying so.
```

## Goal line — for `/goal`

```
Blurby Business is a walled-off Windows PDF viewer and editor, the registered .pdf handler, delivering every in-scope matrix row with explicit-Save-only writes and a confirm-only Library bridge — done only when every Definition-of-Done row in C:\Projects\bb-business\docs\planning\epics\2026-10-30-blurby-business/charter.md passes with fresh evidence in one session and C:\Projects\bb-business\docs\planning\epics\2026-10-30-blurby-business/done.md is written; the only other clean stop is every front blocked on a BLOCKER(USER) recorded in state.md.
```

## Completion protocol — the only way this epic ends as "complete"

1. In one session, re-run **every** charter DoD row fresh; paste full outputs into
   state.md → Evidence.
2. Any row fails ⇒ not done: journal it, keep working.
3. All rows pass ⇒ write `done.md` in this directory — completion date, the DoD table
   with per-row evidence pointers, a "Package verification" section, caveats and loose
   ends (the arm64 native launch on Rodney at merge time; the owner's checks for release
   gate (2): Acrobat display of saved annotations, signatures and forms, the "Open with →
   Always" choice, and the look-and-feel review), recommended follow-ups — and set
   charter.md frontmatter `status: complete`.
4. Write the final journal entry, then commit done.md, charter.md, state.md and
   journal.md (and plan.md if it changed) on `eb/blurby-business-1` as one docs-only
   commit, and push it. The run does not merge its code, so this record rides on
   Blurby.Roadmap's `--no-ff` merge of the branch. `/dispatch-closeout` checks that done.md
   is on `main` before it crosses.
5. Stop. **`done.md` existing is the stop signal** for any loop or scheduler driving
   sessions: check it before launching another session. Never create it under any other
   circumstances.
6. Close the epic through `/dispatch-closeout BLURBY-BUSINESS-1`, with journal.md and
   done.md as its evidence. That ceremony records what the epic taught in the registered
   `lessons` role, or says why it taught nothing.

## Monitoring — for the user

- **Glance (10 seconds):** state.md → "Where we are" block: phase, next action,
  blockers, DoD status.
- **Catch-up (2 minutes):** last two journal.md entries.
- **Intervene when:** a BLOCKER(USER) is waiting in state.md, or the journal shows no
  movement across two consecutive sessions, or `done.md` exists (review it).
- **To answer a blocker or launch question:** write your answer inline in its `Answer:`
  slot (state.md → Blockers, or the launch questions above) — the next session adopts it
  via the resume protocol.
- **To change course:** amend charter.md yourself (you are the only one who may), then
  add a journal entry noting the amendment so the next session re-anchors.
- **Where to look:** the packet on the run branch is current
  (`origin/eb/blurby-business-1`); the copy on `main` is the scaffold until the merge.
