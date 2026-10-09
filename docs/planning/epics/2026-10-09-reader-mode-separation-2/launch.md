# Launch — Separate Page, Focus, Flow, and Narrate runtimes

## Walk-away preflight — completed BEFORE the user left

| Check | How | Result |
|-------|-----|--------|
| Paths in the goal exist (absolute) | `Test-Path` on repo, run worktree, archive, failed A1 profile | PASS for the repo, worktree directory and archive; **worktree git link broken** → charter A3 (P1 step) |
| Canonical build/test/check commands run | `npm run typecheck`, `npm test`, `npm run build` on pinned base `1e5485c6` | PASS 2026-09-23 (`baseline.json`: 3,058 passed / 133 skipped). Re-run in P1; not re-run at scaffold |
| Credentials live | `gh auth status` | PASS (account gorillabrown, keyring) |
| Remotes/services in the DoD reachable | `git remote` → `origin`; monday board 18432450217 via connector | PASS (connector write and readback 2026-10-09T03:39Z) |
| Runtime can act unattended | permission mode covers npm, electron, git push, monday connector | **Assumption A5.** Owner confirms the mode before walking away. This scaffold session's auto mode blocked one registry policy write |
| Repository detected | remote `origin`, default `main`, worktrees listed, dirty primary tree reported | PASS. Primary checkout dirty (unrelated; never touched by this run). `policy.git` pending GOV-HYGIENE → charter A1 |
| Network operations settled | fetch and push | **Granted:** fetch; push `eb/reader-mode-separation-2` at checkpoints. Merge/push `main` only after `done.md` |
| Launch-blocking questions answered | below | Q1 open (hard blocker) |

Readiness, as five findings:

| Finding | Result | Reason |
|---|---|---|
| Specification | PASS | Spec U1–U8 passed 2026-09-23; amendments folded in 2026-10-08; every DoD row has a command or procedure |
| Prerequisites | PASS | READER-ISO-1A to 1E Completed in the register |
| Repository | GAP → Q1 | Spec not on `main` until GOV-HYGIENE; worktree relink is a P1 step |
| External register | PASS | Snapshot fresh 2026-10-09T03:40Z; provider supports `write-status` and `record-completion` |
| Execution environment | GAP → A5, A6 | Unattended permission mode unconfirmed; owner needed at audio/live gates by design |

### Launch-blocking questions — answers recorded here

- **Q1 (hard blocker).** Has the GOV-HYGIENE-2026-10-09 CLI block run, including its epic addendum (registers `epics`, commits this packet), so that `main` carries the 2026-10-08 spec and `policy.git` = push?
  **Answer:** Yes — GOV-HYGIENE merged to main at 56c97e44; epics registered at <this commit, filled after STEP 4>.
- **Q2 (default: charter A5).** Is the session's permission mode set so npm, electron, git push and the monday connector run without approval prompts?
  **Answer:** _(pending. Unanswered: proceed; a stall shows up as a journal gap.)_

## Kickoff / resume prompt

Paste into any session — first or fiftieth; it self-orients either way.

```
You are executing the epic at C:\Projects\Blurby\docs\planning\epics\2026-10-09-reader-mode-separation-2.
You may have no memory of prior sessions and the run may be partially complete.
Read state.md and follow its RESUME PROTOCOL exactly before doing anything else.

The finish line is charter.md's Definition of Done — every row verified with fresh
evidence — and nothing else. Keep working until that holds or a charter escalation
trigger fires. Plan your own path within plan.md's phases; replan phases if reality
demands it (log it), but never touch charter.md. The specification is ROADMAP.md
§ READER-MODE-SEPARATION-2 with its three Mid-Dispatch Amendments; the charter does
not restate it, and the spec governs.

Do not wait on the user. If an escalation trigger fires (including an owner gate:
manual G0 checklist, heard audio, G6 live QA, speed-dialog live check), record a
BLOCKER(USER) in state.md with the exact question or checklist, continue on any
unblocked front, and stop cleanly only when every front is blocked.

Keep durable files distilled: conclusions and evidence pointers, never raw logs. Push
noisy exploration into subagents when your runtime offers them.

Before ending any work burst: update state.md, append a journal.md entry, leave the
working tree at a checkpoint as GIT WORK below defines it. Disk handoff-ready, always.

GIT WORK — before the first edit of every session. Filled from policy.git at scaffold.
Repository C:\Projects\Blurby | remote origin | default branch main
Run branch eb/reader-mode-separation-2 (exists; base 1e5485c6, evidence to 74883154)
Worktree C:\Projects\Blurby\.worktrees\reader-mode-separation-2 | policy push | network: fetch + push run branch granted; main only after done.md
Read-only git runs lock-free: GIT_OPTIONAL_LOCKS=0 git --no-optional-locks ...
The primary checkout C:\Projects\Blurby is dirty with unrelated work: never stage, restore, or clean anything there.

First session (state.md Working set says "session 1 repairs, merges main, and pushes"):
  git -C C:\Projects\Blurby log main --oneline --grep "roadmap-review 2026-10-08"   # must hit; else BLOCKER(USER) (charter A1), stop
  git -C C:\Projects\Blurby worktree repair C:\Projects\Blurby\.worktrees\reader-mode-separation-2
  cd C:\Projects\Blurby\.worktrees\reader-mode-separation-2
  git branch --show-current         # must print eb/reader-mode-separation-2
  git log -1 --format=%H            # must be 74883154… ; else journal the difference
  git status --porcelain            # journal EVERY path; preserve all (charter A4)
  git fetch origin --prune
  git rev-parse main origin/main    # must print the same SHA twice (GOV-HYGIENE pushed main); else BLOCKER(USER)
  git merge --no-ff main -m "READER-MODE-SEPARATION-2-S1: bring 2026-10-08 spec and governance from main"
                                    # conflict -> STOP, BLOCKER(USER); never resolve by discarding a side
  git show HEAD:ROADMAP.md | Select-String "Mid-Dispatch Amendment — 2026-10-08"   # must hit
  git push -u origin eb/reader-mode-separation-2
  record "branch repaired + main merged + pushed, session 1" and the merge SHA in state.md
Every later session (verify; never recreate the branch):
  cd C:\Projects\Blurby\.worktrees\reader-mode-separation-2
  git branch --show-current         # must print eb/reader-mode-separation-2; else STOP, BLOCKER(USER)
  git log -1 --format=%H            # compare with the Git line of the last journal entry,
  git status --porcelain            # and with its uncommitted paths. A mismatch: believe
                                    # the repo, journal the difference, then work
  git fetch origin --prune
  git rev-list --left-right --count eb/reader-mode-separation-2...origin/eb/reader-mode-separation-2
                                    # both sides > 0 -> divergence: STOP, BLOCKER(USER); never rebase.
                                    # Behind only: git merge --ff-only origin/eb/reader-mode-separation-2
  git rev-list --count <session-1 merge SHA from state.md>..origin/main
                                    # main moved: journal it and keep working; never merge or rebase to catch up
Every checkpoint:
  git add -- <exact paths>          # only paths in docs/planning/roadmap-reviews/reader-mode-separation-2/paths.json
                                    # or this packet's files; never `git add .` or `-A`
  git diff --cached --name-only     # must equal the intended set
  git commit -m "READER-MODE-SEPARATION-2-S<n>: <what this burst did>"
  git push origin eb/reader-mode-separation-2
  record the Git line in the journal entry: eb/reader-mode-separation-2 @ <sha>; uncommitted: <paths or none>
Never: merge into or push main before done.md; force-push, rebase, reset --hard, stash,
clean, or delete a lock file; delete or reuse the failed A1 profile; write the live profile.

Run this session under the virtuoso skill when it is available: this packet is your
dispatch spec, and your sprint identifier is READER-MODE-SEPARATION-2-S<n>, where n is the
next session number in journal.md.
```

## Goal line — for `/goal`

```
Page, Focus, Flow and Narrate run as independent runtimes with matching contracts, the old shared reader behavior unreachable, every mode's baseline preserved, and the approved speed dialog added — done only when every Definition-of-Done row in C:\Projects\Blurby\docs\planning\epics\2026-10-09-reader-mode-separation-2\charter.md passes with fresh evidence in one session and C:\Projects\Blurby\docs\planning\epics\2026-10-09-reader-mode-separation-2\done.md is written; the only other clean stop is every front blocked on a BLOCKER(USER) recorded in state.md.
```

## Completion protocol — the only way this epic ends as "complete"

1. In one session, on the candidate SHA, re-run **every** charter DoD row fresh; paste full outputs into state.md → Evidence.
2. Any row fails ⇒ not done: journal it, keep working.
3. All rows pass ⇒ write `done.md` in this directory: completion date, the DoD table with per-row evidence pointers, caveats and loose ends (known cursor-lead and 1.4x defects handed to their items), recommended follow-ups. Set charter.md frontmatter `status: complete`.
4. Then, per Rule 5b and the owner's network grant: in the primary checkout, `git merge --no-ff eb/reader-mode-separation-2`. If unrelated dirty files block the merge, STOP and raise a BLOCKER(USER); never clear them. Then run `npm test` on the merge result (exit 0) and `git push origin main`. Record the merge SHA in the final journal entry.
5. Final journal entry, then stop. **`done.md` existing is the stop signal** for any loop or scheduler driving sessions. Never create it under any other circumstances.
6. Close the epic through `/pointer-closeout READER-MODE-SEPARATION-2`, with journal.md and done.md as its evidence. It retires the item, records completion on monday, appends the terminal record, and records what the epic taught (including the GUI-automation candidate lesson), or says why it taught nothing.

## Monitoring — for the user

- **Glance (10 seconds):** state.md → "Where we are": phase, next action, blockers, DoD status.
- **Catch-up (2 minutes):** last two journal.md entries.
- **Intervene when:** a BLOCKER(USER) is waiting in state.md (expect them at G0 manual capture, every heard-audio check, G6 live QA and the speed-dialog live check), or the journal shows no movement across two consecutive sessions, or `done.md` exists (review it).
- **To answer a blocker or launch question:** write your answer inline in its `Answer:` slot (state.md → Blockers, or the launch questions above). For a manual checklist, fill the checklist file itself and note "done" in the Answer slot. The next session adopts it via the resume protocol.
- **To change course:** amend charter.md yourself (you are the only one who may), then add a journal entry noting the amendment so the next session re-anchors.
