# Launch — Separate Page, Focus, Flow, and Narrate runtimes

## Walk-away preflight — completed BEFORE the user left

| Check | How | Result |
|-------|-----|--------|
| Paths in the goal exist (absolute) | `Test-Path` on repo and run worktree | PASS for the repo and worktree directory. **Worktree git link broken** (A3, fixed at bootstrap). **Old baseline archive empty** (A2, B0 rebuilt in P1) |
| Canonical build/test/check commands run | `npm run typecheck`, `npm test`, `npm run build` on `1e5485c6` | PASS 2026-09-23 (`baseline.json`); re-run on B0 in P1 |
| Credentials live | `gh auth status` | PASS (account gorillabrown, keyring) |
| Remotes/services in the DoD reachable | `git remote` → `origin`; monday board 18432450217 via connector | PASS |
| Runtime can act unattended | permission mode covers npm, electron, git push, monday connector | **A5 / Q2**: owner confirms |
| Repository detected | remote `origin`, default `main` (write `refs/heads/main`: a `main/` directory exists), worktrees listed, primary checkout dirty (never touched) | PASS; `policy.git` = push / allow |
| Network operations settled | fetch; push run branch at checkpoints; `main` only in finalization F3 | Granted (owner, 2026-10-09) |
| Launch-blocking questions answered | below | Q1 answered; Q2 open (default A5) |

Readiness, as five findings:

| Finding | Result | Reason |
|---|---|---|
| Specification | PASS | Spec U1–U8 (2026-09-23) plus four amendments; adversarial review findings folded in 2026-10-09; every DoD row has a command or procedure |
| Prerequisites | PASS | READER-ISO-1A to 1E Completed |
| Repository | PASS | Spec, `policy.git` and packet on `main`; worktree relink and harness guard update are P1 steps |
| External register | PASS | Snapshot 2026-10-09T03:40Z; provider supports `write-status` and `record-completion` |
| Execution environment | GAP → A5 | Unattended permission mode unconfirmed; owner needed at audio/live gates by design |

### Launch-blocking questions — answers recorded here

- **Q1 (hard blocker).** Has GOV-HYGIENE run, so `main` carries the spec and `policy.git` = push?
  **Answer:** Yes. GOV-HYGIENE merged 56c97e44; epics registered 48452ba9 (merged fdfb658a); packet refs fixed fae71ebb; pre-launch amendment on `main` with this file.
- **Q2 (default: charter A5).** Is the session's permission mode set so npm, electron, git push and the monday connector run without approval prompts?
  **Answer:** _(pending. Unanswered: proceed; a stall shows up as a journal gap.)_

## Kickoff / resume prompt

Paste into any session — first or fiftieth; it self-orients either way.

```
You are executing the epic READER-MODE-SEPARATION-2. Its authoritative packet is
C:\Projects\Blurby\.worktrees\reader-mode-separation-2\docs\planning\epics\2026-10-09-reader-mode-separation-2
(call it PACKET). You may have no memory of prior sessions; the run may be partially complete.

BOOTSTRAP — only if PACKET\state.md does not exist, or PACKET\journal.md has no S1 entry:
  Read C:\Projects\Blurby\docs\planning\epics\2026-10-09-reader-mode-separation-2\launch.md
  (the launch snapshot) and run "GIT WORK → Bootstrap" below. Then continue from PACKET.
  Never write the launch snapshot.

Then read PACKET\state.md and follow its RESUME PROTOCOL exactly before doing anything else.

The finish line is charter.md's Definition of Done verified on the final candidate,
then launch.md's finalization stages through done.md — nothing else. Plan your own path
within plan.md's phases (log replans), but never touch charter.md. The specification is
ROADMAP.md § READER-MODE-SEPARATION-2 with its four Mid-Dispatch Amendments; the spec governs.

Do not wait on the user. On an escalation trigger (including owner gates: manual G0
checklist, heard audio, G6 live QA, speed-dialog live check), record a BLOCKER(USER) in
state.md with the exact question or checklist, continue on any unblocked front, and stop
cleanly only when every front is blocked.

Keep durable files distilled: conclusions and evidence pointers, never raw logs. Push
noisy exploration into subagents when your runtime offers them.

Before ending any work burst: update PACKET\state.md, append a PACKET\journal.md entry,
and checkpoint per GIT WORK. Disk handoff-ready, always.

GIT WORK — policy push, network allowed. Repository C:\Projects\Blurby, remote origin.
Always write refs in full: refs/heads/main, refs/remotes/origin/main (a main/ directory exists).
Run worktree W = C:\Projects\Blurby\.worktrees\reader-mode-separation-2, branch eb/reader-mode-separation-2.
The primary checkout C:\Projects\Blurby is dirty with unrelated work: never stage, restore,
clean, test or merge there.

Bootstrap (once):
  git -C C:\Projects\Blurby fetch origin --prune
  git -C C:\Projects\Blurby show refs/remotes/origin/main:ROADMAP.md | Select-String "Mid-Dispatch Amendment — 2026-10-09"
                                    # must hit; else BLOCKER(USER) (charter A1), stop
  git -C C:\Projects\Blurby worktree repair W
  cd W
  git branch --show-current         # must print eb/reader-mode-separation-2
  git log -1 --format=%H            # expect 74883154…; journal any difference
  git status --porcelain            # journal EVERY path; preserve all (charter A4)
  git merge --no-ff refs/remotes/origin/main -m "READER-MODE-SEPARATION-2-S1: integrate main (spec amendments, governance, packet)"
                                    # conflict -> STOP, BLOCKER(USER); never resolve by discarding a side
  record I = (git rev-parse HEAD) in PACKET\state.md → Working set and Identities
  git push -u origin eb/reader-mode-separation-2
Every later session:
  cd W
  git branch --show-current         # must print eb/reader-mode-separation-2; else STOP, BLOCKER(USER)
  git log -1 --format=%H            # compare with the last journal entry's Git line, and
  git status --porcelain            # its uncommitted paths. Mismatch: believe the repo, journal it
  git fetch origin --prune
  git rev-list --left-right --count refs/heads/eb/reader-mode-separation-2...refs/remotes/origin/eb/reader-mode-separation-2
                                    # both > 0 -> divergence: STOP, BLOCKER(USER); never rebase.
                                    # behind only -> git merge --ff-only refs/remotes/origin/eb/reader-mode-separation-2
  (origin/main moving is normal: journal it, never merge it in before finalization)
Every checkpoint (not between F1 and F4, see finalization):
  git add -- <exact paths>          # only E/paths.json entries and PACKET files; never -A or .;
                                    # never tests/perf-baseline-results.json
  git diff --cached --name-only     # must equal the intended set
  git commit -m "READER-MODE-SEPARATION-2-S<n>: <what this burst did>"
  git push origin eb/reader-mode-separation-2
  journal Git line: eb/reader-mode-separation-2 @ <sha>; uncommitted: <paths or none>
Never: force-push, rebase, reset --hard, stash, clean, delete a lock file; push main outside F3.

Run this session under the virtuoso skill when available: this packet is your dispatch spec;
sprint identifier READER-MODE-SEPARATION-2-S<n> (n = next session number in PACKET\journal.md).
```

## Goal line — for `/goal`

```
Page, Focus, Flow and Narrate run as independent runtimes with matching contracts, the old shared reader behavior unreachable, every mode's baseline preserved, and the approved speed dialog added — done only when every Definition-of-Done row in C:\Projects\Blurby\.worktrees\reader-mode-separation-2\docs\planning\epics\2026-10-09-reader-mode-separation-2\charter.md passes with fresh evidence on the final candidate and C:\Projects\Blurby\.worktrees\reader-mode-separation-2\docs\planning\epics\2026-10-09-reader-mode-separation-2\done.md exists after publication to origin/main; the only other clean stop is every front blocked on a BLOCKER(USER) recorded in that packet's state.md.
```

## Completion and finalization — the only way this epic ends as "complete"

Stages are resumable. A session determines where it is from **git reality**, not memory:
- F1 is done when `verified.md` is on the run branch.
- F3 is done when `refs/remotes/origin/main` contains `PACKET/done.md`.
- F4 is done when the run branch contains `done.md`.

**Between F1 and F4, commit nothing to the run branch and edit no tracked packet file**, so F4 can fast-forward. Record progress (attempt k, M, step-5 result, push result) and any blocker in the untracked `PACKET/finalization-log.md`; F4 moves its content into the journal, then deletes it.

- **F1 — Verify and checkpoint.** In one session, on F, re-run **every** charter DoD row fresh and paste full outputs into state.md → Evidence. Any row fails ⇒ not verified: journal it, keep working. All pass ⇒ write `PACKET/verified.md` (date, F, B0, I, S, the DoD table with evidence pointers, caveats). Mark F1 in state.md, then commit and push the run branch as a normal checkpoint. Call that commit **V**. `verified.md` is not a stop signal.
- **F2 — Integrate in a clean worktree.** With attempt `k` = 1, 2, 3:
  1. `git -C C:\Projects\Blurby fetch origin --prune`.
  2. `git -C C:\Projects\Blurby worktree add C:\Projects\Blurby\.worktrees\rms2-integration-k -b eb/rms2-integration-k refs/remotes/origin/main`.
  3. In that worktree: `git merge --no-ff refs/heads/eb/reader-mode-separation-2 -m "Merge eb/reader-mode-separation-2: separate Page, Focus, Flow and Narrate runtimes (READER-MODE-SEPARATION-2)"`. A conflict → BLOCKER(USER), stop (keep the worktree).
  4. In the same worktree, finalize the packet copy at `docs/planning/epics/2026-10-09-reader-mode-separation-2/`:
     - write `done.md`: completion date, F, the merge SHA, DoD evidence pointers (from `verified.md`), the known cursor-lead and 1.4x defects handed to their items, and follow-ups;
     - set charter.md `status: complete`;
     - mark F1–F3 in state.md (F3 "published by this commit");
     - append the final journal entry.

     Commit exactly those four files: `READER-MODE-SEPARATION-2: finalize epic (done.md)`. Call it **M**.
  5. In the same worktree: `npm ci`, `npm run typecheck`, `npm test`, `npm run build`. All must exit 0; `npm test` may dirty `tests/perf-baseline-results.json` here, so never stage it. Any failure → do not publish. Keep the worktree. Write the BLOCKER(USER), with the failing output pointer and attempt k, to the **untracked** file `PACKET/finalization-log.md`. Never edit tracked packet files between F1 and F4, or F4's fast-forward will refuse. Then stop.
- **F3 — Publish.** From the integration worktree: `git push origin HEAD:refs/heads/main`. If rejected because `origin/main` moved, start F2 again with k+1. After 3 attempts, write a BLOCKER(USER) to `PACKET/finalization-log.md` and stop. Verify that `git ls-remote origin refs/heads/main` prints M.
- **F4 — Bring the run branch to M.** In W: `git fetch origin --prune`, `git merge --ff-only refs/remotes/origin/main`, `git push origin eb/reader-mode-separation-2`. If ff-only fails, the run branch moved after V, or a tracked packet file is dirty: write a BLOCKER(USER) to `PACKET/finalization-log.md` and stop. Once F4 succeeds, carry any `finalization-log.md` content into the journal as history, then delete that untracked file.
- **F5 — Stop.** `PACKET/done.md` now exists. **That is the stop signal** for any loop, scheduler or `/goal`; never create it any other way. Report:
  - the primary checkout's local `main` lags `origin/main`; the owner fast-forwards it when convenient (`git -C C:\Projects\Blurby merge --ff-only refs/remotes/origin/main`, which may refuse while unrelated dirty files overlap, and that is the owner's call);
  - the owner runs `/pointer-closeout READER-MODE-SEPARATION-2`, which records the monday completion, the terminal record, and the lessons this epic taught (including the GUI-automation candidate).

**Resuming an interrupted F2/F3.** If `eb/rms2-integration-k` holds M, `refs/remotes/origin/main` is an ancestor of M (`git merge-base --is-ancestor refs/remotes/origin/main M`), and `PACKET/finalization-log.md` records step 5 passing for that M, go straight to F3. Otherwise start the next attempt. Never delete an abandoned integration worktree; cleanup is maintenance.

## Monitoring — for the user

- **Glance (10 seconds):** `PACKET\state.md` → "Where we are", plus the Finalization block.
- **Catch-up (2 minutes):** the last two `PACKET\journal.md` entries.
- **Intervene when:** a BLOCKER(USER) is waiting (expect them at G0 manual capture, heard-audio checks, G6 live QA and the speed-dialog check); or the journal shows no movement across two sessions; or `PACKET\done.md` exists (review it, then run `/pointer-closeout`).
- **To answer:** fill the `Answer:` slot in `PACKET\state.md` → Blockers, or fill the checklist file and note "done" in its slot. The next session adopts it.
- **To change course:** amend `PACKET\charter.md` yourself, commit it on the run branch, and add a journal entry so the next session re-anchors.
